import { LogManager } from './log-manager.js';
export declare class LogServer {
    private logManager;
    private server;
    private readonly port;
    private isRunning;
    constructor(logManager: LogManager);
    start(): Promise<void>;
    stop(): Promise<void>;
    private handleRequest;
    getIsRunning(): boolean;
}
