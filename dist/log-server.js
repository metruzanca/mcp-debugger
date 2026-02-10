import { createServer } from 'http';
export class LogServer {
    logManager;
    server = null;
    port = 6969;
    isRunning = false;
    constructor(logManager) {
        this.logManager = logManager;
    }
    async start() {
        if (this.isRunning) {
            throw new Error('Log server is already running');
        }
        this.server = createServer((req, res) => {
            this.handleRequest(req, res);
        });
        return new Promise((resolve, reject) => {
            this.server.listen(this.port, () => {
                this.isRunning = true;
                resolve();
            });
            this.server.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    reject(new Error(`Port ${this.port} is already in use`));
                }
                else {
                    reject(error);
                }
            });
        });
    }
    async stop() {
        if (!this.isRunning || !this.server) {
            throw new Error('Log server is not running');
        }
        return new Promise((resolve, reject) => {
            this.server.close((error) => {
                if (error) {
                    reject(error);
                }
                else {
                    this.isRunning = false;
                    this.server = null;
                    resolve();
                }
            });
        });
    }
    async handleRequest(req, res) {
        if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
        }
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const logData = JSON.parse(body);
                await this.logManager.appendLog({
                    timestamp: new Date().toISOString(),
                    method: req.method,
                    url: req.url,
                    headers: req.headers,
                    data: logData
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Log entry recorded'
                }));
            }
            catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Invalid JSON or logging failed',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }));
            }
        });
        req.on('error', (error) => {
            console.error('Request error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        });
    }
    getIsRunning() {
        return this.isRunning;
    }
}
