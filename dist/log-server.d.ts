export declare class LogServer {
    private server;
    private readonly port;
    private isRunning;
    start(): Promise<void>;
    stop(): Promise<void>;
    getIsRunning(): boolean;
}
