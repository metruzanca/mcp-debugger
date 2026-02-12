# MCP Debugger

Inspired by Cursor's debug mode, this MCP enables any agent to debug any language provided they have a way to make network requests.

## Usage

Once installed, simply use the `/debug` command followed by a description of your problem:

```
/debug my button click handler isn't firing
```

The agent will handle the rest - starting the log server, adding instrumentation, and guiding you through the debugging process.

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
