const Mentor = require("../models/Mentor");
const User = require("../models/userModel");
const Session = require("../models/sessionModel");

// =========================================
// FIND COMMON SKILLS
// =========================================

const overlap = (a = [], b = []) => {
  const setB = new Set(
    b.map((x) =>
      String(x).trim().toLowerCase()
    )
  );

  return a.filter((x) =>
    setB.has(
      String(x).trim().toLowerCase()
    )
  );
};

// =========================================
// ENSURE PEER PROFILE EXISTS
// =========================================

const ensurePeerProfile = async (user) => {
  let profile = await Mentor.findOne({
    user: user._id,
  });

  if (!profile) {
    profile = await Mentor.findOne({
      email: user.email,
    });
  }

  if (!profile) {
    profile = await Mentor.create({
      user: user._id,
      name: user.name,
      email: user.email,
      skills: user.skillsToTeach || [],
      skillsToLearn: user.skillsToLearn || [],
      bio:
        user.bio ||
        "Peer learner ready to exchange skills.",
      availability: user.availability || [],
      rating: user.rating || 0,
      reviewCount: user.reviewCount || 0,
      badges: user.badges || [],
    });
  }

  return profile;
};

// =========================================
// CONVERT USER TO PEER OBJECT
// =========================================

const toPeer = (
  user,
  profile,
  currentUser,
  search = ""
) => {
  const teaches =
    user.skillsToTeach?.length
      ? user.skillsToTeach
      : profile.skills || [];

  const learns =
    user.skillsToLearn?.length
      ? user.skillsToLearn
      : profile.skillsToLearn || [];

  const requested = search
    .trim()
    .toLowerCase();

  // =========================================
  // SEARCH ONLY CAN-TEACH SKILLS
  // =========================================

  const teachesRequested = requested
    ? teaches.some((skill) =>
        String(skill)
          .trim()
          .toLowerCase()
          .includes(requested)
      )
    : false;

  // =========================================
  // TWO-WAY MATCHING
  // =========================================

  const teachMatch = overlap(
    currentUser?.skillsToLearn,
    teaches
  );

  const learnMatch = overlap(
    currentUser?.skillsToTeach,
    learns
  );

  // =========================================
  // MATCH SCORE
  // =========================================

  let score =
    teachMatch.length * 35 +
    learnMatch.length * 35;

  if (
    requested &&
    teachesRequested
  ) {
    score += 30;
  }

  if (
    !requested &&
    teachMatch.length === 0 &&
    learnMatch.length === 0
  ) {
    score = 10;
  }

  // =========================================
  // BADGE
  // =========================================

  const badge =
    score >= 70 ||
    (profile.rating || 0) >= 4.7
      ? "Perfect Skill Match"
      : score >= 35
      ? "Good Match"
      : "Active Peer";

  // =========================================
  // RETURN PEER
  // =========================================

  return {
    _id: profile._id,

    userId: user._id,

    name: user.name,

    email: user.email,

    bio:
      user.bio ||
      profile.bio ||
      "Peer learner ready to exchange skills.",

    skills: teaches,

    skillsToTeach: teaches,

    skillsToLearn: learns,

    availability:
      user.availability?.length
        ? user.availability
        : profile.availability || [],

    rating:
      user.rating ||
      profile.rating ||
      0,

    reviewCount:
      user.reviewCount ||
      profile.reviewCount ||
      0,

    badges: [
      badge,
      ...(user.badges ||
        profile.badges ||
        []),
    ].filter(
      (value, index, array) =>
        array.indexOf(value) === index
    ),

    reviews: (user.reviews || [])
      .slice(-3)
      .reverse(),

    matchScore: score,

    matchedTeachSkills: teachMatch,

    matchedLearnSkills: learnMatch,
  };
};

// =========================================
// GET ALL PEERS
// =========================================

const getAllMentors = async (req, res) => {
  try {
    const currentUser = await User.findById(
      req.user.id
    );

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const search = String(
      req.query.skill ||
        req.query.search ||
        ""
    )
      .trim()
      .toLowerCase();

    const users = await User.find({
      _id: {
        $ne: req.user.id,
      },
    }).sort({
      rating: -1,
      reviewCount: -1,
      name: 1,
    });

    const peers = [];

    for (const user of users) {
      if (
        user.role !== "student" &&
        user.role !== "mentor"
      ) {
        continue;
      }

      const profile =
        await ensurePeerProfile(user);

      const teaches =
        user.skillsToTeach?.length
          ? user.skillsToTeach
          : profile.skills || [];

      const learns =
        user.skillsToLearn?.length
          ? user.skillsToLearn
          : profile.skillsToLearn || [];

      // =======================================
      // SEARCH ONLY PEOPLE WHO CAN TEACH
      // =======================================

      if (search) {
        const canTeachSearchedSkill =
          teaches.some((skill) =>
            String(skill)
              .trim()
              .toLowerCase()
              .includes(search)
          );

        if (!canTeachSearchedSkill) {
          continue;
        }
      }

      const peer = toPeer(
        user,
        profile,
        currentUser,
        search
      );

      peers.push(peer);
    }

    // =========================================
    // SORT
    // =========================================

    peers.sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        b.rating - a.rating ||
        b.reviewCount - a.reviewCount
    );

    res.json({
      message:
        "Peers fetched successfully",

      mentors: peers,

      peers,
    });
  } catch (error) {
    console.error(
      "GET PEERS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch peers",

      error: error.message,
    });
  }
};

// =========================================
// GET MY PEER PROFILE
// =========================================

const getMyMentor = async (
  req,
  res
) => {
  try {
    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const profile =
      await ensurePeerProfile(user);

    res.json({
      mentor: {
        ...toPeer(
          user,
          profile,
          user
        ),

        userId: user._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch peer profile",

      error: error.message,
    });
  }
};

// =========================================
// UPDATE MY PEER PROFILE
// =========================================

const updateMyMentor = async (
  req,
  res
) => {
  try {
    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const {
      skills,
      skillsToTeach,
      skillsToLearn,
      bio,
      availability,
    } = req.body;

    user.skillsToTeach =
      skillsToTeach ||
      skills ||
      user.skillsToTeach ||
      [];

    user.skillsToLearn =
      skillsToLearn ||
      user.skillsToLearn ||
      [];

    user.bio =
      bio ?? user.bio;

    user.availability =
      availability ||
      user.availability ||
      [];

    await user.save();

    const profile =
      await ensurePeerProfile(user);

    profile.name = user.name;
    profile.email = user.email;
    profile.skills =
      user.skillsToTeach;
    profile.skillsToLearn =
      user.skillsToLearn;
    profile.bio =
      user.bio;
    profile.availability =
      user.availability;

    await profile.save();

    res.json({
      message:
        "Peer profile saved successfully",

      mentor: toPeer(
        user,
        profile,
        user
      ),
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to save peer profile",

      error: error.message,
    });
  }
};

// =========================================
// RATE / REVIEW PEER
// =========================================
// IMPORTANT:
// A student can rate a peer ONLY if they
// have a COMPLETED session together.
// =========================================

const ratePeer = async (
  req,
  res
) => {
  try {
    const {
      rating,
      comment = "",
    } = req.body;

    // =========================================
    // VALIDATE RATING
    // =========================================

    const value = Number(rating);

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

    // =========================================
    // FIND PEER PROFILE
    // =========================================

    const profile =
      await Mentor.findById(
        req.params.id
      );

    if (!profile) {
      return res.status(404).json({
        message: "Peer not found",
      });
    }

    // =========================================
    // PREVENT SELF REVIEW
    // =========================================

    if (
      profile.user?.toString() ===
      req.user.id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot rate yourself",
      });
    }

    // =========================================
    // FIND PEER USER
    // =========================================

    const peer =
      await User.findById(
        profile.user
      );

    const reviewer =
      await User.findById(
        req.user.id
      );

    if (!peer || !reviewer) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // =========================================
    // CHECK COMPLETED SESSION
    // =========================================
    //
    // The logged-in user must have a session
    // with this peer where:
    //
    // status = Completed
    //
    // =========================================

    const completedSession =
      await Session.findOne({
        student: req.user.id,
        mentor: profile._id,
        status: "Completed",
      });

    if (!completedSession) {
      return res.status(403).json({
        message:
          "You can rate and review this peer only after completing a peer-learning session with them.",
      });
    }

    // =========================================
    // CHECK IF ALREADY REVIEWED
    // =========================================

    const existingIndex =
      peer.reviews.findIndex(
        (review) =>
          review.reviewer &&
          review.reviewer.toString() ===
            req.user.id.toString()
      );

    // =========================================
    // CREATE REVIEW
    // =========================================

    const review = {
      reviewer: reviewer._id,

      reviewerName:
        reviewer.name,

      rating: value,

      comment:
        String(comment).trim(),
    };

    // =========================================
    // UPDATE EXISTING REVIEW
    // OR ADD NEW REVIEW
    // =========================================

    if (existingIndex >= 0) {
      peer.reviews[
        existingIndex
      ] = review;
    } else {
      peer.reviews.push(review);
    }

    // =========================================
    // UPDATE REVIEW COUNT
    // =========================================

    peer.reviewCount =
      peer.reviews.length;

    // =========================================
    // CALCULATE NEW AVERAGE RATING
    // =========================================

    const totalRating =
      peer.reviews.reduce(
        (sum, review) =>
          sum + Number(review.rating),
        0
      );

    peer.rating = Number(
      (
        totalRating /
        peer.reviews.length
      ).toFixed(1)
    );

    // =========================================
    // SAVE USER
    // =========================================

    await peer.save();

    // =========================================
    // UPDATE MENTOR PROFILE
    // =========================================

    profile.rating =
      peer.rating;

    profile.reviewCount =
      peer.reviewCount;

    await profile.save();

    // =========================================
    // SUCCESS
    // =========================================

    res.json({
      message:
        existingIndex >= 0
          ? "Review updated successfully"
          : "Rating and review submitted successfully",

      rating:
        peer.rating,

      reviewCount:
        peer.reviewCount,
    });

  } catch (error) {
    console.error(
      "RATE PEER ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to submit review",

      error: error.message,
    });
  }
};

// =========================================
// EXPORT
// =========================================

module.exports = {
  createMentor: updateMyMentor,

  getAllMentors,

  getMyMentor,

  updateMyMentor,

  ratePeer,
};