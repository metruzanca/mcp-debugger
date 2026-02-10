import { readFile, appendFile, writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';

export type LogData = any;

export class LogManager {
  private readonly logFilePath = './.debug.log';

  async readLogs(): Promise<string> {
    try {
      if (!existsSync(this.logFilePath)) {
        return '';
      }
      
      return await readFile(this.logFilePath, 'utf-8');
    } catch (error) {
      console.error('Error reading logs:', error);
      return '';
    }
  }

  async appendLog(data: LogData): Promise<void> {
    try {
      // Convert data to string - if object/array, stringify it
      const line = typeof data === 'string' ? data : JSON.stringify(data);
      await appendFile(this.logFilePath, line + '\n');
    } catch (error) {
      console.error('Error appending log:', error);
      throw new Error(`Failed to append log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async clearLogs(): Promise<void> {
    try {
      await writeFile(this.logFilePath, '');
    } catch (error) {
      console.error('Error clearing logs:', error);
      throw new Error(`Failed to clear logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteLogFile(): Promise<void> {
    try {
      if (existsSync(this.logFilePath)) {
        await unlink(this.logFilePath);
      }
    } catch (error) {
      console.error('Error deleting log file:', error);
      throw new Error(`Failed to delete log file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getLogFilePath(): string {
    return this.logFilePath;
  }
}
