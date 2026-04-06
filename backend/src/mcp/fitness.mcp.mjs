import { createRequire } from 'node:module';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const require = createRequire(import.meta.url);
const {
  analyzeFitnessText,
} = require('../modules/mcp/fitness/services/fitnessCoachAnalyzer.service.js');

const server = new McpServer({
  name: 'neuradesk-fitness',
  version: '1.0.0',
});

server.registerTool(
  'fitness_coach_generate',
  {
    title: 'Fitness Coach Generator',
    description:
      'Generate a consistent fitness coach response from parsed actions and dashboard context.',
    inputSchema: z.object({
      text: z.string().optional().default(''),
      parsedActions: z.array(z.record(z.any())).default([]),
      dashboard: z.record(z.any()).default({}),
    }),
  },
  async ({ text, parsedActions, dashboard }) => {
    const result = analyzeFitnessText(text || '', parsedActions || [], dashboard || {});

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
      structuredContent: result,
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('NeuraDesk fitness MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in fitness MCP server:', error);
  process.exit(1);
});
