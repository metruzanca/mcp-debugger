#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { LogServer } from './log-server.js';
import { LogManager } from './log-manager.js';
const logManager = new LogManager();
const logServer = new LogServer(logManager);
const server = new McpServer({
    name: 'mcp-debugger',
    version: '1.0.0'
});
server.tool('start', 'Start the log collection server on localhost:6969', {}, async () => {
    try {
        await logServer.start();
        return {
            content: [
                {
                    type: 'text',
                    text: 'Log collection server started on localhost:6969. You can now add fetch calls to your code to collect debug data.'
                }
            ]
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Failed to start log server: ${error instanceof Error ? error.message : 'Unknown error'}`
                }
            ]
        };
    }
});
server.tool('stop', 'Stop the log collection server and delete log file', {}, async () => {
    try {
        await logServer.stop();
        await logManager.deleteLogFile();
        return {
            content: [
                {
                    type: 'text',
                    text: 'Log collection server stopped and log file deleted successfully.'
                }
            ]
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Failed to stop log server: ${error instanceof Error ? error.message : 'Unknown error'}`
                }
            ]
        };
    }
});
server.tool('clear', 'Clear the debug log file contents', {}, async () => {
    try {
        await logManager.clearLogs();
        return {
            content: [
                {
                    type: 'text',
                    text: 'Debug log file cleared successfully.'
                }
            ]
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Failed to clear logs: ${error instanceof Error ? error.message : 'Unknown error'}`
                }
            ]
        };
    }
});
server.registerPrompt('mcp-debugger-instructions', {
    title: 'MCP Debugger Instructions',
    description: 'How to use MCP Debugger for hypothesis-driven debugging',
    argsSchema: {}
}, () => ({
    messages: [
        {
            role: 'user',
            content: {
                type: 'text',
                text: `You are an MCP Debugger assistant. Use this systematic approach to debug code:

## **Phase 1: Hypothesis Generation**
1. **Start Collection**: Use the 'start' tool to launch the log collection server on localhost:6969

2. **Analyze the Problem**: Review the error, stack trace, and code to understand what's happening

3. **Generate 4-5 Hypotheses**: Based on your analysis, formulate 4-5 specific hypotheses about what could be causing the issue. Consider:
   - Variable values at key points
   - Control flow paths (if/else, loops)
   - Function call sequences
   - Data transformations
   - State changes over time

4. **Identify Verification Points**: For each hypothesis, determine exactly where in the code you need to check values to prove or disprove it

## **Phase 2: Instrument & Collect**
**Important**: For web apps, desktop apps, or any application with a user interface, you MUST ask the user to manually reproduce the bug. Do not attempt to simulate UI interactions yourself.

5. **Request Reproduction** (for UI-based apps): Ask the user to reproduce the issue:
   - "Please navigate to [specific page/screen] and perform [specific action] to trigger the bug"
   - "The logging code I've added will capture data automatically as you use the app"
   - "Once you've reproduced the issue, let me know and I'll analyze the collected logs"

6. **Clear Logs**: Use the 'clear' tool to ensure a clean slate before reproduction begins

7. **Add Log Points**: Insert fetch calls at the specific verification points identified for your hypotheses. The user will trigger these logs when they interact with the UI:
   \`\`\`javascript
   await fetch('localhost:6969', {
     body: JSON.stringify({
       hypothesis: 'Hypothesis 1: Variable X is undefined',
       location: 'functionName:lineNumber',
       variableName: variableValue,
       expected: 'should be defined',
       actual: variableValue,
       timestamp: Date.now()
     })
   })
   \`\`\`

   Add logs at the specific points identified for each hypothesis. Include:
   - Which hypothesis you're testing
   - Current values of relevant variables
   - Expected vs actual behavior
   - Location in the code (function name, line number)

## **Phase 3: Execute & Validate**
8. **Wait for User Input** (UI apps): If this is a UI-based app, wait for the user to:
   - Reproduce the bug manually
   - Confirm they've completed the reproduction
   - Then proceed to read the logs

9. **Read Logs**: Check the debug-logs.json file to see what was captured from the user's reproduction

10. **Evaluate Hypotheses**: For each hypothesis:
   - ✓ **Confirmed**: Log data matches the hypothesis - you found the issue!
   - ✗ **Disproven**: Log data contradicts the hypothesis - eliminate this possibility
   - ? **Inconclusive**: Need more data - add additional log points

11. **Refine**: If all hypotheses are disproven or inconclusive:
    - Generate new hypotheses based on the data collected
    - Add more specific log points
    - Repeat the cycle

## **Phase 4: Resolution**
12. **Fix the Issue**: Once a hypothesis is confirmed, implement the fix

13. **Verify the Fix**: Run the code again to confirm the issue is resolved

14. **Stop & Clean**: Use the 'stop' tool to end the session (this also deletes the log file)

## **Best Practices**
- Start with high-level hypotheses, then narrow down
- Include both "happy path" and "edge case" scenarios in your hypotheses
- Log variable state before AND after operations that might be problematic
- Use descriptive hypothesis descriptions so you can track which log verifies which hypothesis
- If stuck, add more granular log points rather than guessing
- Always ask users to manually reproduce UI-based bugs

## **Example Hypothesis Set**
- Hypothesis 1: The API response is null/undefined
- Hypothesis 2: The data parsing logic is failing on unexpected format
- Hypothesis 3: The variable is being reassigned incorrectly in a loop
- Hypothesis 4: The error is occurring in an async operation that's not awaited
- Hypothesis 5: The state is being mutated unexpectedly by a side effect`
            }
        }
    ]
}));
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP Debugger server running...');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
