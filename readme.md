# MCP Debugger

Inspired by Cursor's debug mode, this MCP enables any agent to debug any language provided they have a way to make network requests.

## Features

- **start**: Launches a log collection server on localhost:6969
- **stop**: Stops the log collection server and deletes log file
- **clear**: Clears the debug log file
- **mcp-debugger-instructions**: Hypothesis-driven debugging guide with UI reproduction instructions

## How It Works

1. Agent starts the log collection server with the `start` command
2. Agent generates 4-5 hypotheses about what could be causing the issue
3. Agent adds `fetch('localhost:6969', { body: JSON.stringify({ /* debug data */ }) })` to code at specific verification points
4. For UI-based apps, agent asks users to manually reproduce bugs (never simulates UI interactions)
5. Agent validates hypotheses against collected log data using confirmed/disproven/inconclusive criteria
6. Agent iteratively refines hypotheses until the root cause is found
7. Agent clears logs before each test run for clean debugging cycles

## Installation

```bash
# Install globally from GitHub
npm install -g github:metruzanca/mcp-debugger

# Or run directly with npx
npx -y github:metruzanca/mcp-debugger
```

## Client Installation

<details>

<summary>Opencode</summary>

1. In Opencode, add MCP server configuration:
   - Server Name: `mcp-debugger`
   - Command: `npx`
   - Arguments: `["-y", "metruzanca/mcp-debugger"]`
2. Connect to the server
3. The tools (start, stop, clear) will be available in the agent's toolkit

</details>

<summary>Claude Desktop</summary>

1. Open Claude Desktop → Settings → Developer → Edit Config
2. Add the server configuration to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-debugger": {
      "command": "npx",
      "args": ["-y", "metruzanca/mcp-debugger"]
    }
  }
}
```

3. Restart Claude Desktop
4. Look for the hammer icon to verify tools are loaded
</details>

<details>
<summary>Cursor</summary>

1. Open Cursor → Settings → MCP Servers
2. Add New MCP Server:
   - Name: `mcp-debugger`
   - Command: `npx`
   - Args: `["-y", "metruzanca/mcp-debugger"]`
3. Click "Add Server"
4. Restart Cursor to load the new tools
</details>

<details>

## Usage Example

```bash
# Start collecting logs
Agent: Use the start tool to begin log collection

# Add debug logging to your code
await fetch('localhost:6969', {
  body: JSON.stringify({
    variable: userData,
    step: 'validation',
    timestamp: Date.now()
  })
})

# Clear logs before running tests
Agent: Use the clear tool to reset logs

# Analyze collected data
Agent: Read logs to identify the root cause

# Stop when debugging is complete
Agent: Use the stop tool to end the session
```

## Log Format

Logs are stored in `debug-logs.json` in the working directory with structured JSON entries including timestamps and request data.

Example log entry:

```json
{
  "timestamp": "2026-02-10T10:30:00.000Z",
  "method": "POST",
  "url": "/",
  "headers": {
    "content-type": "application/json",
    "host": "localhost:6969"
  },
  "data": {
    "variable": "userData",
    "step": "validation",
    "timestamp": 1725946200000
  }
}
```

## Requirements

- Node.js 18+
- Claude Desktop (latest version)
- @modelcontextprotocol/sdk
- zod
