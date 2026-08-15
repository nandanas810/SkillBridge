const User = require("../models/userModel");
const Session = require("../models/sessionModel");
const Mentor = require("../models/Mentor");

// ===============================
// CREATE SESSION
// ===============================
const createSession = async (req, res) => {
  try {
    const { mentor, date, time, message } = req.body;

    if (!mentor || !date || !time) {
      return res.status(400).json({
        message: "Mentor, date and time are required",
      });
    }

    const session = await Session.create({
      student: req.user.id,
      mentor,
      date,
      time,
      message,
    });

    res.status(201).json({
      message: "Session request sent successfully",
      session,
    });
  } catch (error) {
    console.error("Create session error:", error);

    res.status(500).json({
      message: "Failed to create session",
      error: error.message,
    });
  }
};


// ===============================
// GET MY SESSIONS
// ===============================
const getMySessions = async (req, res) => {
  try {
    // Find logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let sessions;

    // ===============================
    // STUDENT
    // ===============================
    if (user.role === "student") {
      sessions = await Session.find({
        student: req.user.id,
      })
        .populate("mentor")
        .populate("student", "name email")
        .sort({ createdAt: -1 });
    }

    // ===============================
    // MENTOR
    // ===============================
    else if (user.role === "mentor") {
      // Find mentor profile belonging to logged-in user
      const mentor = await Mentor.findOne({
        email: user.email,
      });

      if (!mentor) {
        return res.status(404).json({
          message: `Mentor profile not found for email: ${user.email}`,
        });
      }

      // Find requests sent to this mentor
      sessions = await Session.find({
        mentor: mentor._id,
      })
        .populate("mentor")
        .populate("student", "name email")
        .sort({ createdAt: -1 });
    }

    else {
      return res.status(403).json({
        message: "Invalid user role",
      });
    }

    res.status(200).json({
      message: "Sessions fetched successfully",
      sessions,
    });

  } catch (error) {
    console.error("Get sessions error:", error);

    res.status(500).json({
      message: "Failed to fetch sessions",
      error: error.message,
    });
  }
};


// ===============================
// UPDATE SESSION STATUS
// ===============================
const updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    let newStatus;

    if (status && status.toLowerCase() === "accepted") {
      newStatus = "Accepted";
    } else if (status && status.toLowerCase() === "rejected") {
      newStatus = "Rejected";
    } else {
      return res.status(400).json({
        message: "Invalid session status",
      });
    }

    // Find session
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Find logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Only mentors can accept/reject
    if (user.role !== "mentor") {
      return res.status(403).json({
        message: "Only mentors can update sessions",
      });
    }

    // Find mentor profile
    const mentor = await Mentor.findOne({
      email: user.email,
    });

    if (!mentor) {
      return res.status(404).json({
        message: `Mentor profile not found for email: ${user.email}`,
      });
    }

    console.log("========== SESSION DEBUG ==========");
    console.log("Session ID:", session._id.toString());
    console.log("Session Mentor ID:", session.mentor.toString());
    console.log("Logged-in Mentor ID:", mentor._id.toString());
    console.log("Logged-in Mentor Email:", mentor.email);
    console.log("==================================");

    // Check whether this session belongs to logged-in mentor
    if (session.mentor.toString() !== mentor._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this session",
      });
    }

    // Update status
    session.status = newStatus;

    await session.save();

    res.status(200).json({
      message: `Session ${newStatus} successfully`,
      session,
    });

  } catch (error) {
    console.error("Update session status error:", error);

    res.status(500).json({
      message: "Failed to update session status",
      error: error.message,
    });
  }
};


// ===============================
// EXPORT
// ===============================
module.exports = {
  createSession,
  getMySessions,
  updateSessionStatus,
};