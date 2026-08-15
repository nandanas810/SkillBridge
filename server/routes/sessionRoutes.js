const express = require("express");

const {
  createSession,
  getMySessions,
  updateSessionStatus,
} = require("../controllers/sessionController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createSession);

router.get("/my", authMiddleware, getMySessions);

// Accept / Reject session
router.put("/:id/status", authMiddleware, updateSessionStatus);

module.exports = router;