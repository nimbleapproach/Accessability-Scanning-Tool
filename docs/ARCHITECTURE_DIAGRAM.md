# 🏗️ Technical Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ACCESSIBILITY TESTING SYSTEM                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │    Web      │    │   Workflow  │    │   Parallel  │    │   Analysis  │  │
│  │ Interface   │───▶│Orchestrator │───▶│  Analyzer   │───▶│   Service   │  │
│  │ (Express)   │    │             │    │             │    │             │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                   │                   │                   │      │
│         ▼                   ▼                   ▼                   ▼      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Browser   │    │   Site      │    │   Tool      │    │   Cache     │  │
│  │  Manager    │    │  Crawler    │    │Orchestrator │    │   Layer     │  │
│  │             │    │             │    │             │    │             │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Component Architecture

### 1. Web Interface Layer
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            WEB INTERFACE LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WebServer (Express.js + Socket.IO)                                        │
│  ├── RESTful API endpoints for accessibility testing                       │
│  ├── Real-time progress tracking via WebSocket                             │
│  ├── Static file serving (HTML, CSS, JS)                                   │
│  ├── WorkflowOrchestrator integration                                      │
│  └── Error handling and user feedback                                      │
│                                                                             │
│  Public Files (Frontend)                                                    │
│  ├── index.html - Main web interface                                       │
│  ├── styles.css - UK brand-compliant styling                               │
│  └── app.js - Frontend JavaScript with real-time updates                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Orchestration Layer
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ORCHESTRATION LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WorkflowOrchestrator (Main Coordinator)                                   │
│  ├── SiteCrawler integration                                               │
│  ├── ParallelAnalyzer coordination                                         │
│  ├── Performance monitoring                                                │
│  └── Result aggregation                                                    │
│                                                                             │
│  ParallelAnalyzer (Parallel Execution)                                     │
│  ├── Dynamic tool registration                                             │
│  ├── Concurrent page analysis                                              │
│  ├── Worker pool management                                                │
│  └── Result merging                                                        │
│                                                                             │
│  AnalysisService (API Layer)                                               │
│  ├── Request handling                                                      │
│  ├── Progress tracking                                                     │
│  ├── Cache integration                                                     │
│  └── Performance metrics                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3. Service Layer (Singleton Pattern)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVICE LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Error     │    │Configuration│    │    File     │    │  Security   │  │
│  │  Handler    │    │  Service    │    │Operations   │    │Validation   │  │
│  │  Service    │    │             │    │  Service    │    │  Service    │  │
│  │             │    │             │    │             │    │             │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                   │                   │                   │      │
│         └───────────────────┼───────────────────┼───────────────────┘      │
│                             │                   │                          │
│                             ▼                   ▼                          │
│                    ┌─────────────┐    ┌─────────────┐                      │
│                    │   Browser   │    │   Analysis  │                      │
│                    │  Manager    │    │   Cache     │                      │
│                    │             │    │             │                      │
│                    └─────────────┘    └─────────────┘                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4. Analysis Layer
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ANALYSIS LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ToolOrchestrator (Multi-Tool Coordinator)                                 │
│  ├── AxeTestRunner integration                                             │
│  ├── Pa11yTestRunner integration                                           │
│  ├── Result combination                                                    │
│  └── Violation processing                                                  │
│                                                                             │
│  ┌─────────────┐                    ┌─────────────┐                        │
│  │    Axe      │                    │   Pa11y     │                        │
│  │ TestRunner  │                    │ TestRunner  │                        │
│  │             │                    │             │                        │
│  └─────────────┘                    └─────────────┘                        │
│         │                                   │                              │
│         └───────────────────────────────────┘                              │
│                                   │                                        │
│                                   ▼                                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│  │Violation    │    │   Page      │    │   PDF       │                    │
│  │Processor    │───▶│  Analyzer   │───▶│Generators   │                    │
│  │             │    │             │    │             │                    │
│  └─────────────┘    └─────────────┘    └─────────────┘                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### 1. Initial Request Flow
```
Web Interface → WebServer → WorkflowOrchestrator → Cleanup Phase → SiteCrawler → Page Discovery
     │
     ▼
ConfigurationService ← BrowserManager ← AnalysisCache
     │
     ▼
ParallelAnalyzer ← ToolOrchestrator ← [AxeTestRunner, Pa11yTestRunner]
     │
     ▼
ViolationProcessor ← PageAnalyzer ← PDF Generators
     │
     ▼
FileOperationsService → Final Reports → WebServer → JSON Response → Web Interface
```

### 1.1. Cleanup Phase Flow
```
Cleanup Phase (0-5% Progress)
├── Move JSON files to accessibility-reports/history/
├── Delete all existing PDF files
├── Preserve history folder and contents
└── Remove temporary directories
```

### 2. Parallel Processing Flow
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PARALLEL PROCESSING FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Page Discovery (SiteCrawler)                                              │
│  ├── Crawl site structure                                                  │
│  ├── Cache page list                                                       │
│  └── Return PageInfo[]                                                     │
│                                                                             │
│  Parallel Analysis (ParallelAnalyzer)                                      │
│  ├── Create worker pool                                                    │
│  ├── Distribute pages across workers                                       │
│  ├── Execute concurrent analysis                                           │
│  └── Aggregate results                                                     │
│                                                                             │
│  Tool Execution (ToolOrchestrator)                                         │
│  ├── Axe-core analysis                                                     │
│  ├── Pa11y analysis                                                        │
│  ├── Result merging                                                        │
│  └── Violation processing                                                  │
│                                                                             │
│  Report Generation                                                          │
│  ├── Violation aggregation                                                 │
│  ├── PDF generation                                                        │
│  ├── JSON reports                                                          │
│  └── File output                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Dependency Relationships

### Core Dependencies (Critical Path)
```
common.ts (Types)
    │
    ├── ErrorHandlerService
    │   ├── All Services
    │   ├── All Utilities
    │   └── All Runners
    │
    └── Testing Framework
        ├── Jest Configuration (Unit & Integration)
        ├── Playwright Configuration (E2E)
        ├── Test Utilities
        ├── Unit Tests (70%)
        ├── Integration Tests (20%)
        └── E2E Tests (5%)
```

### Testing Architecture (Testing Pyramid)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TESTING PYRAMID ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    E2E TESTS (5% - Playwright)                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │ │
│  │  │   Web       │  │   User      │  │   Interface │  │   Cross-    │    │ │
│  │  │ Interface   │  │  Journey    │  │Accessibility│  │  Browser    │    │ │
│  │  │   Tests     │  │   Tests     │  │   Tests     │  │   Tests     │    │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                  COMPONENT TESTS (5% - Storybook)                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │ │
│  │  │   UI        │  │   Visual    │  │   A11y      │  │   Component │    │ │
│  │  │Components   │  │ Regression  │  │   Testing   │  │Documentation│    │ │
│  │  │   Tests     │  │   Tests     │  │             │  │             │    │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                INTEGRATION TESTS (20% - Jest)                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │ │
│  │  │   Service   │  │     API     │  │   Storage   │  │   Workflow  │    │ │
│  │  │Integration  │  │Integration  │  │Integration  │  │Integration  │    │ │
│  │  │   Tests     │  │   Tests     │  │   Tests     │  │   Tests     │    │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    UNIT TESTS (70% - Jest)                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │ │
│  │  │   Core      │  │   Service   │  │   Processors│  │   Runners   │    │ │
│  │  │  Services   │  │   Tests     │  │   Tests     │  │   Tests     │    │ │
│  │  │   Tests     │  │             │  │             │  │             │    │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
    │
    ├── ConfigurationService
    │   ├── BrowserManager
    │   ├── SiteCrawler
    │   ├── TestRunners
    │   └── FileOperationsService
    │
    └── BrowserManager
        ├── ParallelAnalyzer
        ├── WorkflowOrchestrator
        └── AnalysisService
```

### Service Dependencies
```
ErrorHandlerService (Base)
    │
    ├── ConfigurationService
    │   └── FileOperationsService
    │       └── SecurityValidationService
    │
    ├── BrowserManager
    │   └── PerformanceMonitor
    │
    └── All Other Services
```

### Analysis Dependencies
```
ParallelAnalyzer
    │
    ├── ToolOrchestrator
    │   ├── AxeTestRunner
    │   ├── Pa11yTestRunner
    │   └── ViolationProcessor
    │
    └── PageAnalyzer
        └── PDF Generators
```

## Error Handling Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ERROR HANDLING FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Error Occurs                                                              │
│       │                                                                    │
│       ▼                                                                    │
│  ErrorHandlerService.getInstance()                                         │
│  ├── Log error with context                                                │
│  ├── Determine error severity                                              │
│  ├── Apply retry logic if applicable                                       │
│  └── Return ServiceResult<T>                                               │
│       │                                                                    │
│       ▼                                                                    │
│  ServiceResult<T>                                                          │
│  ├── success: boolean                                                      │
│  ├── data?: T                                                             │
│  ├── error?: Error                                                         │
│  └── message?: string                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Configuration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONFIGURATION FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Environment Variables                                                     │
│       │                                                                    │
│       ▼                                                                    │
│  ConfigurationService.getInstance()                                        │
│  ├── Load environment variables                                            │
│  ├── Validate configuration                                                │
│  ├── Set defaults                                                          │
│  └── Return configuration object                                           │
│       │                                                                    │
│       ▼                                                                    │
│  Service Configuration                                                     │
│  ├── Browser settings                                                      │
│  ├── Test parameters                                                       │
│  ├── Performance settings                                                  │
│  └── Output settings                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Performance Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PERFORMANCE MONITORING                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PerformanceMonitor.getInstance()                                          │
│  ├── Memory usage tracking                                                 │
│  ├── Processing time metrics                                               │
│  ├── Cache performance                                                     │
│  ├── Worker utilization                                                     │
│  └── System health metrics                                                 │
│                                                                             │
│  Metrics Collection                                                        │
│  ├── Real-time monitoring                                                  │
│  ├── Historical data                                                       │
│  ├── Performance alerts                                                    │
│  └── Export capabilities                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Architectural Principles

### 1. Singleton Pattern
- All services use Singleton pattern for consistency
- Prevents multiple instances and resource conflicts
- Centralised state management

### 2. Dependency Injection
- Services are injected where needed
- Loose coupling between components
- Easy testing and maintenance

### 3. Error Handling
- Centralised error handling through ErrorHandlerService
- Consistent error response format (ServiceResult<T>)
- Proper logging and context preservation

### 4. Configuration Management
- Centralised configuration through ConfigurationService
- Environment variable support
- Validation and defaults

### 5. Performance Monitoring
- Real-time performance tracking
- Memory usage monitoring
- System health metrics

### 6. Modular Design
- Clear separation of concerns
- Reusable components
- Easy to extend and maintain

### Test Cleanup Architecture
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TEST CLEANUP SYSTEM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Global Test Setup (tests/setup.ts)                                        │
│  ├── Track created test files and directories                              │
│  ├── Automatic cleanup after all tests complete                            │
│  ├── Cleanup of common test directories                                    │
│  └── Cleanup of temporary HTML files                                       │
│                                                                             │
│  Test Utilities (global.testUtils)                                         │
│  ├── createTempDir() - Creates tracked temporary directories               │
│  ├── createTestFile() - Creates tracked test files                         │
│  ├── cleanupTempDir() - Cleans up specific directories                     │
│  ├── cleanupTestFile() - Cleans up specific files                          │
│  ├── createTestReportsDir() - Creates tracked reports directories          │
│  ├── cleanupTestReportsDir() - Cleans up reports directories               │
│  └── cleanupTempHtmlFiles() - Cleans up temporary HTML files               │
│                                                                             │
│  Automatic Cleanup Targets                                                 │
│  ├── test-temp directories                                                 │
│  ├── temp-test-* directories                                               │
│  ├── accessibility-reports directories                                     │
│  ├── test-results directories                                              │
│  └── temp-*.html files (PDF orchestrator temporary files)                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

**Last Updated**: 19/12/2024 15:30 GMT
**Purpose**: Visual reference for understanding system architecture and dependencies 