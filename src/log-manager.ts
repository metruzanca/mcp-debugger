import { readFile, writeFile, truncate, unlink } from 'fs/promises';
import { existsSync } from 'fs';

export interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  headers: any;
  data: any;
}

export class LogManager {
  private readonly logFilePath = './debug-logs.json';

  async readLogs(): Promise<LogEntry[]> {
    try {
      if (!existsSync(this.logFilePath)) {
        return [];
      }
      
      const content = await readFile(this.logFilePath, 'utf-8');
      if (!content.trim()) {
        return [];
      }
      
      return JSON.parse(content) as LogEntry[];
    } catch (error) {
      console.error('Error reading logs:', error);
      return [];
    }
  }

  async appendLog(entry: LogEntry): Promise<void> {
    try {
      const logs = await this.readLogs();
      logs.push(entry);
      await writeFile(this.logFilePath, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('Error appending log:', error);
      throw new Error(`Failed to append log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async clearLogs(): Promise<void> {
    try {
      if (existsSync(this.logFilePath)) {
        await writeFile(this.logFilePath, JSON.stringify([], null, 2));
      }
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