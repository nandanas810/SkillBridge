const express = require("express");
const router = express.Router();
const { createMentor, getAllMentors, getMyMentor, updateMyMentor, ratePeer } = require("../controllers/mentorController");
const authMiddleware = require("../middleware/authMiddleware");

// Compatibility route name: UI calls these users "peers".
router.get("/", authMiddleware, getAllMentors);
router.get("/me", authMiddleware, getMyMentor);
router.post("/", authMiddleware, createMentor);
router.put("/me", authMiddleware, updateMyMentor);
router.post("/:id/rate", authMiddleware, ratePeer);

module.exports = router;
