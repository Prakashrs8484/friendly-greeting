const router = require("express").Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/notes.controller");

router.post("/create", auth, controller.createNote);
router.get("/all", auth, controller.getAllNotes);
router.post("/update/:id", auth, controller.updateNote);
router.delete("/delete/:id", auth, controller.deleteNote);
router.get("/:id", auth, controller.getNoteById);

module.exports = router;
