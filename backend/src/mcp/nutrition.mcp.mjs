import { createRequire } from 'node:module';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const require = createRequire(import.meta.url);
const { analyzeNutritionText } = require('../modules/mcp/nutrition/services/nutritionAnalyzer.service.js');

const server = new McpServer({
  name: 'neuradesk-nutrition',
  version: '1.0.0'
});

server.registerTool(
  'nutrition_analyze',
  {
    title: 'Nutrition Analyzer',
    description: 'Analyze Indian food input and return deterministic calorie and protein totals.',
    inputSchema: z.object({
      text: z.string().min(1).describe('Natural language food log such as "3 idli and 1 scoop whey"')
    })
  },
  async ({ text }) => {
    const result = analyzeNutritionText(text);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ],
      structuredContent: result
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('NeuraDesk nutrition MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in nutrition MCP server:', error);
  process.exit(1);
});
