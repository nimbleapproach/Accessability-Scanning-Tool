import { expect, test } from '@playwright/test';
import { AccessibilityTestUtils } from './utils/accessibility-helpers';
import { PageListCache } from './utils/page-list-cache';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';

// Helper function to get viewport information (Chrome-only)
function getViewportInfo(page: any): string {
  const viewport = page.viewportSize();
  if (!viewport) return 'Desktop Chrome (1280x720)';

  const width = viewport.width;
  const height = viewport.height;
  return `Desktop Chrome (${width}x${height})`;
}

test.describe('Visual Accessibility Analysis', () => {
  let accessibilityUtils: AccessibilityTestUtils;

  test.beforeEach(async ({ page, browserName }) => {
    accessibilityUtils = new AccessibilityTestUtils(page);

    // Set browser context information
    (page as any).browserName = browserName;
    (page as any).viewportInfo = getViewportInfo(page);
  });

  test('@accessibility @visual @parallel Comprehensive visual accessibility analysis across all pages', async ({
    page,
    browserName,
  }) => {
    console.log('🔍 Starting comprehensive visual accessibility analysis...');
    console.log(`🌐 Browser: ${browserName}`);
    console.log(`📱 Viewport: ${getViewportInfo(page)}`);

    const startTime = Date.now();

    // Step 1: Load cached page list (pre-crawl should have run first)
    console.log('\n📡 Phase 1: Loading cached page list...');
    const cachedPageList = PageListCache.loadPageList();

    if (!cachedPageList) {
      throw new Error(
        'No cached page list found. Please run pre-crawl first: npm run audit:pre-crawl'
      );
    }

    const pages = cachedPageList.pages;
    console.log(`✅ Using cached page list for visual analysis!`);
    console.log(`📊 Found ${pages.length} pages for visual testing`);
    console.log(`📅 Cache created: ${new Date(cachedPageList.timestamp).toLocaleString()}`);
    console.log(`📈 Pages by depth:`, cachedPageList.summary.pagesByDepth);

    // Validate we found pages
    expect(pages.length).toBeGreaterThan(0);

    // Step 2: Run visual accessibility analysis on all pages
    console.log('\n📸 Phase 2: Running visual accessibility analysis on all discovered pages...');

    const visualResults = [];
    const urls = pages.map(p => p.url);

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`📸 Visual analysis ${i + 1}/${urls.length}: ${url}`);

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }); // Faster loading

        // Run color contrast specific analysis
        console.log(`   🎨 Running color contrast analysis...`);
        const colorContrastResult = await accessibilityUtils.checkColorContrast();
        const colorContrastViolations = await accessibilityUtils.processViolations(
          colorContrastResult.violations,
          false // Disable screenshots for performance - we already take full page screenshot
        );

        // Get page analysis info
        const pageTitle = await page.title();
        const pageDescription = await page
          .getAttribute('meta[name="description"]', 'content')
          .catch(() => null);
        const pageLanguage = await page.getAttribute('html', 'lang').catch(() => null);

        // Take full page screenshot for visual reference
        const screenshotPath = path.join(
          process.cwd(),
          'playwright',
          'accessibility-reports',
          'parallel-analysis',
          'screenshots',
          `page-${i + 1}-${url.replace(/[^a-z0-9]/gi, '_')}.png`
        );
        const screenshotDir = path.dirname(screenshotPath);
        if (!existsSync(screenshotDir)) {
          mkdirSync(screenshotDir, { recursive: true });
        }

        try {
          await page.screenshot({
            path: screenshotPath,
            fullPage: false, // Use viewport screenshot for better performance
            timeout: 5000, // Reduced timeout
          });
          console.log(`   📸 Page screenshot saved: ${screenshotPath}`);
        } catch (screenshotError) {
          const errorMessage =
            screenshotError instanceof Error ? screenshotError.message : String(screenshotError);
          console.warn(`   ⚠️ Failed to capture screenshot for ${url}:`, errorMessage);
        }

        // Lightweight visual analysis (just count key elements)
        const visualElements = await page.evaluate(() => {
          const elements = [];

          // Check for images without alt text (limit to first 20 for performance)
          const images = Array.from(document.querySelectorAll('img')).slice(0, 20);
          images.forEach((img, index) => {
            if (!img.alt) {
              elements.push({
                type: 'image',
                issue: 'missing-alt-text',
                selector: `img:nth-child(${index + 1})`,
                src: img.src.substring(0, 100), // Limit URL length
              });
            }
          });

          // Simplified contrast check (just count elements, don't analyze each one)
          const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button');
          const potentialContrastCount = Math.min(textElements.length, 100); // Cap at 100 for performance

          // Add summary element instead of individual analysis
          if (potentialContrastCount > 0) {
            elements.push({
              type: 'summary',
              issue: 'potential-contrast-count',
              count: potentialContrastCount,
              message: `Found ${potentialContrastCount} text elements that may need contrast analysis`,
            });
          }

          return elements;
        });

        visualResults.push({
          url: url,
          timestamp: new Date().toISOString(),
          browser: browserName,
          viewport: getViewportInfo(page),
          tool: 'visual-analysis',
          pageInfo: {
            title: pageTitle,
            description: pageDescription,
            language: pageLanguage,
          },
          screenshot: screenshotPath,
          colorContrastViolations,
          visualElements,
          summary: {
            totalViolations: colorContrastViolations.length,
            criticalViolations: colorContrastViolations.filter(v => v.impact === 'critical').length,
            seriousViolations: colorContrastViolations.filter(v => v.impact === 'serious').length,
            moderateViolations: colorContrastViolations.filter(v => v.impact === 'moderate').length,
            minorViolations: colorContrastViolations.filter(v => v.impact === 'minor').length,
            visualElementIssues: visualElements.length,
            missingAltText: visualElements.filter(e => e.issue === 'missing-alt-text').length,
            potentialContrastIssues: visualElements.filter(e => e.issue === 'potential-contrast')
              .length,
          },
        });

        console.log(
          `   ✅ Found ${colorContrastViolations.length} color contrast violations, ${visualElements.length} visual issues`
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`   ⚠️ Failed to analyze ${url}:`, errorMessage);
        visualResults.push({
          url: url,
          timestamp: new Date().toISOString(),
          browser: browserName,
          viewport: getViewportInfo(page),
          tool: 'visual-analysis',
          error: errorMessage,
          pageInfo: {},
          colorContrastViolations: [],
          visualElements: [],
          summary: {
            totalViolations: 0,
            criticalViolations: 0,
            seriousViolations: 0,
            moderateViolations: 0,
            minorViolations: 0,
            visualElementIssues: 0,
            missingAltText: 0,
            potentialContrastIssues: 0,
          },
        });
      }

      // Small delay between pages
      await page.waitForTimeout(500); // Reduced delay for faster execution
    }

    // Step 3: Save results to shared data file
    console.log('\n💾 Phase 3: Saving visual analysis results...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(
      process.cwd(),
      'playwright',
      'accessibility-reports',
      'parallel-analysis'
    );

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const visualResultsFile = path.join(outputDir, `visual-results-${timestamp}.json`);
    writeFileSync(
      visualResultsFile,
      JSON.stringify(
        {
          tool: 'visual-analysis',
          timestamp,
          browser: browserName,
          viewport: getViewportInfo(page),
          totalPages: visualResults.length,
          results: visualResults,
          summary: {
            totalViolations: visualResults.reduce((sum, r) => sum + r.summary.totalViolations, 0),
            criticalViolations: visualResults.reduce(
              (sum, r) => sum + r.summary.criticalViolations,
              0
            ),
            seriousViolations: visualResults.reduce(
              (sum, r) => sum + r.summary.seriousViolations,
              0
            ),
            moderateViolations: visualResults.reduce(
              (sum, r) => sum + r.summary.moderateViolations,
              0
            ),
            minorViolations: visualResults.reduce((sum, r) => sum + r.summary.minorViolations, 0),
            totalVisualElementIssues: visualResults.reduce(
              (sum, r) => sum + r.summary.visualElementIssues,
              0
            ),
            totalMissingAltText: visualResults.reduce(
              (sum, r) => sum + r.summary.missingAltText,
              0
            ),
            totalPotentialContrastIssues: visualResults.reduce(
              (sum, r) => sum + r.summary.potentialContrastIssues,
              0
            ),
          },
        },
        null,
        2
      )
    );

    console.log(`✅ Visual analysis results saved to: ${visualResultsFile}`);

    // Performance summary
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    const avgTimePerPage = Math.round(duration / visualResults.length);

    console.log('\n='.repeat(60));
    console.log('VISUAL ANALYSIS SUMMARY');
    console.log('='.repeat(60));
    console.log(`🔍 Tool: Visual Analysis`);
    console.log(`📊 Pages Analyzed: ${visualResults.length}`);
    console.log(
      `🚨 Total Violations: ${visualResults.reduce((sum, r) => sum + r.summary.totalViolations, 0)}`
    );
    console.log(
      `📸 Visual Element Issues: ${visualResults.reduce((sum, r) => sum + r.summary.visualElementIssues, 0)}`
    );
    console.log(
      `🖼️  Missing Alt Text: ${visualResults.reduce((sum, r) => sum + r.summary.missingAltText, 0)}`
    );
    console.log(
      `🎨 Potential Contrast Issues: ${visualResults.reduce((sum, r) => sum + r.summary.potentialContrastIssues, 0)}`
    );
    console.log(`⏱️  Total Time: ${duration} seconds`);
    console.log(`📈 Average Time per Page: ${avgTimePerPage} seconds`);
    console.log(`💾 Results File: ${visualResultsFile}`);
    console.log('='.repeat(60));

    // Validate we got results
    expect(visualResults.length).toBeGreaterThan(0);
    expect(visualResultsFile).toBeTruthy();

    console.log('✅ Visual analysis completed successfully!');
  });
});
