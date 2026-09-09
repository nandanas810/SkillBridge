const express = require("express");

const router = express.Router();

const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

// ======================================================
// GET MY NOTIFICATIONS
// ======================================================

router.get(
  "/",
  authMiddleware,
  getMyNotifications
);

// ======================================================
// MARK ONE AS READ
// ======================================================

router.put(
  "/:id/read",
  authMiddleware,
  markNotificationAsRead
);

// ======================================================
// MARK ALL AS READ
// ======================================================

router.put(
  "/read-all",
  authMiddleware,
  markAllNotificationsAsRead
);

module.exports = router;