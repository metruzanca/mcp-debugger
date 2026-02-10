export type LogData = any;
export declare class LogManager {
    private readonly logFilePath;
    readLogs(): Promise<string>;
    appendLog(data: LogData): Promise<void>;
    clearLogs(): Promise<void>;
    deleteLogFile(): Promise<void>;
    getLogFilePath(): string;
}
