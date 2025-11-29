const router = require("express").Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/planning.controller");

router.post("/projection", auth, controller.generateProjection);
router.post("/preset", auth, controller.savePreset);
router.post("/investment", auth, controller.savePlan);
router.post("/investment/calc", auth, controller.calculateCorpus);
router.get("/context", auth, controller.getPlanningContext);

module.exports = router;
