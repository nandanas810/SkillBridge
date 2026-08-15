const express = require("express");
const router = express.Router();

const {
    createMentor,
    getAllMentors,
    getMyMentor,
    updateMyMentor
} = require("../controllers/mentorController");

const authMiddleware = require("../middleware/authMiddleware");


// Create mentor
router.post("/", authMiddleware, createMentor);


// Get all mentors
router.get("/", authMiddleware, getAllMentors);


// Get logged-in mentor
router.get("/me", authMiddleware, getMyMentor);


// Update/Create logged-in mentor profile
router.put("/me", authMiddleware, updateMyMentor);


module.exports = router;