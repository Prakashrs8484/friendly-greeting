const {
  getAgentPages,
  getAgentPageById,
  createAgentPage,
  updateAgentPage,
  deleteAgentPage,
  getWorkspaceData
} = require('../services/agentPage.service');

/**
 * Get all agent pages for the authenticated user
 */
exports.getAgentPages = async (req, res) => {
  try {
    const pages = await getAgentPages(req.user._id);
    return res.json(pages);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Get a specific agent page by ID
 */
exports.getAgentPage = async (req, res) => {
  try {
    const page = await getAgentPageById(req.params.pageId, req.user._id);
    if (!page) {
      return res.status(404).json({ message: 'Agent page not found' });
    }
    return res.json(page);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Create a new agent page
 */
exports.createAgentPage = async (req, res) => {
  try {
    const page = await createAgentPage(req.user._id, req.body);
    return res.status(201).json(page);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Update an agent page
 */
exports.updateAgentPage = async (req, res) => {
  try {
    const page = await updateAgentPage(req.params.pageId, req.user._id, req.body);
    if (!page) {
      return res.status(404).json({ message: 'Agent page not found' });
    }
    return res.json(page);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Delete an agent page
 */
exports.deleteAgentPage = async (req, res) => {
  try {
    const page = await deleteAgentPage(req.params.pageId, req.user._id);
    if (!page) {
      return res.status(404).json({ message: 'Agent page not found' });
    }
    return res.json({ message: 'Agent page deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Get aggregated workspace data: page + agents + features + plans + feature data summary
 * Returns all workspace information in a single request to reduce race conditions and sequential fetches
 */
exports.getWorkspaceData = async (req, res) => {
  try {
    const workspace = await getWorkspaceData(req.params.pageId, req.user._id);
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }
    return res.json({
      success: true,
      data: workspace
    });
  } catch (err) {
    console.error('[Workspace] Error loading workspace:', err);
    return res.status(500).json({ success:false, message: err.message });
  }
};
