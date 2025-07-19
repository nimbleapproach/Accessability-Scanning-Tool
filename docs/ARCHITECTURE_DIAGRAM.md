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
        ├── Jest Configuration
        ├── Test Utilities
        ├── Unit Tests
        └── Integration Tests
```

### Testing Architecture
```
Jest Framework
    │
    ├── Unit Tests
    │   ├── Core Services (ErrorHandler, Configuration, Security, FileOps)
    │   ├── Core Types (common.ts validation)
    │   ├── Processors (ViolationProcessor)
    │   └── Runners (AxeTestRunner, Pa11yTestRunner)
    │
    ├── Integration Tests
    │   ├── Cross-service communication
    │   ├── Singleton pattern verification
    │   └── End-to-end workflows
    │
    └── Test Utilities
        ├── Global test helpers
        ├── Mock data creation
        └── Performance testing
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

---

**Last Updated**: 18/12/2024 14:30 GMT
**Purpose**: Visual reference for understanding system architecture and dependencies 