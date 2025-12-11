const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const liveMemoryController = require("../controllers/liveMemory.controller");
const agentController = require("../controllers/agentQuery.controller");

// LIVE DRAFT UPDATE ENDPOINT
router.post("/live", auth, liveMemoryController.updateLiveDraftController);

// AGENT QUERY ENDPOINT
router.post("/query", auth, agentController.agentQueryController);

// GET MEMORIES ENDPOINT
router.get("/memories", auth, agentController.getMemoriesController);

module.exports = router;
