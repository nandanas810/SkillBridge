const express = require("express");
const router = express.Router();

const {
    createMentor,
    getAllMentors
} = require("../controllers/mentorController");

const authMiddleware = require("../middleware/authMiddleware");

// Create mentor
router.post("/", authMiddleware, createMentor);

// Get all mentors
router.get("/", authMiddleware, getAllMentors);

module.exports = router;