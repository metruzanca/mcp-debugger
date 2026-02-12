export declare class LogServer {
    private server;
    private readonly port;
    private isRunning;
    private sseClients;
    start(): Promise<void>;
    private broadcast;
    stop(): Promise<void>;
    getIsRunning(): boolean;
}
