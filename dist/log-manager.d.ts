export interface LogEntry {
    timestamp: string;
    method: string;
    url: string;
    headers: any;
    data: any;
}
export declare class LogManager {
    private readonly logFilePath;
    readLogs(): Promise<LogEntry[]>;
    appendLog(entry: LogEntry): Promise<void>;
    clearLogs(): Promise<void>;
    deleteLogFile(): Promise<void>;
    getLogFilePath(): string;
}
