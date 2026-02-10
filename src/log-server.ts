import { appendFile } from 'fs/promises';
import { createServer, Server } from 'http';

const LOG_FILE = './.debug.log';

export class LogServer {
  private server: Server | null = null;
  private readonly port = 6969;
  private isRunning = false;

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Log server is already running');
    }

    this.server = createServer(async (req, res) => {
      let body = '';
      req.on('data', (chunk: Buffer) => body += chunk.toString());
      req.on('end', async () => {
        if (body.trim()) {
          await appendFile(LOG_FILE, body.trim() + '\n');
        }
        res.end();
      });
    });

    return new Promise((resolve, reject) => {
      this.server!.listen(this.port, () => {
        this.isRunning = true;
        resolve();
      });
      this.server!.on('error', reject);
    });
  }

  async stop(): Promise<void> {
    if (!this.isRunning || !this.server) {
      throw new Error('Log server is not running');
    }

    return new Promise((resolve, reject) => {
      this.server!.close((error) => {
        if (error) reject(error);
        else {
          this.isRunning = false;
          this.server = null;
          resolve();
        }
      });
    });
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }
}
