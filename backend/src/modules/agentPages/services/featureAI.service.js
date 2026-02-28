const { getPageFeatureData, updateAISummary } = require('./featureData.service');
const { saveMessage } = require('./message.service');

/**
 * Feature AI Service
 * Generates AI summaries and insights for feature data
 * 
 * TODO: Future enhancements:
 * - Use actual LLM for intelligent summaries
 * - Generate actionable insights
 * - Detect patterns and trends
 */

/**
 * Generate a summary for feature data
 * @param {string} featureType - Type of feature
 * @param {Array} data - Feature data array
 * @returns {string} AI-generated summary
 */
const generateFeatureSummary = (featureType, data) => {
  if (!data || data.length === 0) {
    return `No ${featureType} data available yet.`;
  }

  const count = data.length;
  
  switch (featureType) {
    case 'ideas':
      return `You have ${count} idea${count !== 1 ? 's' : ''} captured. ${count > 3 ? 'Consider grouping similar ideas together.' : 'Keep adding more ideas!'}`;
    
    case 'research-tracker':
      const active = data.filter(item => item.status === 'active').length;
      const completed = data.filter(item => item.status === 'completed').length;
      return `Research tracker: ${count} topic${count !== 1 ? 's' : ''} total (${active} active, ${completed} completed). ${completed > 0 ? 'Great progress!' : 'Focus on completing active research.'}`;
    
    case 'todo':
      const completedTodos = data.filter(item => item.completed).length;
      return `Todo list: ${count} task${count !== 1 ? 's' : ''} (${completedTodos} completed). ${completedTodos === count && count > 0 ? 'All tasks completed! 🎉' : 'Keep up the momentum!'}`;
    
    case 'notes':
      return `Notes: ${count} note${count !== 1 ? 's' : ''} saved. ${count > 5 ? 'Consider organizing notes by topic.' : 'Continue building your knowledge base.'}`;
    
    default:
      return `${featureType} feature has ${count} item${count !== 1 ? 's' : ''}.`;
  }
};

/**
 * Generate insights for feature data
 * @param {string} featureType - Type of feature
 * @param {Array} data - Feature data array
 * @returns {Array<string>} Array of insights
 */
const generateFeatureInsights = (featureType, data) => {
  if (!data || data.length === 0) {
    return [];
  }

  const insights = [];
  
  switch (featureType) {
    case 'ideas':
      if (data.length > 5) {
        insights.push('You have many ideas! Consider prioritizing the most impactful ones.');
      }
      if (data.length > 10) {
        insights.push('Consider grouping similar ideas together to identify patterns.');
      }
      break;
    
    case 'research-tracker':
      const active = data.filter(item => item.status === 'active').length;
      if (active > 5) {
        insights.push('You have many active research topics. Consider focusing on 2-3 at a time.');
      }
      const completed = data.filter(item => item.status === 'completed').length;
      if (completed > 0 && active === 0) {
        insights.push('Great work completing your research! Time to start new topics.');
      }
      break;
    
    case 'todo':
      const overdue = data.filter(item => item.dueDate && new Date(item.dueDate) < new Date() && !item.completed);
      if (overdue.length > 0) {
        insights.push(`You have ${overdue.length} overdue task${overdue.length !== 1 ? 's' : ''}. Consider reprioritizing.`);
      }
      break;
  }
  
  return insights;
};

/**
 * Process feature data and generate summaries for page memory
 * - Saves summaries to page-level memory (agentId = null, source = 'feature')
 * - Returns summaries for use in agent context
 * @param {string} pageId - The Agent Page ID
 * @returns {Promise<Array>} Array of feature summaries
 */
const processPageFeatures = async (pageId) => {
  console.log('[Feature AI Service] [AI PROCESSING] Processing features for page:', pageId);
  const featureData = await getPageFeatureData(pageId);
  console.log('[Feature AI Service] [DB READ] Loaded', featureData.length, 'feature data entries');
  const summaries = [];
  
  for (const fd of featureData) {
    // Generate summary if not already generated or data is stale
    const needsUpdate = !fd.aiSummary || 
      !fd.aiSummaryUpdatedAt || 
      new Date(fd.updatedAt) > new Date(fd.aiSummaryUpdatedAt);
    
    if (needsUpdate && fd.data && Array.isArray(fd.data) && fd.data.length > 0) {
      console.log('[Feature AI Service] [AI PROCESSING] Generating summary for:', fd.featureType, 'Items:', fd.data.length);
      const summary = generateFeatureSummary(fd.featureType, fd.data);
      
      console.log('[Feature AI Service] [DB WRITE] Updating AI summary in FeatureData...');
      await updateAISummary(pageId, fd.featureId, summary);
      
      // Save summary to page-level memory (agentId = null, source = 'feature')
      console.log('[Feature AI Service] [DB WRITE] Saving feature summary to page memory...');
      await saveMessage(pageId, null, 'agent', `${fd.featureType}: ${summary}`, 'feature', fd.featureId);
      
      summaries.push({
        featureId: fd.featureId,
        featureType: fd.featureType,
        summary
      });
      console.log('[Feature AI Service] [AI PROCESSING] Summary generated and saved:', fd.featureType);
    } else if (fd.aiSummary) {
      summaries.push({
        featureId: fd.featureId,
        featureType: fd.featureType,
        summary: fd.aiSummary
      });
    }
  }
  
  console.log('[Feature AI Service] [AI PROCESSING] Processed', summaries.length, 'feature summaries');
  return summaries;
};

/**
 * Answer question about feature data using summaries
 * @param {string} pageId - The Agent Page ID
 * @param {string} question - User's question
 * @returns {Promise<string>} AI-generated answer
 */
const answerFeatureQuestion = async (pageId, question) => {
  const lowerQuestion = question.toLowerCase();
  const summaries = await processPageFeatures(pageId);
  
  if (summaries.length === 0) {
    return "I don't have any feature data to reference yet. Try adding some data to your features first!";
  }
  
  // Simple question answering based on keywords
  if (lowerQuestion.includes('idea') || lowerQuestion.includes('ideas')) {
    const ideasSummary = summaries.find(s => s.featureType === 'ideas');
    if (ideasSummary) {
      return `Based on your ideas feature: ${ideasSummary.summary}`;
    }
  }
  
  if (lowerQuestion.includes('research')) {
    const researchSummary = summaries.find(s => s.featureType === 'research-tracker');
    if (researchSummary) {
      return `Based on your research tracker: ${researchSummary.summary}`;
    }
  }
  
  if (lowerQuestion.includes('todo') || lowerQuestion.includes('task')) {
    const todoSummary = summaries.find(s => s.featureType === 'todo');
    if (todoSummary) {
      return `Based on your todo list: ${todoSummary.summary}`;
    }
  }
  
  if (lowerQuestion.includes('summarize') || lowerQuestion.includes('overview')) {
    const allSummaries = summaries.map(s => `${s.featureType}: ${s.summary}`).join('\n');
    return `Here's an overview of your features:\n${allSummaries}`;
  }
  
  // Default: return combined summary
  const combinedSummary = summaries.map(s => s.summary).join(' ');
  return `Based on your features: ${combinedSummary}`;
};

module.exports = {
  generateFeatureSummary,
  generateFeatureInsights,
  processPageFeatures,
  answerFeatureQuestion
};
