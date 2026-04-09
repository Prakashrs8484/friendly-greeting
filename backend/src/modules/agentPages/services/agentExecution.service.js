const groq = require('../../system/services/groq.service');
const toolProvider = require('./toolProvider.service');

/**
 * Get conversation stage from agent memory
 * @param {Object} agent - The agent object
 * @returns {string} Current stage in conversation
 */
const getAgentStage = (agent) => {
  return agent.memory?.conversationStage || null;
};

/**
 * Update conversation stage in agent memory
 * @param {string} agentId - The agent ID
 * @param {string} stage - New conversation stage
 * @returns {Promise<void>}
 */
const updateAgentStage = async (agentId, stage) => {
  const Agent = require('../models/agent.model');
  await Agent.findByIdAndUpdate(agentId, {
    $set: {
      'memory.conversationStage': stage,
      updatedAt: new Date()
    }
  });
  console.log('[Agent Execution] Updated agent stage:', { agentId, stage });
};

/**
 * Execute an agent with AI-driven response generation using LLM (Groq)
 * 
 * This function:
 * 1. Builds a system prompt with agent role, tone, capabilities, and user context
 * 2. Maps agent config (creativity, verbosity, memoryEnabled) to runtime parameters
 * 3. Prepares conversation history for context
 * 4. Calls Groq LLM API to generate contextual, AI-driven responses
 * 5. Returns the LLM-generated response with execution metadata
 * 
 * @param {Object} agent - The agent object with config (role, tone, creativity, verbosity, allowedTools)
 * @param {string} userInput - User's message
 * @param {Array} agentHistory - Agent's previous messages [{ role, content, createdAt }]
 * @param {Object} pageContext - { pageLevelMessages, featureSummaries, featureFacts }
 * @returns {Promise<Object>} { response: string, metadata: { tools: [...], tokens: number, latency: number } }
 */
async function executeAgent(agent, userInput, agentHistory = [], pageContext = {}) {
  const executionStart = Date.now();
  const executionMetadata = {
    tools: [],
    tokens: 0,
    latency: 0,
    source: 'llm'
  };

  if (!userInput || userInput.trim() === '') {
    userInput = "Hello";
  }

  const agentName = agent.name || "Agent";
  const agentDescription = agent.description || '';
  
  console.log('[Agent Execution] Agent:', agentName, 'Config:', agent.config);

  // Build runtime parameters from agent config
  const runtimeParams = toolProvider.buildRuntimeParams(agent.config);
  
  // Build AI system prompt with agent config, tools, and context
  const systemPrompt = toolProvider.buildSystemPrompt(agent.config, {
    description: agentDescription,
    ...pageContext
  });

  console.log('[Agent Execution] Runtime params:', { 
    temperature: runtimeParams.temperature,
    max_tokens: runtimeParams.max_tokens,
    allowedProviders: runtimeParams.allowedProviders
  });

  // Generate LLM response with conversation history and config-based parameters
  const result = await callLLM(agent, userInput, agentHistory, systemPrompt, runtimeParams);
  
  executionMetadata.latency = Date.now() - executionStart;
  
  return {
    response: result.response,
    metadata: executionMetadata,
    newStage: null // Optional: Can be updated by specialized agents
  };
}

/**
 * Build system prompt for the LLM with agent personality and context
 */
function buildSystemPrompt(agentName, role, tone, description, pageContext) {
  // Agent personality
  let personality = `You are ${agentName}, a ${role} with a ${tone.toLowerCase()} tone.`;
  
  if (description) {
    personality += ` You specialize in: ${description}`;
  }

  // Tone guidance
  let toneGuidance = '';
  if (tone === 'Friendly') {
    toneGuidance = 'Be warm, conversational, and approachable.';
  } else if (tone === 'Formal') {
    toneGuidance = 'Maintain a professional, respectful tone.';
  } else if (tone === 'Motivational') {
    toneGuidance = 'Be encouraging, inspiring, and action-oriented.';
  } else {
    toneGuidance = 'Provide clear, objective, factual responses.';
  }

  // User context
  const contextParts = [];
  
  if (pageContext.pageLevelMessages && pageContext.pageLevelMessages.length > 0) {
    const recent = pageContext.pageLevelMessages
      .slice(-3)
      .map(m => m.content)
      .filter(Boolean)
      .join('\n');
    if (recent) {
      contextParts.push(`Recent user activity:\n${recent}`);
    }
  }

  if (pageContext.featureFacts && Object.keys(pageContext.featureFacts).length > 0) {
    const facts = [];
    for (const [type, data] of Object.entries(pageContext.featureFacts)) {
      if (data && data.count !== undefined) {
        facts.push(`${type}: ${data.count} items`);
      }
    }
    if (facts.length > 0) {
      contextParts.push(`User data:\n- ${facts.join('\n- ')}`);
    }
  }

  const contextSection = contextParts.length > 0 
    ? `\n\nUser Context:\n${contextParts.join('\n\n')}`
    : '';

  return `${personality} ${toneGuidance}${contextSection}

Guidelines:
- Respond naturally and human-like
- Reference context when relevant, but don't be repetitive
- Ask clarifying questions when needed
- Keep responses concise unless more detail is requested
- Focus on providing value and moving the conversation forward`;
}

/**
 * Call Groq LLM API to generate response with config-based runtime parameters
 */
async function callLLM(agent, userInput, agentHistory, systemPrompt, runtimeParams) {
  try {
    console.log('[LLM] Generating response for:', agent.name);

    // Build message history for context window
    const messages = [];
    
    // Include recent history (respecting memory settings) for context
    if (runtimeParams.includeAgentMemory && agentHistory && agentHistory.length > 0) {
      const recentHistory = agentHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === 'agent' ? 'assistant' : msg.role,
          content: msg.content
        });
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userInput
    });

    // Call Groq API with config-driven runtime parameters
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: runtimeParams.temperature || 0.7,
      max_tokens: runtimeParams.max_tokens || 500,
      top_p: runtimeParams.top_p || 0.95
    });

    const generatedResponse = response.choices[0]?.message?.content?.trim();

    if (!generatedResponse) {
      console.warn('[LLM] Empty response received');
      return {
        response: `I apologize, but I'm having trouble generating a response. Please try again.`,
        tokens: 0
      };
    }

    console.log('[LLM] Response generated successfully:', generatedResponse.substring(0, 80));
    
    // Return response with token estimate
    return {
      response: generatedResponse,
      tokens: response.usage?.completion_tokens || 0
    };

  } catch (error) {
    console.error('[LLM] Error calling Groq API:', error.message);
    
    // Fallback response if LLM fails
    return {
      response: `I'm ${agent.name}, your ${agent.config?.role || 'assistant'}. I'm currently unable to respond. Please try again in a moment.`,
      tokens: 0
    };
  }
}

/**
 * Get agent execution history
 */
const getExecutionHistory = async (agentId) => {
  // Placeholder for future execution logging
  return [];
};

module.exports = {
  executeAgent,
  getExecutionHistory,
  getAgentStage,
  updateAgentStage
};
