const path = require('path');
const { Client } = require('@modelcontextprotocol/sdk/client');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

function getServerPath() {
  if (process.env.NUTRITION_MCP_SERVER_PATH) {
    return process.env.NUTRITION_MCP_SERVER_PATH;
  }

  return path.resolve(__dirname, '../../../../mcp/nutrition.mcp.mjs');
}

function getBackendRoot() {
  return path.resolve(__dirname, '../../../../../');
}

function extractToolResultData(toolResult) {
  if (toolResult && toolResult.structuredContent && typeof toolResult.structuredContent === 'object') {
    return toolResult.structuredContent;
  }

  const textBlock = Array.isArray(toolResult?.content)
    ? toolResult.content.find((entry) => entry && entry.type === 'text' && typeof entry.text === 'string')
    : null;

  if (!textBlock) {
    throw new Error('nutrition_analyze returned no structured content or text payload');
  }

  try {
    return JSON.parse(textBlock.text);
  } catch (error) {
    throw new Error(`nutrition_analyze text payload is not valid JSON: ${error.message}`);
  }
}

async function invokeNutritionAnalyzeViaMcp(text, options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 9000;
  const client = new Client({ name: 'neuradesk-backend', version: '1.0.0' }, { capabilities: {} });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [getServerPath()],
    cwd: getBackendRoot(),
    env: process.env,
    stderr: 'pipe'
  });

  let stderrOutput = '';
  if (transport.stderr) {
    transport.stderr.on('data', (chunk) => {
      stderrOutput += String(chunk);
    });
  }

  const runCall = async () => {
    await client.connect(transport);

    const toolResult = await client.callTool({
      name: 'nutrition_analyze',
      arguments: { text }
    });

    if (toolResult?.isError) {
      throw new Error('nutrition_analyze returned an error result');
    }

    return extractToolResultData(toolResult);
  };

  try {
    return await Promise.race([
      runCall(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`MCP nutrition call timed out after ${timeoutMs}ms`)), timeoutMs);
      })
    ]);
  } catch (error) {
    if (stderrOutput.trim()) {
      error.message = `${error.message} | server stderr: ${stderrOutput.trim()}`;
    }
    throw error;
  } finally {
    try {
      await client.close();
    } catch (closeError) {
      // swallow close failures so primary errors are preserved
    }
  }
}

module.exports = {
  invokeNutritionAnalyzeViaMcp
};
