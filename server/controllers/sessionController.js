const User = require("../models/userModel");
const Session = require("../models/sessionModel");
const {
  createNotification,
} = require("./notificationController");

// ======================================================
// AVAILABILITY HELPER FUNCTIONS
// ======================================================

// Convert time such as:
// 6:00 PM -> minutes from midnight
// 18:00   -> minutes from midnight
const parseTimeToMinutes = (timeText) => {
  if (!timeText) {
    return null;
  }

  let text = String(timeText)
    .trim()
    .toUpperCase()
    .replace(/\./g, "");

  // ----------------------------------------------------
  // 12-hour format
  // Example: 6:00 PM
  // ----------------------------------------------------

  const twelveHourMatch = text.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/
  );

  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2] || 0);
    const period = twelveHourMatch[3];

    if (
      hour < 1 ||
      hour > 12 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    if (period === "AM" && hour === 12) {
      hour = 0;
    }

    if (period === "PM" && hour !== 12) {
      hour += 12;
    }

    return hour * 60 + minute;
  }

  // ----------------------------------------------------
  // 24-hour format
  // Example: 18:00
  // ----------------------------------------------------

  const twentyFourHourMatch = text.match(
    /^(\d{1,2}):(\d{2})$/
  );

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);

    if (
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    return hour * 60 + minute;
  }

  return null;
};

// ======================================================
// GET WEEKDAY FROM YYYY-MM-DD
// ======================================================

const getDayName = (dateString) => {
  const parts = String(dateString).split("-");

  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  // UTC is used so the weekday does not change because
  // of the server's timezone.
  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return days[date.getUTCDay()];
};

// ======================================================
// CHECK WHETHER AN AVAILABILITY LINE MATCHES THE DAY
// ======================================================

const availabilityMatchesDay = (
  availabilityText,
  selectedDay
) => {
  const text = String(availabilityText)
    .trim()
    .toLowerCase();

  const day = selectedDay.toLowerCase();

  // Exact weekday
  if (text.includes(day)) {
    return true;
  }

  // Weekdays = Monday to Friday
  if (
    text.includes("weekday") &&
    ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(
      day
    )
  ) {
    return true;
  }

  // Weekends = Saturday and Sunday
  if (
    text.includes("weekend") &&
    ["saturday", "sunday"].includes(day)
  ) {
    return true;
  }

  return false;
};

// ======================================================
// GET TIME RANGE FROM AVAILABILITY TEXT
// ======================================================
//
// Supported examples:
//
// Monday 6:00 PM - 8:00 PM
// Monday 18:00 - 20:00
// Weekdays 6:00 PM - 8:00 PM
// Saturday 10 AM - 1 PM
// Monday evening
//
// ======================================================

const getAvailabilityRange = (availabilityText) => {
  const text = String(availabilityText)
    .trim()
    .toUpperCase();

  // ----------------------------------------------------
  // Find a time range
  // ----------------------------------------------------

  const rangeMatch = text.match(
    /(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*(?:-|–|—|TO)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i
  );

  if (rangeMatch) {
    let startText = rangeMatch[1].trim();
    let endText = rangeMatch[2].trim();

    // --------------------------------------------------
    // Handle cases such as:
    //
    // 6 PM - 8 PM
    // 6 AM - 8 AM
    //
    // Already fine.
    //
    // For:
    // 6 - 8 PM
    //
    // Apply PM to the starting time too.
    // --------------------------------------------------

    if (
      /(?:AM|PM)$/i.test(endText) &&
      !/(?:AM|PM)$/i.test(startText)
    ) {
      const endPeriod = endText.match(
        /(AM|PM)$/i
      );

      if (endPeriod) {
        startText = `${startText} ${endPeriod[1]}`;
      }
    }

    const startMinutes =
      parseTimeToMinutes(startText);

    const endMinutes =
      parseTimeToMinutes(endText);

    if (
      startMinutes !== null &&
      endMinutes !== null &&
      startMinutes < endMinutes
    ) {
      return {
        start: startMinutes,
        end: endMinutes,
      };
    }
  }

  // ----------------------------------------------------
  // Common text-based periods
  // ----------------------------------------------------

  if (text.includes("MORNING")) {
    return {
      start: 6 * 60,
      end: 12 * 60,
    };
  }

  if (text.includes("AFTERNOON")) {
    return {
      start: 12 * 60,
      end: 17 * 60,
    };
  }

  if (text.includes("EVENING")) {
    return {
      start: 17 * 60,
      end: 22 * 60,
    };
  }

  if (text.includes("NIGHT")) {
    return {
      start: 18 * 60,
      end: 23 * 60,
    };
  }

  return null;
};

// ======================================================
// CHECK PEER AVAILABILITY
// ======================================================

const isPeerAvailable = (
  availability,
  selectedDate,
  selectedTime
) => {
  if (
    !Array.isArray(availability) ||
    availability.length === 0
  ) {
    return {
      available: false,
      reason:
        "This peer has not added any availability yet.",
    };
  }

  const selectedDay =
    getDayName(selectedDate);

  if (!selectedDay) {
    return {
      available: false,
      reason: "Invalid session date.",
    };
  }

  const selectedMinutes =
    parseTimeToMinutes(selectedTime);

  if (selectedMinutes === null) {
    return {
      available: false,
      reason: "Invalid session time.",
    };
  }

  // ----------------------------------------------------
  // Check every availability slot
  // ----------------------------------------------------

  for (const slot of availability) {
    if (
      !availabilityMatchesDay(
        slot,
        selectedDay
      )
    ) {
      continue;
    }

    const range =
      getAvailabilityRange(slot);

    if (!range) {
      continue;
    }

    // Session time must fall inside the range.
    if (
      selectedMinutes >= range.start &&
      selectedMinutes <= range.end
    ) {
      return {
        available: true,
      };
    }
  }

  return {
    available: false,
    reason:
      `The peer is not available on ${selectedDay} at ${selectedTime}. Please choose a time within the peer's available slots.`,
  };
};

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
        message:
          "Peer, date and time are required",
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

    // ==================================================
    // CHECK PEER AVAILABILITY
    // ==================================================

    const availabilityCheck =
      isPeerAvailable(
        peer.availability,
        date,
        time
      );

    if (!availabilityCheck.available) {
      return res.status(400).json({
        message:
          availabilityCheck.reason,
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

    // ==================================================
    // CREATE NOTIFICATION FOR RECEIVING STUDENT
    // ==================================================

    const senderUser =
      await User.findById(req.user.id);

    if (senderUser) {
      await createNotification({
        recipient: receiver,
        sender: req.user.id,
        type: "session_request",
        message: `${senderUser.name} sent you a learning session request.`,
        session: session._id,
      });
    }

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
    // CREATE NOTIFICATION FOR SENDER
    // ==================================================

    if (
      newStatus === "Accepted" ||
      newStatus === "Rejected"
    ) {
      const receiverUser =
        await User.findById(receiverId);

      if (receiverUser) {
        let notificationMessage = "";

        if (newStatus === "Accepted") {
          notificationMessage =
            `${receiverUser.name} accepted your learning session request.`;
        }

        if (newStatus === "Rejected") {
          notificationMessage =
            `${receiverUser.name} rejected your learning session request.`;
        }

        await createNotification({
          recipient: senderId,
          sender: receiverId,
          type:
            newStatus === "Accepted"
              ? "session_accepted"
              : "session_rejected",
          message: notificationMessage,
          session: session._id,
        });
      }
    }

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