const groq = require('../../system/services/groq.service');

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
 * 1. Builds a system prompt with agent role, tone, and user context
 * 2. Prepares conversation history for context
 * 3. Calls Groq LLM API to generate contextual, AI-driven responses
 * 4. Returns the LLM-generated response
 * 
 * @param {Object} agent - The agent object with name, role, tone, description
 * @param {string} userInput - User's message
 * @param {Array} agentHistory - Agent's previous messages [{ role, content, createdAt }]
 * @param {Object} pageContext - { pageLevelMessages, featureSummaries, featureFacts }
 * @returns {Promise<string>} AI-generated response from LLM
 */
async function executeAgent(agent, userInput, agentHistory = [], pageContext = {}) {
  if (!userInput || userInput.trim() === '') {
    userInput = "Hello";
  }

  const agentName = agent.name || "Agent";
  const role = agent.config?.role || agent.role || "assistant";
  const tone = agent.config?.tone || agent.tone || "neutral";
  const agentDescription = agent.description || '';
  
  const featureSummaries = pageContext.featureSummaries || [];
  const pageLevelMessages = pageContext.pageLevelMessages || [];
  const featureFacts = pageContext.featureFacts || {};

  console.log('[Agent Execution - LLM Driven] Agent:', agentName, 'Role:', role, 'Tone:', tone);

  // Build AI system prompt with context
  const systemPrompt = buildSystemPrompt(agentName, role, tone, agentDescription, pageContext);

  // Generate LLM response with conversation history
  return await callLLM(agent, userInput, agentHistory, systemPrompt);
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
 * Call Groq LLM API to generate response
 */
async function callLLM(agent, userInput, agentHistory, systemPrompt) {
  try {
    console.log('[LLM] Generating response for:', agent.name);

    // Build message history for context window
    const messages = [];
    
    // Include recent history (max 10 messages) for context
    if (agentHistory && agentHistory.length > 0) {
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

    // Call Groq API with system prompt
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,  // Balanced creativity and consistency
      max_tokens: 500,   // Reasonable response length
      top_p: 0.95
    });

    const generatedResponse = response.choices[0]?.message?.content?.trim();

    if (!generatedResponse) {
      console.warn('[LLM] Empty response received');
      return `I apologize, but I'm having trouble generating a response. Please try again.`;
    }

    console.log('[LLM] Response generated successfully:', generatedResponse.substring(0, 80));
    return generatedResponse;

  } catch (error) {
    console.error('[LLM] Error calling Groq API:', error.message);
    
    // Fallback response if LLM fails
    return `I'm ${agent.name}, your ${agent.config?.role || 'assistant'}. I'm currently unable to respond. Please try again in a moment.`;
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
