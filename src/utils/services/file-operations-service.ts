import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationService } from './configuration-service';
import { SecurityValidationService } from './security-validation-service';

/**
 * Interface for file operation results
 */
export interface FileOperationResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Message describing the result of the operation */
  message: string;
  /** Optional file path involved in the operation */
  filePath?: string;
}

/**
 * Singleton service for file system operations in accessibility testing
 * Provides centralized, error-handled file operations for reports and configuration
 */
export class FileOperationsService {
  private static instance: FileOperationsService;
  private config = ConfigurationService.getInstance();
  private securityService = SecurityValidationService.getInstance();

  private constructor() {
    // Private constructor to enforce singleton pattern
    if (FileOperationsService.instance) {
      throw new Error(
        'Cannot instantiate FileOperationsService directly. Use getInstance() instead.'
      );
    }
  }

  /**
   * Gets the singleton instance of FileOperationsService
   * @returns The singleton FileOperationsService instance
   */
  static getInstance(): FileOperationsService {
    if (!FileOperationsService.instance) {
      FileOperationsService.instance = new FileOperationsService();
    }
    return FileOperationsService.instance;
  }

  /**
   * Ensures a directory exists, creating it if necessary
   * @param directoryPath The path of the directory to ensure exists
   * @returns FileOperationResult indicating success or failure
   */
  ensureDirectoryExists(directoryPath: string): FileOperationResult {
    try {
      // Security validation (this is a directory, not a file)
      const pathValidation = this.securityService.validateFilePath(directoryPath, undefined, true);
      if (!pathValidation.isValid) {
        return {
          success: false,
          message: `Security validation failed: ${pathValidation.error}`,
        };
      }

      const fullPath = path.resolve(directoryPath);
      const existed = fs.existsSync(fullPath);

      if (!existed) {
        fs.mkdirSync(fullPath, { recursive: true });
        return {
          success: true,
          message: `Directory created successfully: ${fullPath}`,
          filePath: fullPath,
        };
      } else {
        return {
          success: true,
          message: `Directory already exists: ${fullPath}`,
          filePath: fullPath,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to create directory: ${error}`,
      };
    }
  }

  /**
   * Writes content to a file with error handling
   * @param filePath The path where the file should be written
   * @param content The content to write to the file
   * @returns FileOperationResult indicating success or failure
   */
  writeFile(filePath: string, content: string): FileOperationResult {
    try {
      // Handle null/undefined/empty inputs
      if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
        return {
          success: false,
          message: 'File path cannot be empty or null',
        };
      }

      if (!content || typeof content !== 'string') {
        return {
          success: false,
          message: 'Content cannot be null or undefined',
        };
      }

      // Security validation for file path (without base directory restriction for tests)
      const validation = this.securityService.validateFilePath(filePath);

      if (!validation.isValid) {
        return {
          success: false,
          message: `Security validation failed: ${validation.error}`,
        };
      }

      const fullPath = validation.sanitizedValue || path.resolve(filePath);
      const directory = path.dirname(fullPath);

      // Handle empty directory (current directory case)
      const directoryToCheck = directory === '' ? '.' : directory;

      // Ensure directory exists
      const dirResult = this.ensureDirectoryExists(directoryToCheck);
      if (!dirResult.success) {
        return dirResult;
      }

      fs.writeFileSync(fullPath, content, 'utf8');
      return {
        success: true,
        message: `File written successfully: ${fullPath}`,
        filePath: fullPath,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to write file: ${error}`,
      };
    }
  }

  /**
   * Reads a file with error handling
   * @param filePath The path of the file to read
   * @returns FileOperationResult with optional content property
   */
  readFile(filePath: string): FileOperationResult & { content?: string } {
    try {
      // Handle null/undefined/empty inputs
      if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
        return {
          success: false,
          message: 'File path cannot be empty or null',
        };
      }

      // Security validation for file path
      const validation = this.securityService.validateFilePath(filePath);

      if (!validation.isValid) {
        return {
          success: false,
          message: `Security validation failed: ${validation.error}`,
        };
      }

      const fullPath = validation.sanitizedValue || path.resolve(filePath);

      if (!fs.existsSync(fullPath)) {
        return {
          success: false,
          message: `File does not exist: ${fullPath}`,
        };
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      return {
        success: true,
        message: `File read successfully: ${fullPath}`,
        filePath: fullPath,
        content,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to read file: ${error}`,
      };
    }
  }

  /**
   * Deletes a file with error handling
   * @param filePath The path of the file to delete
   * @returns FileOperationResult indicating success or failure
   */
  deleteFile(filePath: string): FileOperationResult {
    try {
      // Handle null/undefined/empty inputs
      if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
        return {
          success: false,
          message: 'File path cannot be empty or null',
        };
      }

      // Security validation
      const pathValidation = this.securityService.validateFilePath(filePath);
      if (!pathValidation.isValid) {
        return {
          success: false,
          message: `Security validation failed: ${pathValidation.error}`,
        };
      }

      const fullPath = path.resolve(filePath);

      if (!fs.existsSync(fullPath)) {
        return {
          success: false,
          message: 'File does not exist',
        };
      }

      fs.unlinkSync(fullPath);
      return {
        success: true,
        message: `File deleted successfully: ${fullPath}`,
        filePath: fullPath,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete file: ${error}`,
      };
    }
  }



  /**
   * Generates a unique filename with timestamp
   * @param baseName Base name for the file
   * @param extension File extension (without dot)
   * @returns Unique filename with timestamp
   */
  generateUniqueFilename(baseName: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${baseName}-${timestamp}.${extension}`;
  }

  /**
   * Generates a user-friendly filename from a URL
   * @param url The URL to generate a filename from
   * @param suffix Optional suffix to append to the filename
   * @returns User-friendly filename based on the URL
   */
  generateUserFriendlyFilename(url: string, suffix: string = ''): string {
    try {
      const parsedUrl = new URL(url);
      let domain = parsedUrl.hostname.replace(/^www\./, '');

      // Replace dots with dashes for readability
      domain = domain.replace(/\./g, '-');

      // Add timestamp
      const now = new Date();
      const timestamp = now
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        .replace(/[\/\s:]/g, '-');

      return `${domain}-accessibility-report-${timestamp}${suffix}`;
    } catch {
      // Fallback to timestamp-based naming
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      return `accessibility-report-${timestamp}${suffix}`;
    }
  }

  /**
   * Gets the reports directory path
   * @returns Absolute path to the reports directory
   */
  getReportsDirectory(): string {
    return path.resolve(this.config.getReportingConfiguration().reportsDirectory);
  }

  /**
   * Lists files in the reports directory
   * @returns FileOperationResult with optional files property containing array of filenames
   */
  listReportFiles(): FileOperationResult & { files?: string[] } {
    try {
      const reportsDir = this.getReportsDirectory();

      if (!fs.existsSync(reportsDir)) {
        return {
          success: true,
          message: 'Reports directory does not exist',
          files: [],
        };
      }

      const files = fs.readdirSync(reportsDir);
      return {
        success: true,
        message: `Found ${files.length} files in reports directory`,
        files,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to list report files: ${error}`,
      };
    }
  }



  /**
   * Checks if a file exists
   * @param filePath The file path to check
   * @returns FileOperationResult with optional exists property
   */
  fileExists(filePath: string): FileOperationResult & { exists?: boolean } {
    try {
      // Security validation
      const pathValidation = this.securityService.validateFilePath(filePath);
      if (!pathValidation.isValid) {
        return {
          success: false,
          message: `Security validation failed: ${pathValidation.error}`,
        };
      }

      const fullPath = path.resolve(filePath);
      const exists = fs.existsSync(fullPath);

      return {
        success: true,
        message: exists ? 'File exists' : 'File does not exist',
        exists,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to check file existence: ${error}`,
      };
    }
  }

  /**
   * Gets file statistics
   * @param filePath The file path to get statistics for
   * @returns FileOperationResult with optional stats property
   */


  /**
   * Cleans up old files in a directory
   * @param dirPath The directory path to clean up
   * @param maxAge Maximum age in milliseconds
   * @param pattern Optional regex pattern to filter files
   * @returns FileOperationResult with optional deletedFiles property
   */
  cleanupOldFiles(
    dirPath: string,
    maxAge: number,
    pattern?: RegExp
  ): FileOperationResult & { deletedFiles?: string[]; errors?: string[] } {
    try {
      // Security validation
      const pathValidation = this.securityService.validateFilePath(dirPath);
      if (!pathValidation.isValid) {
        return {
          success: false,
          message: `Security validation failed: ${pathValidation.error}`,
        };
      }

      const fullPath = path.resolve(dirPath);

      if (!fs.existsSync(fullPath)) {
        return {
          success: false,
          message: 'Directory does not exist',
        };
      }

      const files = fs.readdirSync(fullPath);
      const deletedFiles: string[] = [];
      const errors: string[] = [];
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(fullPath, file);

        // Apply default pattern if none provided (reports-related files)
        const effectivePattern = pattern || /report/;

        // Check if file matches pattern first
        if (!effectivePattern.test(file)) {
          continue;
        }

        try {
          const stats = fs.statSync(filePath);

          // Check if file is older than maxAge
          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(filePath);
            deletedFiles.push(file);
          }
        } catch (error) {
          // Collect errors for reporting (only for files that match pattern)
          errors.push(`Failed to process ${file}: ${error}`);
          continue;
        }
      }

      const hasErrors = errors.length > 0;
      return {
        success: true,
        message: hasErrors ? 'Cleanup completed with errors' : 'Cleanup completed',
        deletedFiles,
        ...(hasErrors && { errors }),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to cleanup old files: ${error}`,
      };
    }
  }

  /**
   * Moves a file from source to destination with error handling
   * @param sourcePath The source file path
   * @param destinationPath The destination file path
   * @returns FileOperationResult indicating success or failure
   */
  moveFile(sourcePath: string, destinationPath: string): FileOperationResult {
    try {
      // Handle null/undefined/empty inputs
      if (!sourcePath || typeof sourcePath !== 'string' || sourcePath.trim().length === 0) {
        return {
          success: false,
          message: 'Source path cannot be empty or null',
        };
      }

      if (!destinationPath || typeof destinationPath !== 'string' || destinationPath.trim().length === 0) {
        return {
          success: false,
          message: 'Destination path cannot be empty or null',
        };
      }

      // Security validation for both paths
      const sourceValidation = this.securityService.validateFilePath(sourcePath);
      const destValidation = this.securityService.validateFilePath(destinationPath);

      if (!sourceValidation.isValid) {
        return {
          success: false,
          message: `Source path security validation failed: ${sourceValidation.error}`,
        };
      }

      if (!destValidation.isValid) {
        return {
          success: false,
          message: `Destination path security validation failed: ${destValidation.error}`,
        };
      }

      const fullSourcePath = sourceValidation.sanitizedValue || path.resolve(sourcePath);
      const fullDestPath = destValidation.sanitizedValue || path.resolve(destinationPath);

      // Check if source file exists
      if (!fs.existsSync(fullSourcePath)) {
        return {
          success: false,
          message: `Source file does not exist: ${fullSourcePath}`,
        };
      }

      // Ensure destination directory exists
      const destDir = path.dirname(fullDestPath);
      const dirResult = this.ensureDirectoryExists(destDir);
      if (!dirResult.success) {
        return dirResult;
      }

      // Check if destination file already exists and handle conflict
      if (fs.existsSync(fullDestPath)) {
        // Generate unique filename to avoid overwriting
        const dir = path.dirname(fullDestPath);
        const ext = path.extname(fullDestPath);
        const baseName = path.basename(fullDestPath, ext);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const uniqueDestPath = path.join(dir, `${baseName}-${timestamp}${ext}`);

        fs.renameSync(fullSourcePath, uniqueDestPath);
        return {
          success: true,
          message: `File moved successfully with unique name: ${uniqueDestPath}`,
          filePath: uniqueDestPath,
        };
      }

      // Move the file
      fs.renameSync(fullSourcePath, fullDestPath);
      return {
        success: true,
        message: `File moved successfully: ${fullDestPath}`,
        filePath: fullDestPath,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to move file: ${error}`,
      };
    }
  }

  /**
   * Moves multiple files matching a pattern to a destination directory
   * @param sourceDir The source directory
   * @param destinationDir The destination directory
   * @param pattern Optional regex pattern to filter files (default: all files)
   * @returns FileOperationResult with optional movedFiles property
   */
  moveFilesByPattern(
    sourceDir: string,
    destinationDir: string,
    pattern?: RegExp
  ): FileOperationResult & { movedFiles?: string[]; errors?: string[] } {
    try {
      // Security validation
      const sourceValidation = this.securityService.validateFilePath(sourceDir);
      const destValidation = this.securityService.validateFilePath(destinationDir);

      if (!sourceValidation.isValid) {
        return {
          success: false,
          message: `Source directory security validation failed: ${sourceValidation.error}`,
        };
      }

      if (!destValidation.isValid) {
        return {
          success: false,
          message: `Destination directory security validation failed: ${destValidation.error}`,
        };
      }

      const fullSourcePath = sourceValidation.sanitizedValue || path.resolve(sourceDir);
      const fullDestPath = destValidation.sanitizedValue || path.resolve(destinationDir);

      if (!fs.existsSync(fullSourcePath)) {
        return {
          success: false,
          message: 'Source directory does not exist',
        };
      }

      // Ensure destination directory exists
      const dirResult = this.ensureDirectoryExists(fullDestPath);
      if (!dirResult.success) {
        return dirResult;
      }

      const files = fs.readdirSync(fullSourcePath);
      const movedFiles: string[] = [];
      const errors: string[] = [];

      for (const file of files) {
        const sourceFilePath = path.join(fullSourcePath, file);
        const destFilePath = path.join(fullDestPath, file);

        // Check if file matches pattern (if provided)
        if (pattern && !pattern.test(file)) {
          continue;
        }

        try {
          const stats = fs.statSync(sourceFilePath);

          // Only move files, not directories
          if (stats.isFile()) {
            const moveResult = this.moveFile(sourceFilePath, destFilePath);
            if (moveResult.success) {
              movedFiles.push(file);
            } else {
              errors.push(`Failed to move ${file}: ${moveResult.message}`);
            }
          }
        } catch (error) {
          errors.push(`Failed to process ${file}: ${error}`);
          continue;
        }
      }

      const hasErrors = errors.length > 0;
      return {
        success: true,
        message: hasErrors ? 'File move completed with errors' : 'File move completed',
        movedFiles,
        ...(hasErrors && { errors }),
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to move files: ${error}`,
      };
    }
  }
}
