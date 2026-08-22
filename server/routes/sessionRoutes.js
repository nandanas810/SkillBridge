const express = require("express");

const router = express.Router();

const {
  createSession,
  getMySessions,
  updateSessionStatus,
  rateCompletedSession,
} = require("../controllers/sessionController");

const authMiddleware = require("../middleware/authMiddleware");

// =========================================
// CREATE SESSION REQUEST
// =========================================

router.post(
  "/",
  authMiddleware,
  createSession
);

// =========================================
// GET MY SESSIONS
// =========================================

router.get(
  "/my",
  authMiddleware,
  getMySessions
);

// =========================================
// ACCEPT / REJECT / COMPLETE
// =========================================

router.put(
  "/:id/status",
  authMiddleware,
  updateSessionStatus
);

// =========================================
// RATE + REVIEW COMPLETED SESSION
// =========================================

router.post(
  "/:id/review",
  authMiddleware,
  rateCompletedSession
);

module.exports = router;