# 🤖 AI Development Guide

## 🎯 Purpose

This guide is specifically designed to help AI tools (like Cursor, GitHub Copilot, etc.) understand the accessibility testing codebase and prevent breaking changes during development. Use this guide before making any modifications to the codebase.

## 📚 Reference Documents

Before making any changes, **ALWAYS** consult these documents:

1. **`DEPENDENCY_MAP.md`** - Complete dependency relationships and import patterns
2. **`ARCHITECTURE_DIAGRAM.md`** - Visual system architecture and data flow
3. **`QUICK_REFERENCE.md`** - Fast answers to common questions and operations
4. **`PROJECT_OVERVIEW.md`** - High-level project understanding
5. **`tests/e2e/README.md`** - E2E testing strategy and coverage plan
6. **`README.md`** - User-facing documentation and features
7. **`.github/README.md`** - GitHub Actions CI/CD workflows documentation

## 🚨 Critical Rules (NEVER BREAK)

### 1. Singleton Services
```typescript
// ✅ ALWAYS use getInstance()
const errorHandler = ErrorHandlerService.getInstance();
const configService = ConfigurationService.getInstance();

// ❌ NEVER create new instances
const errorHandler = new ErrorHandlerService(); // BREAKS EVERYTHING
```

### 2. Web Interface Architecture
```typescript
// ✅ Web server uses existing services
const orchestrator = new WorkflowOrchestrator();
const result = await orchestrator.runAccessibilityAudit(url, options);

// ✅ API endpoints return consistent JSON responses
res.json({
  success: true,
  data: result
});

// ❌ DON'T create new business logic in web server
// Use existing services and orchestrators
```

### 3. Import Patterns
```typescript
// ✅ Use @/ alias for src/ imports
import { ErrorHandlerService } from '@/utils/services/error-handler-service';

// ✅ Use relative paths for same directory level
import { ConfigurationService } from '../services/configuration-service';

// ✅ Use relative paths for core types
import { PageInfo, AnalysisResult } from '../../core/types/common';
```

### 4. Cleanup Operations
```typescript
// ✅ CORRECT - Use WorkflowOrchestrator cleanup
const orchestrator = new WorkflowOrchestrator();
await orchestrator['cleanupReportsDirectory']();

// ✅ CORRECT - Web server automatically includes cleanup
// runFullSiteScanWithProgress() and runSinglePageScanWithProgress()
// both include cleanup phase (0-5%)

// ✅ CORRECT - History preservation is automatic
// JSON files moved to accessibility-reports/history/
// History folder and contents are preserved
// All PDF files deleted for clean slate

// ❌ NEVER manually delete history folder
// The cleanup logic explicitly preserves it with: if (file !== 'history')
```

### 5. Error Handling
```typescript
// ✅ ALWAYS use ErrorHandlerService
const errorHandler = ErrorHandlerService.getInstance();

try {
  // Your code
} catch (error) {
  return errorHandler.handleError(error, 'Context message');
}

// ✅ ALWAYS return ServiceResult<T>
return {
  success: true,
  data: result,
  message: 'Operation successful'
};
```

### 6. Configuration
```typescript
// ✅ ALWAYS use ConfigurationService
const configService = ConfigurationService.getInstance();
const setting = configService.get('settingName', defaultValue);

// ❌ NEVER hardcode values
const setting = 'hardcoded-value'; // BREAKS CONFIGURATION
```

### 7. Testing Framework
```typescript
// ✅ ALWAYS run tests before making changes
npm test

// ✅ ALWAYS check test coverage
npm run test:coverage

// ✅ ALWAYS follow testing patterns from tests/e2e/README.md
// - Use Jest for unit testing (70% of tests)
// - Use Jest for integration testing (20% of tests)
// - Use Playwright for E2E testing (5% of tests)
// - Mock external dependencies with `any` types
// - Test public interfaces, not implementation details
// - Follow singleton pattern verification
// - Use test utilities for cleanup (createTempDir, cleanupTempHtmlFiles)

// ✅ Test Cleanup
// - Use (global as any).testUtils.createTempDir() for test directories
// - Use (global as any).testUtils.cleanupTempHtmlFiles() for HTML cleanup
// - Temporary files are automatically cleaned up after tests
// - Jest timeout issues resolved with proper clearTimeout calls
// - All 301 tests pass without worker process errors

// ✅ E2E Testing Commands
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Interactive E2E testing
npm run test:e2e:headed   # Headed mode E2E testing

// ✅ Accessibility Testing
// - 23 E2E accessibility tests covering WCAG 2.1 AAA compliance
// - Page Object Model (POM) design pattern implementation
// - Cross-browser testing (Chrome, Firefox, Safari)
// - Form validation, keyboard navigation, screen reader compatibility
// - Focus management, error handling, responsive design

// ❌ NEVER break existing tests without fixing them
// ❌ NEVER ignore TypeScript compilation errors in tests
// ❌ NEVER leave temporary files behind (HTML files, test directories)
// ❌ NEVER leave setTimeout calls without proper cleanup
```

### 8. CI/CD Workflows
```yaml
# ✅ ALWAYS ensure changes work with GitHub Actions
# - CI Pipeline (ci.yml): Runs on PRs and pushes to main/develop
# - Deploy Pipeline (deploy.yml): Runs on merges to main
# - Accessibility Pipeline (accessibility.yml): WCAG 2.1 AAA compliance
# - Dependencies Pipeline (dependencies.yml): Security and dependency management

# ✅ ALWAYS check workflow requirements
# - All 301+ tests must pass
# - WCAG 2.1 AAA compliance verified
# - Cross-browser compatibility (Chrome, Firefox, Safari)
# - Security audit passes
# - Documentation validation succeeds

# ✅ ALWAYS follow CI/CD best practices
# - Write tests for new features
# - Update documentation for changes
# - Ensure accessibility compliance
# - Check security implications
# - Verify cross-browser compatibility

# ❌ NEVER push changes that break CI/CD
# ❌ NEVER ignore workflow failures
# ❌ NEVER bypass quality gates
# ❌ NEVER skip accessibility testing
```

### 9. Build System
```bash
# ✅ Build process includes setup, compilation, and verification
npm run build  # Runs: clean → setup → tsc → tsc-alias → copy-public → verify

# ✅ Individual build steps available
npm run build-setup     # Ensures directory structure
npm run copy-public     # Copies public files cross-platform
npm run verify-build    # Validates build output

# ✅ Optimized installation scripts
npm run install:optimized  # Fast CI installation (~27 seconds)
npm run install:minimal    # Production dependencies only
npm run install:dev        # Include dev dependencies
npm run install:storybook  # Install Storybook dependencies

# ✅ Build scripts handle missing directories gracefully
# scripts/copy-public.js - Cross-platform file copying
# scripts/build-setup.js - Directory structure validation
# scripts/verify-build.js - Build output verification
# scripts/optimize-install.js - Optimized dependency installation

# ✅ GitHub Actions compatibility
# - Build process works in clean CI environment
# - Cross-platform file operations (Windows/Unix)
# - Graceful handling of missing directories
# - Comprehensive build verification
# - Optimized dependency installation (80% faster)

# ❌ DON'T modify build scripts without testing
# ❌ DON'T remove public directory copying
# ❌ DON'T bypass build verification
# ❌ DON'T add heavy dependencies without optimization
# Build process is critical for GitHub Actions workflows
```

## 🔍 Pre-Change Checklist

Before making ANY changes, verify:

### 1. Understand the Change Impact
- [ ] Which files will be affected?
- [ ] Are there any dependencies that will break?
- [ ] Does this change existing functionality?
- [ ] Will this affect the CLI entry point?

### 2. Check Critical Files
- [ ] `src/core/types/common.ts` - Are types being modified?
- [ ] `src/utils/services/error-handler-service.ts` - Is error handling affected?
- [ ] `src/utils/services/configuration-service.ts` - Is configuration involved?
- [ ] `src/web/server.ts` - Is web interface functionality affected?
- [ ] `tests/` directory - Are tests being modified or added?
- [ ] `jest.config.js` - Is testing configuration affected?
- [ ] `playwright.config.ts` - Is E2E testing configuration affected?

### 3. Verify Import Patterns
- [ ] Are imports using correct patterns (`@/` vs `../`)?
- [ ] Are all imports resolving correctly?
- [ ] Are there any circular dependencies?

### 4. Check Service Usage
- [ ] Are Singleton services using `getInstance()`?
- [ ] Are all service methods being called correctly?
- [ ] Are return types consistent with `ServiceResult<T>`?

## 🛠️ Common AI Development Scenarios

### Scenario 1: Adding a New Feature
```
1. Read DEPENDENCY_MAP.md to understand affected components
2. Check ARCHITECTURE_DIAGRAM.md for data flow
3. Follow patterns in QUICK_REFERENCE.md
4. Add types to common.ts if needed
5. Implement feature following existing patterns
6. Update documentation
7. Add to CHANGELOG.md
```

### Scenario 2: Fixing a Bug
```
1. Identify the root cause using dependency map
2. Check if it's a service, type, or import issue
3. Follow existing error handling patterns
4. Test the fix thoroughly
5. Update documentation if needed
6. Add to CHANGELOG.md
```

### Scenario 3: Refactoring Code
```
1. Map all dependencies before starting
2. Check for Singleton service violations
3. Verify import patterns are maintained
4. Ensure error handling is preserved
5. Test thoroughly after refactoring
6. Update all reference documents
```

## 🚫 Common AI Mistakes to Avoid

### 1. Breaking Singleton Pattern
```typescript
// ❌ WRONG - This breaks the entire system
export class MyService {
  constructor() {} // Should be private
}

// ✅ CORRECT
export class MyService {
  private static instance: MyService;
  private constructor() {}
  
  public static getInstance(): MyService {
    if (!MyService.instance) {
      MyService.instance = new MyService();
    }
    return MyService.instance;
  }
}
```

### 2. Incorrect Import Patterns
```typescript
// ❌ WRONG - Mixed import patterns
import { ErrorHandlerService } from '@/utils/services/error-handler-service';
import { ConfigurationService } from '../services/configuration-service';

// ✅ CORRECT - Consistent patterns
import { ErrorHandlerService } from '@/utils/services/error-handler-service';
import { ConfigurationService } from '@/utils/services/configuration-service';
```

### 3. Missing Error Handling
```typescript
// ❌ WRONG - No error handling
public async myMethod(): Promise<MyType> {
  return await this.doSomething();
}

// ✅ CORRECT - Proper error handling
public async myMethod(): Promise<ServiceResult<MyType>> {
  const errorHandler = ErrorHandlerService.getInstance();
  
  try {
    const result = await this.doSomething();
    return {
      success: true,
      data: result,
      message: 'Operation successful'
    };
  } catch (error) {
    return errorHandler.handleError(error, 'Context for myMethod');
  }
}
```

### 4. Hardcoding Values
```typescript
// ❌ WRONG - Hardcoded configuration
const timeout = 30000;
const maxRetries = 3;

// ✅ CORRECT - Configuration service
const configService = ConfigurationService.getInstance();
const timeout = configService.get('timeout', 30000);
const maxRetries = configService.get('maxRetries', 3);
```

## 🔧 Development Workflow for AI Tools

### Step 1: Analysis
1. Read the user's request carefully
2. Identify which components are involved
3. Check `DEPENDENCY_MAP.md` for dependencies
4. Review `ARCHITECTURE_DIAGRAM.md` for data flow
5. Consult `QUICK_REFERENCE.md` for patterns

### Step 2: Planning
1. Map out the changes needed
2. Identify potential breaking points
3. Plan the implementation approach
4. Consider error handling requirements
5. Plan documentation updates

### Step 3: Implementation
1. Follow existing patterns strictly
2. Use correct import patterns
3. Implement proper error handling
4. Use Singleton services correctly
5. Return appropriate types

### Step 4: Validation
1. Check TypeScript compilation
2. Verify CLI functionality
3. Test error scenarios
4. Update documentation
5. Add to CHANGELOG.md

## 📋 Validation Commands

After making changes, always run:

```bash
# TypeScript compilation check
npm run typecheck

# Run all tests
npm test

# Check test coverage
npm run test:coverage

# CLI functionality test
npm run test:e2e          # E2E functionality test
npm run cli

# Build verification
npm run build

# Storybook component testing
npm run storybook          # Start Storybook development server
npm run build-storybook    # Build Storybook for production
npm run test-storybook     # Run Storybook tests
```

## 🧪 Testing Framework

### Testing Pyramid (Current Status)
```typescript
// ✅ Unit Tests (70% - 214 tests)
npm run test:unit          # Core services, types, processors, runners

// ✅ Integration Tests (20% - 47 tests)  
npm run test:integration   # Service integration, API, WebSocket

// ✅ Component Tests (5% - 9 tests)
npm run storybook          # Storybook with accessibility validation

// 🔄 E2E Tests (5% - Ready for implementation)
npm run test:e2e          # Playwright E2E testing
```

### Test Cleanup & Stability
```typescript
// ✅ Jest timeout issues resolved
// - Proper clearTimeout calls in Pa11yTestRunner, ErrorHandlerService, ParallelAnalyzer
// - Global test setup with comprehensive timer cleanup
// - All 301 tests pass without worker process errors

// ✅ Component Testing with Storybook
// - 4 component stories: Header, ScanOptions, ProgressSection, WebInterface
// - WCAG 2.1 AA accessibility validation
// - Responsive design testing (Mobile, Tablet, Desktop)
// - Visual regression testing with viewport configurations
```

## 🎯 Key Principles for AI Development

### 1. Conservative Approach
- When in doubt, don't change it
- Preserve existing functionality
- Follow established patterns exactly

### 2. Documentation First
- Always check reference documents
- Update documentation when making changes
- Maintain consistency across all docs

### 3. Error Handling
- Always handle errors properly
- Use ErrorHandlerService for all errors
- Return ServiceResult<T> from services

### 4. Configuration
- Never hardcode values
- Use ConfigurationService for all settings
- Provide sensible defaults

### 5. Testing
- Test changes thoroughly
- Verify CLI functionality
- Check for regressions

## 🚨 Emergency Stop

If you encounter any of these issues, STOP and ask for help:

1. **TypeScript compilation errors** - Don't proceed until resolved
2. **Import resolution failures** - Check path aliases and dependencies
3. **Singleton pattern violations** - This breaks the entire system
4. **Missing error handling** - Can cause silent failures
5. **Hardcoded configuration** - Breaks flexibility

## 📞 Getting Help

If you're unsure about any aspect:

1. **Check the reference documents first**
2. **Look for similar patterns in existing code**
3. **Ask for clarification before proceeding**
4. **Start with a small, safe change**
5. **Test thoroughly before making larger changes**

---

**Remember**: This codebase is complex with many interdependencies. When in doubt, be conservative and follow existing patterns exactly. It's better to ask for clarification than to break the system.

**Last Updated**: 18/12/2024 14:30 GMT
**Purpose**: Guide AI tools to work safely with the accessibility testing codebase 