/**
 * Tool Provider Registry Service
 * Manages available tools, providers, and execution policies for agent pages custom agents
 * 
 * Supports: LLM, MCP nutrition, MCP fitness, and extensible provider architecture
 */

const TOOL_PROVIDERS = {
  llm: {
    name: 'LLM',
    description: 'Direct language model calls for reasoning and synthesis',
    tools: ['reason', 'synthesize', 'analyze', 'summarize'],
    requiresAuth: false,
  },
  mcp_nutrition: {
    name: 'MCP Nutrition',
    description: 'Nutrition data, analysis, and recommendations via MCP',
    tools: ['meal_analysis', 'nutrition_plan', 'ingredient_search', 'dietary_insights'],
    requiresAuth: true,
    endpoint: '/api/mcp/nutrition',
  },
  mcp_fitness: {
    name: 'MCP Fitness',
    description: 'Fitness tracking, workout suggestions, and health analytics via MCP',
    tools: ['workout_plan', 'exercise_search', 'fitness_analytics', 'recovery_tips'],
    requiresAuth: true,
    endpoint: '/api/mcp/fitness',
  },
};

const DEFAULT_AGENT_CONFIG = {
  role: 'Assistant',
  tone: 'Helpful',
  creativity: 50,
  verbosity: 50,
  memoryEnabled: true,
  allowedTools: ['llm'], // Only LLM by default
};

/**
 * Get available tools for a provider
 */
function getProviderTools(providerId) {
  const provider = TOOL_PROVIDERS[providerId];
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  return provider.tools;
}

/**
 * Get all available providers
 */
function getAllProviders() {
  return Object.entries(TOOL_PROVIDERS).map(([id, config]) => ({
    id,
    ...config,
  }));
}

/**
 * Get provider configuration by ID
 */
function getProvider(providerId) {
  const provider = TOOL_PROVIDERS[providerId];
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  return {
    id: providerId,
    ...provider,
  };
}

/**
 * Validate tool access for an agent
 * Returns true if the tool is allowed for this agent's configuration
 */
function canAgentUseTool(agentConfig, providerId, toolName) {
  // Check if provider is in allowed tools
  if (!agentConfig.allowedTools || !agentConfig.allowedTools.includes(providerId)) {
    return false;
  }

  // Check if tool exists in provider
  const provider = TOOL_PROVIDERS[providerId];
  if (!provider || !provider.tools.includes(toolName)) {
    return false;
  }

  return true;
}

/**
 * Build runtime parameters from agent config
 * Maps config fields to model parameters for execution
 */
function buildRuntimeParams(agentConfig) {
  const config = { ...DEFAULT_AGENT_CONFIG, ...agentConfig };

  return {
    // Map creativity (0-100) to temperature/top_p for LLM
    temperature: 0.1 + (config.creativity / 100) * 0.9, // Range: 0.1 to 1.0
    top_p: 0.5 + (config.creativity / 100) * 0.5, // Range: 0.5 to 1.0

    // Map verbosity (0-100) to max_tokens
    max_tokens: 256 + Math.floor((config.verbosity / 100) * 1024), // Range: 256 to 1280

    // Memory policy
    includePageMemory: config.memoryEnabled,
    includeAgentMemory: config.memoryEnabled,

    // Tool access
    allowedProviders: config.allowedTools || ['llm'],
  };
}

/**
 * Build system prompt based on agent role, tone, and capabilities
 */
function buildSystemPrompt(agentConfig, pageContext = {}) {
  const config = { ...DEFAULT_AGENT_CONFIG, ...agentConfig };
  const allowedProviders = config.allowedTools || ['llm'];

  let systemPrompt = `You are a ${config.role} assistant with a ${config.tone} tone.`;

  // Add capability hints
  if (allowedProviders.includes('mcp_nutrition')) {
    systemPrompt += '\nYou have access to nutrition analysis and meal planning tools.';
  }
  if (allowedProviders.includes('mcp_fitness')) {
    systemPrompt += '\nYou have access to fitness tracking and workout planning tools.';
  }

  // Add page context if available
  if (pageContext.description) {
    systemPrompt += `\n\nContext: Work within the context of ${pageContext.description}`;
  }

  return systemPrompt;
}

/**
 * Invoke a tool via its provider
 */
async function invokeTool(providerId, toolName, input, mcpControllers = {}) {
  if (!canAgentUseTool({ allowedTools: [providerId] }, providerId, toolName)) {
    throw new Error(`Tool not available: ${providerId}/${toolName}`);
  }

  const provider = getProvider(providerId);

  // Handle LLM tools (no-op, handled by model directly)
  if (providerId === 'llm') {
    return { tool: toolName, status: 'handled_by_model' };
  }

  // Handle MCP providers
  if (providerId === 'mcp_nutrition' && mcpControllers.nutrition) {
    return await mcpControllers.nutrition(toolName, input);
  }

  if (providerId === 'mcp_fitness' && mcpControllers.fitness) {
    return await mcpControllers.fitness(toolName, input);
  }

  throw new Error(`No controller registered for provider: ${providerId}`);
}

module.exports = {
  TOOL_PROVIDERS,
  DEFAULT_AGENT_CONFIG,
  getProviderTools,
  getAllProviders,
  getProvider,
  canAgentUseTool,
  buildRuntimeParams,
  buildSystemPrompt,
  invokeTool,
};
