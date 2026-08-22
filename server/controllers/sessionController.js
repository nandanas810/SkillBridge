const User = require("../models/userModel");
const Session = require("../models/sessionModel");

// ======================================================
// CREATE PEER LEARNING REQUEST
// ======================================================

const createSession = async (req, res) => {
  try {
    const {
      receiver,
      date,
      time,
      message,
    } = req.body;

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!receiver || !date || !time) {
      return res.status(400).json({
        message: "Peer, date and time are required",
      });
    }

    // -----------------------------------------------
    // FIND RECEIVING STUDENT
    // -----------------------------------------------

    const peer = await User.findById(receiver);

    if (!peer) {
      return res.status(404).json({
        message: "Peer not found",
      });
    }

    // -----------------------------------------------
    // PREVENT SELF REQUEST
    // -----------------------------------------------

    if (
      receiver.toString() ===
      req.user.id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot send a learning request to yourself",
      });
    }

    // -----------------------------------------------
    // CREATE SESSION
    // -----------------------------------------------

    const session = await Session.create({
      sender: req.user.id,
      receiver: receiver,
      date,
      time,
      message: message || "",
      status: "Pending",
      meetingUrl: "",
    });

    // -----------------------------------------------
    // POPULATE USERS
    // -----------------------------------------------

    await session.populate(
      "sender",
      "name email"
    );

    await session.populate(
      "receiver",
      "name email"
    );

    res.status(201).json({
      message:
        "Peer learning request sent successfully",
      session,
    });
  } catch (error) {
    console.error(
      "CREATE SESSION ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create peer learning request",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY SESSIONS
// ======================================================
//
// Without type:
//   returns BOTH sent and received
//
// ?type=sent:
//   only requests I sent
//
// ?type=received:
//   only requests I received
//
// ======================================================

const getMySessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const type = String(
      req.query.type || "all"
    ).toLowerCase();

    // ==================================================
    // REQUESTS I SENT
    // ==================================================

    const sent = await Session.find({
      sender: userId,
    })
      .populate(
        "sender",
        "name email"
      )
      .populate(
        "receiver",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    // ==================================================
    // REQUESTS I RECEIVED
    // ==================================================

    const received = await Session.find({
      receiver: userId,
    })
      .populate(
        "sender",
        "name email"
      )
      .populate(
        "receiver",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    // ==================================================
    // ONLY SENT
    // ==================================================

    if (type === "sent") {
      return res.json({
        message:
          "Sent requests fetched successfully",
        sessions: sent,
        sent: sent,
        received: [],
      });
    }

    // ==================================================
    // ONLY RECEIVED
    // ==================================================

    if (type === "received") {
      return res.json({
        message:
          "Received requests fetched successfully",
        sessions: received,
        sent: [],
        received: received,
      });
    }

    // ==================================================
    // ALL
    // ==================================================

    return res.json({
      message:
        "Peer learning sessions fetched successfully",

      // IMPORTANT:
      // Dashboard uses sessions as SENT requests

      sessions: sent,

      sent: sent,

      received: received,
    });
  } catch (error) {
    console.error(
      "GET MY SESSIONS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch peer learning sessions",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE SESSION STATUS
// ACCEPT / REJECT / COMPLETE
// ======================================================

const updateSessionStatus = async (
  req,
  res
) => {
  try {
    const requestedStatus = String(
      req.body.status || ""
    ).toLowerCase();

    let newStatus = null;

    if (requestedStatus === "accepted") {
      newStatus = "Accepted";
    }

    if (requestedStatus === "rejected") {
      newStatus = "Rejected";
    }

    if (requestedStatus === "completed") {
      newStatus = "Completed";
    }

    if (!newStatus) {
      return res.status(400).json({
        message:
          "Invalid session status. Use Accepted, Rejected or Completed.",
      });
    }

    // ==================================================
    // FIND SESSION
    // ==================================================

    const session = await Session.findById(
      req.params.id
    );

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    const currentUser =
      req.user.id.toString();

    const senderId =
      session.sender.toString();

    const receiverId =
      session.receiver.toString();

    // ==================================================
    // ACCEPT / REJECT
    // ==================================================
    //
    // ONLY RECEIVER CAN ACCEPT OR REJECT
    //

    if (
      newStatus === "Accepted" ||
      newStatus === "Rejected"
    ) {
      if (receiverId !== currentUser) {
        return res.status(403).json({
          message:
            "Only the student who received this request can accept or reject it.",
        });
      }
    }

    // ==================================================
    // COMPLETE
    // ==================================================
    //
    // Either participant can mark an accepted session
    // as completed.
    //

    if (newStatus === "Completed") {
      if (
        senderId !== currentUser &&
        receiverId !== currentUser
      ) {
        return res.status(403).json({
          message:
            "You are not part of this learning session.",
        });
      }

      if (session.status !== "Accepted") {
        return res.status(400).json({
          message:
            "Only an accepted session can be completed.",
        });
      }
    }

    // ==================================================
    // ACCEPT
    // ==================================================

    if (newStatus === "Accepted") {
      session.status = "Accepted";

      // Create ONE unique Jitsi room
      // for this exact session.

      if (!session.meetingUrl) {
        session.meetingUrl =
          `https://meet.jit.si/SkillBridge-${session._id}`;
      }
    }

    // ==================================================
    // REJECT
    // ==================================================

    if (newStatus === "Rejected") {
      session.status = "Rejected";
      session.meetingUrl = "";
    }

    // ==================================================
    // COMPLETE
    // ==================================================

    if (newStatus === "Completed") {
      session.status = "Completed";
    }

    // ==================================================
    // SAVE
    // ==================================================

    await session.save();

    // ==================================================
    // POPULATE
    // ==================================================

    await session.populate(
      "sender",
      "name email"
    );

    await session.populate(
      "receiver",
      "name email"
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    res.json({
      message:
        `Session ${newStatus.toLowerCase()} successfully`,

      session,
    });
  } catch (error) {
    console.error(
      "UPDATE SESSION STATUS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update session status",
      error: error.message,
    });
  }
};

// ======================================================
// RATE / REVIEW COMPLETED SESSION
// ======================================================
//
// The student who SENT the request can review the
// student who RECEIVED it.
//
// ======================================================

const rateCompletedSession = async (
  req,
  res
) => {
  try {
    const {
      rating,
      comment = "",
    } = req.body;

    const value = Number(rating);

    // ==================================================
    // VALIDATE RATING
    // ==================================================

    if (
      !Number.isInteger(value) ||
      value < 1 ||
      value > 5
    ) {
      return res.status(400).json({
        message:
          "Rating must be between 1 and 5",
      });
    }

    // ==================================================
    // FIND SESSION
    // ==================================================

    const session = await Session.findById(
      req.params.id
    );

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // ==================================================
    // MUST BE COMPLETED
    // ==================================================

    if (session.status !== "Completed") {
      return res.status(400).json({
        message:
          "You can rate and review a peer only after the session is completed.",
      });
    }

    // ==================================================
    // ONLY SENDER CAN REVIEW
    // ==================================================

    if (
      session.sender.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        message:
          "Only the student who sent the request can submit the review.",
      });
    }

    // ==================================================
    // FIND RECEIVER
    // ==================================================

    const peer = await User.findById(
      session.receiver
    );

    if (!peer) {
      return res.status(404).json({
        message:
          "Receiving student not found",
      });
    }

    // ==================================================
    // FIND REVIEWER
    // ==================================================

    const reviewer = await User.findById(
      req.user.id
    );

    if (!reviewer) {
      return res.status(404).json({
        message:
          "Reviewer not found",
      });
    }

    // ==================================================
    // MAKE SURE REVIEWS EXISTS
    // ==================================================

    if (!peer.reviews) {
      peer.reviews = [];
    }

    // ==================================================
    // CHECK EXISTING REVIEW
    // ==================================================

    const existingIndex =
      peer.reviews.findIndex(
        (review) =>
          review.reviewer &&
          review.reviewer.toString() ===
            req.user.id.toString()
      );

    // ==================================================
    // NEW REVIEW
    // ==================================================

    const newReview = {
      reviewer: reviewer._id,
      reviewerName: reviewer.name,
      rating: value,
      comment: String(comment).trim(),
    };

    // ==================================================
    // UPDATE EXISTING REVIEW
    // ==================================================

    if (existingIndex >= 0) {
      peer.reviews[existingIndex] =
        newReview;
    } else {
      peer.reviews.push(newReview);
    }

    // ==================================================
    // REVIEW COUNT
    // ==================================================

    peer.reviewCount =
      peer.reviews.length;

    // ==================================================
    // CALCULATE RATING
    // ==================================================

    const totalRating =
      peer.reviews.reduce(
        (sum, review) =>
          sum +
          Number(review.rating || 0),
        0
      );

    peer.rating =
      peer.reviewCount > 0
        ? Number(
            (
              totalRating /
              peer.reviewCount
            ).toFixed(1)
          )
        : 0;

    // ==================================================
    // SAVE USER
    // ==================================================

    await peer.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    res.json({
      message:
        "Rating and review submitted successfully",

      rating: peer.rating,

      reviewCount:
        peer.reviewCount,
    });
  } catch (error) {
    console.error(
      "RATE COMPLETED SESSION ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to submit rating and review",

      error: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createSession,
  getMySessions,
  updateSessionStatus,
  rateCompletedSession,
};