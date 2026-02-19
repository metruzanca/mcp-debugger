# MCP Debugger

Inspired by Cursor's debug mode, this MCP enables any agent to debug any language provided they have a way to make network requests.

> In this README, "debugger" means an agent-assisted, log-driven debugging workflow. It does **not** mean a low-level/native debugger (such as gdb/lldb) for stepping through compiled machine code.

## Usage

Once installed, simply use the `/debug` command followed by a description of your problem:

```
/debug my button click handler isn't firing
```

The agent will handle the rest - starting the log server, adding instrumentation, and guiding you through the debugging process.

## Example: Flask + React + Debugger Output

The example below shows a common flow:
1. Flask sends server-side events to the log server
2. React sends client-side events from `useEffect`
3. The debugger reads those logs and tests hypotheses

### Flask (Python) logging to the log server

```python
import requests
from flask import Flask, jsonify, request

app = Flask(__name__)
LOG_SERVER_URL = "http://localhost:6969"

def send_debug_log(event: str, **fields) -> None:
    payload = {"source": "flask", "event": event, **fields}
    try:
        requests.post(LOG_SERVER_URL, json=payload, timeout=0.4)
    except requests.RequestException:
        # Keep app behavior unchanged even if logging fails.
        pass

@app.post("/api/checkout")
def checkout():
    body = request.get_json(silent=True) or {}
    user_id = body.get("userId")
    items = body.get("items", [])

    send_debug_log("checkout.request.received", user_id=user_id, item_count=len(items))

    if not user_id:
        send_debug_log("checkout.request.rejected", reason="missing_user_id")
        return jsonify({"error": "missing userId"}), 400

    send_debug_log("checkout.request.accepted", user_id=user_id)
    return jsonify({"ok": True})
```

### React `useEffect` logging

```tsx
import { useEffect } from "react";

type CheckoutProps = { userId: string | null; itemCount: number };

export function CheckoutPage({ userId, itemCount }: CheckoutProps) {
  useEffect(() => {
    fetch("http://localhost:6969", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "react",
        event: "checkout.page.mounted",
        userId,
        itemCount,
      }),
    }).catch(() => {
      // Ignore logging errors in UI flow.
    });
  }, [userId, itemCount]);

  return <button>Checkout</button>;
}
```

### Example debugger-read output

```text
[react] checkout.page.mounted userId=null itemCount=2
[flask] checkout.request.received user_id=null item_count=2
[flask] checkout.request.rejected reason=missing_user_id
```

### Hypotheses the agent can form from these logs

- `userId` is not ready when the page mounts (timing/race between auth bootstrap and checkout call).
- Checkout payload construction drops `userId` before the request is sent.
- Session state exists in one layer (client or server) but is not propagated consistently across both.

The debugger then asks for additional targeted logs to eliminate hypotheses and confirm the root cause.

## Live Log Viewer

While debugging, open `http://localhost:6969` in your browser to watch logs stream in real-time via SSE.

## Installation

```bash
npx -y github:metruzanca/mcp-debugger
```

### Cursor

1. Open Cursor → Settings → MCP Servers
2. Add New MCP Server:
   - Name: `mcp-debugger`
   - Command: `npx`
   - Args: `["-y", "github:metruzanca/mcp-debugger"]`
3. Click "Add Server"
4. Restart Cursor

### Opencode

Add to your MCP server configuration:
- Server Name: `mcp-debugger`
- Command: `npx`
- Arguments: `["-y", "github:metruzanca/mcp-debugger"]`

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-debugger": {
      "command": "npx",
      "args": ["-y", "github:metruzanca/mcp-debugger"]
    }
  }
}
```

## How It Works

1. Agent starts the log collection server
2. Agent generates hypotheses about what could be causing the issue
3. Agent adds `fetch('http://localhost:6969', { method: 'POST', body: /* data */ })` to code at verification points
4. For UI-based apps, agent asks you to reproduce the bug
5. Agent validates hypotheses against collected log data
6. Agent iteratively refines hypotheses until the root cause is found

## Requirements

- Node.js 18+
