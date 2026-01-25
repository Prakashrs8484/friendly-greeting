const groq = require("../../services/groq.service");
const memoryService = require("../../../../vector/memory.service");
const liveMemoryService = require("../../services/liveMemory.service");

/**
 * Build the agent prompt using:
 *  - system instructions
 *  - a few style samples from user's memories
 *  - top-k relevant memories (as context)
 *  - the user's query
 *
 * Returns { promptText, usedMemories }
 */
async function buildPrompt({ userId, query, topK = 5, memoryTypes = [] }) {

  // 1. Retrieve live draft
  const liveDraft = liveMemoryService.getLiveDraft(userId);
  const liveDraftBlock = liveDraft
    ? `\n### User's Current Live Draft (unsaved)\n${liveDraft.slice(0, 3000)}\n`
    : "";

  // 2. Retrieve relevant long-term memories (saved notes etc.)
  const filters = {};
  if (memoryTypes.length) filters.type = { $in: memoryTypes };

  const categories = ["story", "diary", "academic", "interview", "creative", "daily"];

  for (const cat of categories) {
    if (query.toLowerCase().includes(cat)) {
      filters["metadata.category"] = cat;
      break;
    }
  }
  const memories = await memoryService.searchMemories(query, topK, filters);

  const memoryBlock = memories.length
    ? `\n### Relevant Saved Notes\n${memories
        .map((m, i) => `Note ${i + 1} (${m.type}) — ${m.title}\n${m.excerpt}\n`)
        .join("\n")}`
    : "\n### Relevant Saved Notes\n(None found)\n";

  // 3. Writing style samples (last 3–5 notes)
  const recentNotes = await memoryService.getRecentMemories(5, { type: "note" });
  const styleSamples = recentNotes
    .map((m, i) => `Style Sample ${i + 1}:\n${m.excerpt || m.content.slice(0, 300)}`)
    .join("\n\n");

  const styleBlock = styleSamples
    ? `\n### User Writing Style Samples (mirror this tone)\n${styleSamples}\n`
    : "";

  // 4. System Instruction (optimized)
  const system = `
You are NeuraNotes AI — a personal writing assistant that:
- Mirrors the user's tone, style, emotional depth, and vocabulary.
- Uses the user's live draft + saved notes as context.
- Never invents facts about the user's writing.
- When editing or continuing text, maintain perfect stylistic consistency.
- When unsure, ask clarifying questions.
- Keep output clean, structured, and useful.
`;

  // 5. Final prompt
  const promptText = `
${system}

${liveDraftBlock}
${memoryBlock}
${styleBlock}

### User Request
${query}

### Instructions
- If the request relates to writing, continue / rewrite / enhance using user's style.
- If the request needs information, use saved notes as factual context.
- If no notes match, politely ask for more details.
- Never output statements about "I cannot access your memory" etc.
- Output only the final answer.
`;

  return {
    promptText,
    usedMemories: memories
  };
}


/**
 * Run the agent query:
 * - build prompt
 * - call LLM
 * - return reply and optionally save it as memory
 */
exports.runAgentQuery = async ({ userId, query, topK = 5, memoryTypes = [], saveReply = false }) => {
  if (!query || !query.trim()) throw new Error("query is required");

  // Build prompt & fetch relevant memories
  const { promptText, usedMemories } = await buildPrompt({ userId, query, topK, memoryTypes });

  // Call LLM
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.6,
    messages: [
      { role: "system", content: "You are NeuraNotes assistant." },
      { role: "user", content: promptText }
    ],
  });

  const reply = response?.choices?.[0]?.message?.content?.trim?.() || "";

  // Optionally save reply into memory
  let savedMemory = null;
  if (saveReply && reply) {
    try {
      savedMemory = await memoryService.saveMemory({
        type: "agent_reply",
        title: `Agent reply: ${query.slice(0, 80)}`,
        content: reply,
        excerpt: reply.slice(0, 400),
        metadata: { userId, sourceQuery: query, usedMemoryIds: usedMemories.map(m => m.id), namespace: "notes" }
      });
    } catch (err) {
      console.error("Failed to save agent reply memory:", err);
    }
  }

  return {
    reply,
    usedMemories,
    savedMemory
  };
};

