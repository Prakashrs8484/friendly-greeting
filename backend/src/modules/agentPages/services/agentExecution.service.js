/**
 * Get conversation stage from agent memory
 * @param {Object} agent - The agent object
 * @returns {string} Current stage: "awaiting_goal" | "goal_received" | "guidance_given" | null
 */
const getAgentStage = (agent) => {
  return agent.memory?.conversationStage || null;
};

/**
 * Update conversation stage in agent memory
 * @param {string} agentId - The agent ID
 * @param {string} stage - New stage: "awaiting_goal" | "goal_received" | "guidance_given" | null
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
 * Execute an agent with DB-backed memory (agent history + page context).
 * - Uses role- and feature-specific prompts
 * - Tracks conversation stages to prevent repetition
 * - References feature data and previous actions
 * - Do NOT re-introduce the agent if history exists.
 * - Respond based on agentHistory + pageContext for non-generic replies.
 *
 * @param {Object} agent - The agent object
 * @param {string} userInput - User's message
 * @param {Array} agentHistory - This agent's chat history [{ role, content, createdAt }]
 * @param {Object} pageContext - { pageLevelMessages, featureSummaries, featureFacts }
 * @returns {Promise<{response: string, newStage?: string}>} Agent's response and optional stage update
 */
async function executeAgent(agent, userInput, agentHistory = [], pageContext = {}) {
  if (!userInput || userInput.trim() === '') {
    userInput = "Hello";
  }

  const agentName = agent.name || "Agent";
  const role = agent.config?.role || agent.role || "assistant";
  const tone = agent.config?.tone || agent.tone || "neutral";
  const featureSummaries = pageContext.featureSummaries || [];
  const pageLevelMessages = pageContext.pageLevelMessages || [];
  const featureFacts = pageContext.featureFacts || {};

  const hasHistory = agentHistory.length > 0;
  const hasFeatureData = featureSummaries.length > 0;
  const hasPageContext = pageLevelMessages.length > 0;

  console.log('[Agent Execution] Agent:', agentName, 'Role:', role, 'Tone:', tone);
  console.log('[Agent Execution] Context:', { hasHistory, hasFeatureData, hasPageContext });

  // Prompt pattern (for future LLM use). Context is INTERNAL ONLY.
  const SYSTEM_PROMPT = [
    "You are an assistant. Use the provided context to answer the user.",
    "DO NOT repeat memory or feature summaries.",
    "Respond only with new, helpful information."
  ].join("\n");

  // 2–3 internal bullets from page memory (NEVER shown verbatim to user)
  const summarizePageMemory = (messages = []) => {
    const recent = (messages || []).slice(-3).map(m => (m && m.content ? String(m.content) : '')).filter(Boolean);
    return recent.slice(0, 3).map(t => `- ${t.length > 80 ? `${t.slice(0, 77)}...` : t}`);
  };

  // Internal facts from feature data (NEVER dump raw summaries)
  const summarizeFeatureFacts = (factsByType = {}) => {
    const facts = [];
    for (const [type, f] of Object.entries(factsByType || {})) {
      if (!f || typeof f !== 'object') continue;
      if (type === 'todo') {
        facts.push(`${type}: ${f.count ?? 0} tasks (${f.completed ?? 0} completed)`);
        continue;
      }
      if (type === 'research-tracker') {
        facts.push(`${type}: ${f.count ?? 0} topics (${f.active ?? 0} active, ${f.completed ?? 0} completed)`);
        continue;
      }
      facts.push(`${type}: ${f.count ?? 0} items`);
    }
    return facts;
  };

  // Internal-only compressed context (do not output)
  const _internal = {
    system: SYSTEM_PROMPT,
    pageMemoryBullets: summarizePageMemory(pageLevelMessages),
    featureFacts: summarizeFeatureFacts(featureFacts)
  };
  console.log('[Agent Execution] Internal context prepared:', {
    memoryBullets: _internal.pageMemoryBullets.length,
    featureFacts: _internal.featureFacts.length
  });

  const lowerInput = userInput.toLowerCase();
  const wantsOverview = lowerInput.includes('summarize') || lowerInput.includes('overview') || lowerInput.includes('recap');
  const askingAboutFeatures = lowerInput.includes('feature') || lowerInput.includes('ideas') || lowerInput.includes('idea') || lowerInput.includes('todo') || lowerInput.includes('task') || lowerInput.includes('research');

  // Get current conversation stage
  const currentStage = getAgentStage(agent);
  const rolePrompt = role.toLowerCase();
  const isCoach = rolePrompt.includes('coach') || rolePrompt.includes('clarity') || rolePrompt.includes('advisor') || rolePrompt.includes('consultant') || rolePrompt.includes('counselor');
  
  // Stage-based progression for coaches/advisors
  if (isCoach && hasHistory) {
    // Check if user cancelled
    const isCancelled = lowerInput.includes('cancel') || lowerInput.includes('stop') || lowerInput.includes('nevermind') || lowerInput.includes('forget it');
    
    if (currentStage === 'awaiting_goal') {
      // User provided input - treat as goal unless explicitly cancelled
      if (!isCancelled && userInput.trim().length > 0) {
        const response = `Got it. Here's your next step: ${userInput.trim().substring(0, 100)}. What's your biggest constraint right now?`;
        return { response, newStage: 'goal_received' };
      }
      // Still waiting for goal
      return { response: "What's the main goal you want to achieve? I'll help you break it down into actionable steps." };
    }
    
    if (currentStage === 'goal_received') {
      // Give guidance and advance stage
      const response = `Based on what you've shared, here's your next step: Focus on one small action you can take today. What feels most achievable right now?`;
      return { response, newStage: 'guidance_given' };
    }
    
    if (currentStage === 'guidance_given') {
      // Continue conversation naturally without repeating stage-1 prompts
      if (lowerInput.includes('help') || lowerInput.includes('next') || lowerInput.includes('what')) {
        return { response: "What's blocking you right now? Let's address that first." };
      }
      return { response: "Tell me what you've tried so far, or what's holding you back." };
    }
    
    // No stage set yet - initialize if this is a coach
    if (!currentStage && hasHistory) {
      // Check if user already provided a goal in their message
      if (userInput.trim().length > 10 && !isCancelled) {
        return { response: `I understand. Let's break this down. What's your biggest constraint (time, resources, or something else)?`, newStage: 'goal_received' };
      }
      return { response: "What's the main goal you want to achieve? I'll help you break it down into actionable steps.", newStage: 'awaiting_goal' };
    }
  }

  // If this agent already has conversation history, do NOT re-introduce; respond in context
  if (hasHistory) {
    // Role-specific prompt enforcement (already set above for coaches)
    const isAdvisor = rolePrompt.includes('advisor') || rolePrompt.includes('consultant') || rolePrompt.includes('counselor');
    const isIdeaSpark = rolePrompt.includes('idea') || rolePrompt.includes('creative') || rolePrompt.includes('brainstorm');
    const isTodoManager = rolePrompt.includes('todo') || rolePrompt.includes('task') || rolePrompt.includes('manager') || rolePrompt.includes('organizer');
    
    // If user explicitly asks for a summary/overview, return compact facts (not raw memory/summaries)
    if (wantsOverview || (askingAboutFeatures && lowerInput.includes('what'))) {
      const facts = _internal.featureFacts;
      if (facts.length === 0) return "I don’t have any feature data yet. Add a few items, then ask me for an overview.";
      return `Here’s a quick snapshot:\n- ${facts.slice(0, 4).join('\n- ')}`;
    }
    
    // Role-specific responses
    if (lowerInput.includes('insight') || lowerInput.includes('help') || lowerInput.includes('advice')) {
      if (isAdvisor) return "Tell me your goal and your biggest constraint (time, money, energy, deadline). I’ll suggest the next 1–2 best moves.";
      if (isTodoManager) return "Do you want help prioritizing, breaking tasks down, or creating a short plan for today?";
      if (isIdeaSpark) return "Do you want to expand ideas, pick the best one, or turn one into a concrete plan?";
      return "What outcome do you want, and what have you tried so far?";
    }
    
    if (lowerInput.includes('yes') || lowerInput.includes('yeah') || lowerInput.includes('sure')) {
      return "Great—what’s the next thing you want to work on?";
    }
    
    // Default: answer intent without restating context
    if (lowerInput.includes('todo') || lowerInput.includes('task')) {
      const f = featureFacts.todo;
      if (f) return `Want to prioritize your tasks? You have ${f.count ?? 0} total (${f.completed ?? 0} done). Tell me what “done today” looks like.`;
      return "Want to work on tasks? Tell me what you need to get done and by when.";
    }
    if (lowerInput.includes('idea') || lowerInput.includes('ideas')) {
      const f = featureFacts.ideas;
      if (f) return `Want to refine or choose an idea? You have ${f.count ?? 0} captured. What’s the goal for this idea session?`;
      return "Want to brainstorm or refine an idea? Tell me the problem you’re solving and your target user.";
    }
    if (lowerInput.includes('research')) {
      const f = featureFacts['research-tracker'];
      if (f) return `Want help with research planning? You have ${f.count ?? 0} topics (${f.active ?? 0} active). What’s the one question you need answered first?`;
      return "What are you researching, and what decision will it inform?";
    }
    return "Tell me what you want to achieve, and I’ll help you with a clear next step.";
  }

  // No agent history: first message in this agent's thread. Use page context if available, then introduce once.
  if (wantsOverview) {
    const facts = _internal.featureFacts;
    if (facts.length === 0) return "I don’t have any feature data yet. Add a few items, then ask me for an overview.";
    return `Here’s a quick snapshot:\n- ${facts.slice(0, 4).join('\n- ')}`;
  }

  // First message - send role- and feature-aware introduction (only when no history)
  // rolePrompt already declared above, reuse it
  const isAdvisor = rolePrompt.includes('advisor') || rolePrompt.includes('consultant') || rolePrompt.includes('counselor');
  const isIdeaSpark = rolePrompt.includes('idea') || rolePrompt.includes('creative') || rolePrompt.includes('brainstorm');
  const isTodoManager = rolePrompt.includes('todo') || rolePrompt.includes('task') || rolePrompt.includes('manager') || rolePrompt.includes('organizer');
  
  const greetings = {
    'Friendly': `Hi! I'm ${agentName}. I'm here to help as your ${role}. What would you like to do?`,
    'Formal': `Hello. I am ${agentName}, your ${role}. How may I assist you today?`,
    'Motivational': `Hey! I'm ${agentName}, your ${role}. What are we working on today?`,
    'Neutral': `Hello. I'm ${agentName}, your ${role}. How can I assist you?`
  };
  
  const response = greetings[tone] || greetings['Neutral'];
  console.log('[Agent Execution] Generated response (first message):', response.substring(0, 100));
  return response;
}

/**
 * Get agent execution history (placeholder)
 */
const getExecutionHistory = async (agentId) => {
  // Placeholder - in future, store execution logs in database
  return [];
};

module.exports = {
  executeAgent,
  getExecutionHistory,
  getAgentStage,
  updateAgentStage
};
