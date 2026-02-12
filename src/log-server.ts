import { appendFile } from 'fs/promises';
import { createServer, Server, ServerResponse } from 'http';

const LOG_FILE = './.debug.log';

const HTML_PAGE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MCP Debugger Logs</title>
  <style>
    :root {
      color-scheme: light dark;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
      font-size: 13px;
      line-height: 1.5;
      background: light-dark(#fff, #1a1a1a);
      color: light-dark(#333, #e0e0e0);
      padding: 1rem;
      overflow-y: scroll;
    }
    #logs {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    #logs p {
      white-space: pre-wrap;
      word-break: break-all;
      padding: 0.25rem 0.5rem;
      background: light-dark(#f5f5f5, #252525);
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div id="logs"></div>
  <script>
    const logs = document.getElementById('logs');
    const evtSource = new EventSource('/events');
    
    evtSource.onmessage = (event) => {
      const p = document.createElement('p');
      p.textContent = event.data;
      logs.appendChild(p);
      window.scrollTo(0, document.body.scrollHeight);
    };
    
    evtSource.onerror = () => {
      const p = document.createElement('p');
      p.textContent = '[Connection lost]';
      p.style.color = 'red';
      logs.appendChild(p);
    };
  </script>
</body>
</html>`;

export class LogServer {
  private server: Server | null = null;
  private readonly port = 6969;
  private isRunning = false;
  private sseClients: Set<ServerResponse> = new Set();

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Log server is already running');
    }

    this.server = createServer(async (req, res) => {
      const url = new URL(req.url || '/', `http://localhost:${this.port}`);
      
      // Serve HTML page at root
      if (req.method === 'GET' && url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(HTML_PAGE);
        return;
      }
      
      // SSE endpoint for streaming logs
      if (req.method === 'GET' && url.pathname === '/events') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });
        res.write('\n');
        
        this.sseClients.add(res);
        
        req.on('close', () => {
          this.sseClients.delete(res);
        });
        return;
      }
      
      // Log ingestion (POST or any other method with body)
      let body = '';
      req.on('data', (chunk: Buffer) => body += chunk.toString());
      req.on('end', async () => {
        if (body.trim()) {
          await appendFile(LOG_FILE, body.trim() + '\n');
          this.broadcast(body.trim());
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
  
  private broadcast(message: string): void {
    for (const client of this.sseClients) {
      client.write(`data: ${message}\n\n`);
    }
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
