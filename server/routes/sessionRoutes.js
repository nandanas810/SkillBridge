const express = require("express");

const {
  createSession,
  getMySessions,
} = require("../controllers/sessionController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createSession);

router.get("/my", authMiddleware, getMySessions);

module.exports = router;