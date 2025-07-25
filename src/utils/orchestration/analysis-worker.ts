import { EventEmitter } from 'events';
import { AnalysisTask, ServiceResult, TaskResult, WorkerMetrics } from '@/core/types/common';
import { BrowserManager } from '@/core/utils/browser-manager';
import { ToolOrchestrator } from '@/utils/analysis/tool-orchestrator';
import { ErrorHandlerService } from '@/utils/services/error-handler-service';
import { ConfigurationService } from '@/utils/services/configuration-service';

export class AnalysisWorker extends EventEmitter {
  private workerId: string;
  private browserManager: BrowserManager;
  private toolOrchestrator: ToolOrchestrator;
  private isAvailable: boolean = true;
  private currentTask: AnalysisTask | null = null;
  private processedTasks: number = 0;
  private totalProcessingTime: number = 0;
  private lastActivity: Date = new Date();
  private startTime: Date = new Date();
  private errorCount: number = 0;

  constructor(workerId: string, browserManager: BrowserManager) {
    super();
    this.workerId = workerId;
    this.browserManager = browserManager;
    // ToolOrchestrator will be initialized when we have a page
    this.toolOrchestrator = new ToolOrchestrator(null as any);
  }

  public getId(): string {
    return this.workerId;
  }

  public getIsAvailable(): boolean {
    return this.isAvailable;
  }

  public getCurrentTask(): AnalysisTask | null {
    return this.currentTask;
  }

  public getProcessedTaskCount(): number {
    return this.processedTasks;
  }

  public getTotalProcessingTime(): number {
    return this.totalProcessingTime;
  }

  public getLastActivity(): Date {
    return this.lastActivity;
  }

  public getMetrics(): WorkerMetrics {
    const uptime = Date.now() - this.startTime.getTime();

    return {
      tasksProcessed: this.processedTasks,
      averageProcessingTime:
        this.processedTasks > 0 ? this.totalProcessingTime / this.processedTasks : 0,
      memoryUsage: process.memoryUsage().heapUsed,
      errorRate: this.processedTasks > 0 ? this.errorCount / this.processedTasks : 0,
      uptime: uptime,
    };
  }

  public async processTask(task: AnalysisTask): Promise<void> {
    if (!this.isAvailable) {
      throw new Error(`Worker ${this.workerId} is not available`);
    }

    this.isAvailable = false;
    this.currentTask = task;
    this.lastActivity = new Date();

    const startTime = Date.now();

    try {
      let result: ServiceResult<any>;

      switch (task.type) {
        case 'single-page':
          result = await this.processSinglePage(task);
          break;
        case 'batch':
          result = await this.processBatch(task);
          break;
        case 'full-site':
          result = await this.processFullSite(task);
          break;
        default:
          throw new Error(`Unsupported task type: ${task.type}`);
      }

      const duration = Date.now() - startTime;
      this.totalProcessingTime += duration;
      this.processedTasks++;

      const taskResult: TaskResult = {
        taskId: task.id,
        success: result.success,
        result: result,
        duration: duration,
        memoryUsage: process.memoryUsage().heapUsed,
        workerMetrics: this.getMetrics(),
      };

      this.emit('taskCompleted', taskResult);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.totalProcessingTime += duration;
      this.errorCount++;

      const taskResult: TaskResult = {
        taskId: task.id,
        success: false,
        error: error as Error,
        duration: duration,
        memoryUsage: process.memoryUsage().heapUsed,
        workerMetrics: this.getMetrics(),
      };

      this.emit('taskFailed', taskResult);
    } finally {
      this.currentTask = null;
      this.isAvailable = true;
      this.lastActivity = new Date();
    }
  }

  private async processSinglePage(task: AnalysisTask): Promise<ServiceResult<any>> {
    const page = await this.browserManager.getPage(this.workerId);

    try {
      await page.goto(task.url, {
        waitUntil: 'networkidle',
        timeout: task.options.timeout || 30000,
      });

      // Wait for any dynamic content to load
      await page.waitForTimeout(2000);

      // Create ToolOrchestrator with the page
      const toolOrchestrator = new ToolOrchestrator(page);
      const result = await toolOrchestrator.runAnalysis(page, task.options);

      return {
        success: true,
        data: result,
        message: `Single page analysis completed for ${task.url}`,
        metadata: {
          taskId: task.id,
          workerId: this.workerId,
          url: task.url,
          completedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        message: `Single page analysis failed for ${task.url}: ${(error as Error).message}`,
        metadata: {
          taskId: task.id,
          workerId: this.workerId,
          url: task.url,
          failedAt: new Date(),
        },
      };
    } finally {
      await this.browserManager.cleanup(this.workerId);
    }
  }

  private async processBatch(task: AnalysisTask): Promise<ServiceResult<any>> {
    const batchUrls = (task.options['batchUrls'] || [task.url]) as string[];
    const results = [];
    const errors = [];

    for (const url of batchUrls) {
      const page = await this.browserManager.getPage(this.workerId);

      try {
        await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: task.options.timeout || 30000,
        });

        await page.waitForTimeout(2000);
        const result = await this.toolOrchestrator.runAnalysis(page, task.options);

        results.push({
          url: url,
          result: result,
          status: 'success',
        });
      } catch (error) {
        errors.push({
          url: url,
          error: (error as Error).message,
          status: 'failed',
        });
      } finally {
        await this.browserManager.cleanup(this.workerId);
      }
    }

    return {
      success: errors.length === 0,
      data: {
        results: results,
        errors: errors,
        totalProcessed: batchUrls.length,
        successCount: results.length,
        errorCount: errors.length,
      },
      message: `Batch analysis completed: ${results.length} successful, ${errors.length} failed`,
      metadata: {
        taskId: task.id,
        workerId: this.workerId,
        batchSize: batchUrls.length,
        completedAt: new Date(),
      },
    };
  }

  private async processFullSite(task: AnalysisTask): Promise<ServiceResult<any>> {
    // This would integrate with the existing site crawler
    // For now, we'll delegate to the existing workflow orchestrator
    const { WorkflowOrchestrator } = await import('./workflow-orchestrator.js');
    const workflowOrchestrator = new WorkflowOrchestrator();

    try {
      const result = await workflowOrchestrator.runAccessibilityAudit(task.url, task.options);

      return {
        success: true,
        data: result,
        message: `Full site analysis completed for ${task.url}`,
        metadata: {
          taskId: task.id,
          workerId: this.workerId,
          url: task.url,
          completedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        message: `Full site analysis failed for ${task.url}: ${(error as Error).message}`,
        metadata: {
          taskId: task.id,
          workerId: this.workerId,
          url: task.url,
          failedAt: new Date(),
        },
      };
    }
  }

  public async cleanup(): Promise<void> {
    // Wait for current task to complete
    if (this.currentTask) {
      await new Promise(resolve => {
        const checkCompletion = () => {
          if (this.isAvailable) {
            resolve(void 0);
          } else {
            setTimeout(checkCompletion, 1000);
          }
        };
        checkCompletion();
      });
    }

    // Clean up any resources
    this.removeAllListeners();
    this.currentTask = null;
    this.isAvailable = false;
  }

  public getHealth(): {
    workerId: string;
    isHealthy: boolean;
    metrics: WorkerMetrics;
    lastActivity: Date;
    currentTask: string | null;
  } {
    const metrics = this.getMetrics();
    const isHealthy =
      metrics.errorRate < 0.1 && // Less than 10% error rate
      Date.now() - this.lastActivity.getTime() < 300000; // Active within 5 minutes

    return {
      workerId: this.workerId,
      isHealthy,
      metrics,
      lastActivity: this.lastActivity,
      currentTask: this.currentTask?.id || null,
    };
  }
}
