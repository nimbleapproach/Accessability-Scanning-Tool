import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export interface CachedPageList {
  siteUrl: string;
  timestamp: string;
  crawlOptions: {
    maxPages: number;
    maxDepth: number;
    delayBetweenRequests: number;
  };
  pages: Array<{
    url: string;
    title: string;
    status: number;
    depth: number;
    foundOn: string;
  }>;
  summary: {
    totalPages: number;
    pagesByDepth: Record<number, number>;
    crawlDuration: number;
  };
}

export class PageListCache {
  private static readonly CACHE_DIR = path.join(
    process.cwd(),
    'playwright',
    'accessibility-reports',
    'page-cache'
  );
  private static readonly CACHE_FILE = path.join(PageListCache.CACHE_DIR, 'page-list.json');

  static ensureCacheDir(): void {
    if (!existsSync(PageListCache.CACHE_DIR)) {
      mkdirSync(PageListCache.CACHE_DIR, { recursive: true });
    }
  }

  static savePageList(cachedPageList: CachedPageList): void {
    console.log('💾 Saving page list to cache...');
    PageListCache.ensureCacheDir();
    writeFileSync(PageListCache.CACHE_FILE, JSON.stringify(cachedPageList, null, 2));
    console.log(`✅ Page list cached: ${cachedPageList.pages.length} pages saved`);
  }

  static loadPageList(): CachedPageList | null {
    if (!existsSync(PageListCache.CACHE_FILE)) {
      console.log('⚠️  No cached page list found');
      return null;
    }

    try {
      const cached = JSON.parse(readFileSync(PageListCache.CACHE_FILE, 'utf8'));
      console.log(`✅ Loaded cached page list: ${cached.pages.length} pages`);
      console.log(`📅 Cache created: ${new Date(cached.timestamp).toLocaleString()}`);
      return cached;
    } catch (error) {
      console.warn('⚠️  Failed to load cached page list:', error);
      return null;
    }
  }

  static isCacheValid(maxAgeMinutes: number = 60): boolean {
    const cached = PageListCache.loadPageList();
    if (!cached) return false;

    const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
    const maxAge = maxAgeMinutes * 60 * 1000;

    const isValid = cacheAge < maxAge;

    if (!isValid) {
      console.log(
        `⏰ Cache expired (${Math.round(cacheAge / 1000 / 60)} minutes old, max ${maxAgeMinutes} minutes)`
      );
    }

    return isValid;
  }

  static clearCache(): void {
    if (existsSync(PageListCache.CACHE_FILE)) {
      require('fs').unlinkSync(PageListCache.CACHE_FILE);
      console.log('🗑️  Page list cache cleared');
    }
  }

  static getCacheInfo(): string {
    if (!existsSync(PageListCache.CACHE_FILE)) {
      return 'No cache found';
    }

    const cached = PageListCache.loadPageList();
    if (!cached) return 'Cache corrupted';

    const age = Math.round((Date.now() - new Date(cached.timestamp).getTime()) / 1000 / 60);
    return `${cached.pages.length} pages, ${age} minutes old`;
  }
}
