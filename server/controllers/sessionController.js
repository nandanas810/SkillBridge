const Session = require("../models/sessionModel");

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
    });
  }
};

const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      student: req.user.id,
    })
      .populate("mentor")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Sessions fetched successfully",
      sessions,
    });
  } catch (error) {
    console.error("Get sessions error:", error);

    res.status(500).json({
      message: "Failed to fetch sessions",
    });
  }
};

module.exports = {
  createSession,
  getMySessions,
};