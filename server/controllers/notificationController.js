const Notification = require("../models/notificationModel");

// ======================================================
// GET MY NOTIFICATIONS
// ======================================================

const getMyNotifications = async (req, res) => {
  try {
    const notifications =
      await Notification.find({
        recipient: req.user.id,
      })
        .populate(
          "sender",
          "name email"
        )
        .populate(
          "session",
          "date time status"
        )
        .sort({
          createdAt: -1,
        });

    const unreadCount =
      await Notification.countDocuments({
        recipient: req.user.id,
        read: false,
      });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "GET NOTIFICATIONS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// ======================================================
// MARK ONE NOTIFICATION AS READ
// ======================================================

const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const notification =
      await Notification.findOne({
        _id: req.params.id,
        recipient: req.user.id,
      });

    if (!notification) {
      return res.status(404).json({
        message:
          "Notification not found",
      });
    }

    notification.read = true;

    await notification.save();

    res.json({
      message:
        "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "MARK NOTIFICATION READ ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update notification",
      error: error.message,
    });
  }
};

// ======================================================
// MARK ALL NOTIFICATIONS AS READ
// ======================================================

const markAllNotificationsAsRead =
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          recipient: req.user.id,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );

      res.json({
        message:
          "All notifications marked as read",
      });
    } catch (error) {
      console.error(
        "MARK ALL NOTIFICATIONS READ ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update notifications",
        error: error.message,
      });
    }
  };

// ======================================================
// CREATE NOTIFICATION
// ======================================================
//
// This helper is used by the session controller.
// It is NOT an API endpoint.
//

const createNotification = async ({
  recipient,
  sender,
  type,
  message,
  session,
}) => {
  try {
    return await Notification.create({
      recipient,
      sender,
      type,
      message,
      session,
    });
  } catch (error) {
    console.error(
      "CREATE NOTIFICATION ERROR:",
      error
    );

    throw error;
  }
};

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
};