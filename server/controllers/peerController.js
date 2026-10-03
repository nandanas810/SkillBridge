const Peer = require("../models/Peers");
const User = require("../models/userModel");
const Session = require("../models/sessionModel");

// =========================================
// NORMALIZE SKILLS AND FIND COMMON SKILLS
// =========================================

const normalizeSkills = (skills = []) => {
  return [
    ...new Set(
      skills
        .flatMap((skill) => String(skill).split(","))
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
};

const overlap = (a = [], b = []) => {
  const skillsA = normalizeSkills(a);
  const skillsB = new Set(normalizeSkills(b));

  return skillsA.filter((skill) => skillsB.has(skill));
};

// =========================================
// ENSURE PEER PROFILE EXISTS
// =========================================

const ensurePeerProfile = async (user) => {
  let profile = await Peer.findOne({
    user: user._id,
  });

  if (!profile) {
    profile = await Peer.findOne({
      email: user.email,
    });
  }

  if (!profile) {
    profile = await Peer.create({
      user: user._id,
      name: user.name,
      email: user.email,
      skills: user.skillsToTeach || [],
      skillsToLearn: user.skillsToLearn || [],
      bio: user.bio || "Peer learner ready to exchange skills.",
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

const toPeer = (user, profile, currentUser, search = "") => {
  const teaches = user.skillsToTeach?.length
    ? user.skillsToTeach
    : profile.skills || [];

  const learns = user.skillsToLearn?.length
    ? user.skillsToLearn
    : profile.skillsToLearn || [];

  const requested = search.trim().toLowerCase();

  // Search only skills the peer can teach.
  const teachesRequested = requested
    ? normalizeSkills(teaches).some((skill) =>
        skill.includes(requested)
      )
    : false;

  // =========================================
  // TWO-WAY SKILL MATCHING
  // =========================================

  const teachMatch = overlap(
    currentUser?.skillsToLearn,
    teaches
  );

  const learnMatch = overlap(
    currentUser?.skillsToTeach,
    learns
  );

  // Normalize the current user's skills too, so comma-separated
  // skills are counted individually when calculating the score.
  const wantedSkills = normalizeSkills(
    currentUser?.skillsToLearn || []
  );

  const teachableSkills = normalizeSkills(
    currentUser?.skillsToTeach || []
  );

  const matchedWantedSkills = new Set(teachMatch);
  const matchedTeachableSkills = new Set(learnMatch);

  const teachCoverage = wantedSkills.length
    ? matchedWantedSkills.size / wantedSkills.length
    : null;

  const learnCoverage = teachableSkills.length
    ? matchedTeachableSkills.size / teachableSkills.length
    : null;

  const coverageRates = [
    teachCoverage,
    learnCoverage,
  ].filter((rate) => rate !== null);

  const score = coverageRates.length
    ? Math.round(
        (coverageRates.reduce(
          (total, rate) => total + rate,
          0
        ) /
          coverageRates.length) *
          100
      )
    : 0;

  const hasTeachMatch = teachMatch.length > 0;
  const hasLearnMatch = learnMatch.length > 0;

  const isPerfectTwoWayMatch =
    wantedSkills.length > 0 &&
    teachableSkills.length > 0 &&
    teachCoverage === 1 &&
    learnCoverage === 1;

  const matchLabel = isPerfectTwoWayMatch
    ? "Perfect two-way skill match"
    : hasTeachMatch && hasLearnMatch
    ? "Good skill match"
    : hasTeachMatch || hasLearnMatch
    ? "Potential learning partner"
    : "No direct skill match";

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

    availability: user.availability?.length
      ? user.availability
      : profile.availability || [],

    rating: user.rating || profile.rating || 0,

    reviewCount:
      user.reviewCount || profile.reviewCount || 0,

    // Keep profile badges separate from match labels.
    badges: [
      ...(user.badges || profile.badges || []),
    ].filter(
      (value, index, array) =>
        array.indexOf(value) === index
    ),

    matchLabel,

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

const getAllPeers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const search = String(
      req.query.skill || req.query.search || ""
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


      const profile = await ensurePeerProfile(user);

      const teaches = user.skillsToTeach?.length
        ? user.skillsToTeach
        : profile.skills || [];

      // Search only peers who can teach the searched skill.
      if (search) {
        const canTeachSearchedSkill =
          normalizeSkills(teaches).some((skill) =>
            skill.includes(search)
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

    // Sort by match score, then rating and review count.
    peers.sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        b.rating - a.rating ||
        b.reviewCount - a.reviewCount
    );

    return res.json({
      message: "Peers fetched successfully",
      Peers: peers,
      peers,
    });
  } catch (error) {
    console.error("GET PEERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch peers",
      error: error.message,
    });
  }
};

// =========================================
// GET MY PEER PROFILE
// =========================================

const getMyPeer = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const profile = await ensurePeerProfile(user);

    return res.json({
      Peer: {
        ...toPeer(user, profile, user),
        userId: user._id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch peer profile",
      error: error.message,
    });
  }
};

// =========================================
// UPDATE MY PEER PROFILE
// =========================================

const updateMyPeer = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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

    user.bio = bio ?? user.bio;

    user.availability =
      availability ||
      user.availability ||
      [];

    await user.save();

    const profile = await ensurePeerProfile(user);

    profile.name = user.name;
    profile.email = user.email;
    profile.skills = user.skillsToTeach;
    profile.skillsToLearn = user.skillsToLearn;
    profile.bio = user.bio;
    profile.availability = user.availability;

    await profile.save();

    return res.json({
  message: "Peer profile saved successfully",
  peer: toPeer(user, profile, user),
});
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save peer profile",
      error: error.message,
    });
  }
};

// =========================================
// RATE / REVIEW PEER
// A student can review a peer after a completed session.
// =========================================

const ratePeer = async (req, res) => {
  try {
    const { rating, comment = "" } = req.body;

    const value = Number(rating);

    if (
      !Number.isInteger(value) ||
      value < 1 ||
      value > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Find peer profile.
    const profile = await Peer.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        message: "Peer not found",
      });
    }

    // Prevent self-review.
    if (
      profile.user?.toString() ===
      req.user.id.toString()
    ) {
      return res.status(400).json({
        message: "You cannot rate yourself",
      });
    }

    // Find peer and reviewer.
    const peer = await User.findById(profile.user);
    const reviewer = await User.findById(req.user.id);

    if (!peer || !reviewer) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Require a completed session.
    const completedSession = await Session.findOne({
      student: req.user.id,
      Peer: profile._id,
      status: "Completed",
    });

    if (!completedSession) {
      return res.status(403).json({
        message:
          "You can rate and review this peer only after completing a peer-learning session with them.",
      });
    }

    // Check whether this user already reviewed the peer.
    const existingIndex = peer.reviews.findIndex(
      (review) =>
        review.reviewer &&
        review.reviewer.toString() ===
          req.user.id.toString()
    );

    const review = {
      reviewer: reviewer._id,
      reviewerName: reviewer.name,
      rating: value,
      comment: String(comment).trim(),
    };

    // Update an existing review or add a new one.
    if (existingIndex >= 0) {
      peer.reviews[existingIndex] = review;
    } else {
      peer.reviews.push(review);
    }

    peer.reviewCount = peer.reviews.length;

    // Calculate the average rating.
    const totalRating = peer.reviews.reduce(
      (sum, item) => sum + Number(item.rating),
      0
    );

    peer.rating = Number(
      (totalRating / peer.reviews.length).toFixed(1)
    );

    await peer.save();

    // Update the peer profile's rating details.
    profile.rating = peer.rating;
    profile.reviewCount = peer.reviewCount;

    await profile.save();

    return res.json({
      message:
        existingIndex >= 0
          ? "Review updated successfully"
          : "Rating and review submitted successfully",
      rating: peer.rating,
      reviewCount: peer.reviewCount,
    });
  } catch (error) {
    console.error("RATE PEER ERROR:", error);

    return res.status(500).json({
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

// =========================================
// EXPORT
// =========================================


module.exports = {
  createPeer: updateMyPeer,
  getAllPeers,
  getMyPeer,
  updateMyPeer,
  ratePeer,
};