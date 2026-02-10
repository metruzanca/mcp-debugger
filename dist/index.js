#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { LogServer } from './log-server.js';
import { clearLogs, deleteLogFile } from './log-manager.js';
const logServer = new LogServer();
const server = new McpServer({
    name: 'mcp-debugger',
    version: '1.0.0'
});
server.tool('start', 'Start the log collection server on localhost:6969', {}, async () => {
    try {
        await logServer.start();
        return { content: [{ type: 'text', text: 'Log server started on localhost:6969' }] };
    }
    catch (error) {
        return { content: [{ type: 'text', text: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
    }
});
server.tool('stop', 'Stop the log collection server and delete log file', {}, async () => {
    try {
        await logServer.stop();
        await deleteLogFile();
        return { content: [{ type: 'text', text: 'Log server stopped and log file deleted' }] };
    }
    catch (error) {
        return { content: [{ type: 'text', text: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
    }
});
server.tool('clear', 'Clear debug log file', {}, async () => {
    try {
        await clearLogs();
        return { content: [{ type: 'text', text: 'Log file cleared' }] };
    }
    catch (error) {
        return { content: [{ type: 'text', text: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
    }
});
server.registerPrompt('debug', {
    title: 'Debug Instructions',
    description: 'Hypothesis-driven debugging workflow',
    argsSchema: {}
}, () => ({
    messages: [
        {
            role: 'user',
            content: {
                type: 'text',
                text: `You are an MCP Debugger assistant. Use this systematic approach to debug code:

## Phase 1: Hypothesis Generation
1. **Start Collection**: Use the 'start' tool to launch the log collection server on localhost:6969
2. **Analyze the Problem**: Review the error, stack trace, and code
3. **Generate 4-5 Hypotheses**: Formulate specific hypotheses about the cause. Consider:
   - Variable values at key points
   - Control flow paths (if/else, loops)
   - Function call sequences
   - Data transformations
   - State changes over time
4. **Identify Verification Points**: For each hypothesis, determine where to add logs

## Phase 2: Instrument & Collect
**Important**: For UI-based apps (web, desktop), ask the user to manually reproduce the bug.

5. **Request Reproduction** (UI apps): Ask user to trigger the bug
6. **Clear Logs**: Use 'clear' tool before reproduction
7. **Add Log Points**: Insert fetch calls at verification points:
   \`\`\`javascript
   fetch('localhost:6969', { body: JSON.stringify({ hypothesis: 1, value: x }) })
   fetch('localhost:6969', { body: 'checkpoint: after validation' })
   \`\`\`

## Phase 3: Execute & Validate
8. **Wait for User** (UI apps): Let user reproduce the bug
9. **Read Logs**: Check .debug.log file
10. **Evaluate Hypotheses**:
   - ✓ Confirmed: Found the issue
   - ✗ Disproven: Eliminate this possibility
   - ? Inconclusive: Add more log points
11. **Refine**: If needed, generate new hypotheses and repeat

## Phase 4: Resolution
12. **Fix**: Implement the fix
13. **Verify**: Confirm issue is resolved
14. **Stop**: Use 'stop' tool (deletes log file)

## Best Practices
- Start high-level, then narrow down
- Log before AND after problematic operations
- Always ask users to reproduce UI bugs manually`
            }
        }
    ]
}));
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch(() => process.exit(1));
