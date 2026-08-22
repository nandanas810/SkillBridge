require("dotenv").config();

const mongoose = require("mongoose");

const User = require("./models/userModel");
const Mentor = require("./models/Mentor");

// =====================================================
// SKILL + BIO DATA
// =====================================================

const skillSets = [
  {
    teach: ["JavaScript", "HTML", "CSS"],
    learn: ["React", "Node.js"],
    bio: "Web development enthusiast who enjoys building clean and responsive websites. Happy to share frontend basics while learning modern JavaScript frameworks from other students.",
  },
  {
    teach: ["Python", "Programming"],
    learn: ["React", "MongoDB"],
    bio: "Programming enthusiast with a strong interest in Python. I enjoy solving problems and helping fellow students understand programming concepts through simple examples.",
  },
  {
    teach: ["Java", "OOP"],
    learn: ["Spring Boot", "React"],
    bio: "Java learner with an interest in object-oriented programming and backend development. Always interested in exchanging knowledge and learning new technologies with peers.",
  },
  {
    teach: ["React", "JavaScript"],
    learn: ["Node.js", "MongoDB"],
    bio: "Frontend developer interested in React and modern web development. I enjoy practical learning and collaborating with other students on development projects.",
  },
  {
    teach: ["HTML", "CSS", "UI/UX Design"],
    learn: ["Figma", "React"],
    bio: "Creative web development enthusiast who enjoys designing simple and user-friendly interfaces. Looking forward to learning design and frontend skills through peer collaboration.",
  },
  {
    teach: ["Python", "Data Science"],
    learn: ["Machine Learning", "JavaScript"],
    bio: "Data and programming enthusiast who enjoys working with Python and exploring data-driven projects. Interested in exchanging practical programming knowledge with fellow students.",
  },
  {
    teach: ["C", "C++", "DSA"],
    learn: ["Python", "Java"],
    bio: "DSA enthusiast who enjoys solving programming problems and understanding algorithms. Happy to help peers with programming fundamentals while improving my own skills.",
  },
  {
    teach: ["SQL", "Database Management"],
    learn: ["MongoDB", "Node.js"],
    bio: "Database enthusiast interested in learning how applications store and manage data. I enjoy explaining SQL concepts and learning modern database technologies.",
  },
  {
    teach: ["Networking", "Cybersecurity"],
    learn: ["Python", "Linux"],
    bio: "Technology enthusiast interested in networking and cybersecurity. I enjoy learning about secure systems and exchanging technical knowledge with other students.",
  },
  {
    teach: ["Flutter", "Mobile App Development"],
    learn: ["React", "Firebase"],
    bio: "Mobile application enthusiast interested in creating practical and user-friendly apps. I enjoy learning new development tools and sharing what I know with fellow students.",
  },
];

// =====================================================
// DEMO REVIEWERS
// =====================================================

const reviewerNames = [
  "Aarav",
  "Devika",
  "Riya",
  "Karthik",
  "Sana",
  "Joel",
];

const reviewComments = [
  "Very helpful and explained everything clearly.",
  "Good peer-learning experience. Easy to communicate with.",
  "Explained the concepts using simple practical examples.",
  "Very friendly and patient while teaching.",
  "Really useful session and great skill exchange.",
  "Helpful peer with good knowledge of the subject.",
];

// =====================================================
// CREATE REVIEWER USERS
// =====================================================

async function createReviewers() {
  const reviewers = [];

  for (const name of reviewerNames) {
    const email =
      `${name.toLowerCase()}.existing.reviewer@skillbridge.demo`;

    let reviewer = await User.findOne({ email });

    if (!reviewer) {
      reviewer = await User.create({
        name,
        email,
        password: "existing-demo-reviewer",
        role: "student",
        skillsToTeach: [],
        skillsToLearn: [],
        bio: "SkillBridge peer-learning student.",
        rating: 0,
        reviewCount: 0,
        reviews: [],
      });
    }

    reviewers.push(reviewer);
  }

  return reviewers;
}

// =====================================================
// MAIN FUNCTION
// =====================================================

async function improveExistingUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("======================================");
    console.log("MongoDB connected.");
    console.log("Improving existing SkillBridge users...");
    console.log("======================================");

    // =================================================
    // 1. CREATE REVIEWERS
    // =================================================

    const reviewers = await createReviewers();

    console.log(
      `${reviewers.length} review accounts ready.`
    );

    // =================================================
    // 2. FIND EXISTING USERS
    // =================================================
    //
    // IMPORTANT:
    // Users whose email ends with @skillbridge.demo
    // are excluded.
    //
    // Therefore your 10 demo peers are NOT modified.
    // =================================================

    const users = await User.find({
      role: { $in: ["student", "mentor"] },
      email: {
        $not: /@skillbridge\.demo$/i,
      },
    });

    console.log(
      `${users.length} existing users found.`
    );

    let updatedCount = 0;

    // =================================================
    // 3. UPDATE USERS ONE BY ONE
    // =================================================

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const data =
        skillSets[i % skillSets.length];

      console.log("--------------------------------------");
      console.log(`Updating: ${user.name}`);
      console.log(`Email: ${user.email}`);

      // =================================================
      // SKILLS TO TEACH
      // =================================================

      if (
        !Array.isArray(user.skillsToTeach) ||
        user.skillsToTeach.length === 0
      ) {
        user.skillsToTeach = [...data.teach];
      }

      // =================================================
      // SKILLS TO LEARN
      // =================================================

      if (
        !Array.isArray(user.skillsToLearn) ||
        user.skillsToLearn.length === 0
      ) {
        user.skillsToLearn = [...data.learn];
      }

      // =================================================
      // BIO
      // =================================================

      const currentBio =
        String(user.bio || "").trim();

      if (
        !currentBio ||
        currentBio.toLowerCase() === "student" ||
        currentBio.toLowerCase() === "skillbridge student." ||
        currentBio.length < 20
      ) {
        user.bio = data.bio;
      }

      // =================================================
      // CREATE REVIEWS IF USER HAS NONE
      // =================================================

      if (
        !Array.isArray(user.reviews) ||
        user.reviews.length === 0
      ) {
        const newReviews = [];

        for (let j = 0; j < reviewers.length; j++) {
          const reviewer = reviewers[j];

          // Don't allow self-review
          if (
            reviewer._id.toString() ===
            user._id.toString()
          ) {
            continue;
          }

          const ratingValues = [
            5,
            5,
            4,
            5,
            4,
            5,
          ];

          newReviews.push({
            reviewer: reviewer._id,
            reviewerName: reviewer.name,
            rating: ratingValues[j],
            comment: reviewComments[j],
          });
        }

        user.reviews = newReviews;
      }

      // =================================================
      // CALCULATE RATING
      // =================================================

      if (
        Array.isArray(user.reviews) &&
        user.reviews.length > 0
      ) {
        const totalRating =
          user.reviews.reduce(
            (sum, review) =>
              sum + Number(review.rating || 0),
            0
          );

        user.reviewCount =
          user.reviews.length;

        user.rating = Number(
          (
            totalRating /
            user.reviews.length
          ).toFixed(1)
        );
      } else {
        user.rating = 0;
        user.reviewCount = 0;
      }

      // =================================================
      // SAVE USER
      // =================================================

      await user.save();

      // =================================================
      // 4. FIND EXISTING MENTOR PROFILE
      // =================================================
      //
      // FIRST:
      // Find by user ID.
      //
      // SECOND:
      // If not found, find by email.
      //
      // This fixes the duplicate email error.
      // =================================================

      let profile = await Mentor.findOne({
        user: user._id,
      });

      if (!profile) {
        profile = await Mentor.findOne({
          email: user.email,
        });
      }

      // =================================================
      // 5. CREATE ONLY IF PROFILE DOES NOT EXIST
      // =================================================

      if (!profile) {
        profile = new Mentor({
          user: user._id,
          name: user.name,
          email: user.email,
        });

        console.log(
          "  → Creating new peer profile"
        );
      } else {
        console.log(
          "  → Updating existing peer profile"
        );
      }

      // =================================================
      // 6. MAKE SURE PROFILE POINTS TO CORRECT USER
      // =================================================

      profile.user = user._id;

      profile.name = user.name;

      profile.email = user.email;

      profile.skills =
        user.skillsToTeach || [];

      profile.skillsToLearn =
        user.skillsToLearn || [];

      profile.bio =
        user.bio ||
        "Peer learner ready to exchange skills.";

      profile.rating =
        user.rating || 0;

      profile.reviewCount =
        user.reviewCount || 0;

      // =================================================
      // KEEP AVAILABILITY
      // =================================================

      if (
        !Array.isArray(profile.availability)
      ) {
        profile.availability = [];
      }

      // =================================================
      // SAVE MENTOR PROFILE
      // =================================================

      await profile.save();

      // =================================================
      // DISPLAY RESULT
      // =================================================

      updatedCount++;

      console.log(
        `✓ ${user.name} updated successfully`
      );

      console.log(
        `  Teach: ${user.skillsToTeach.join(", ")}`
      );

      console.log(
        `  Learn: ${user.skillsToLearn.join(", ")}`
      );

      console.log(
        `  Rating: ${user.rating}`
      );

      console.log(
        `  Reviews: ${user.reviewCount}`
      );
    }

    // =================================================
    // FINISHED
    // =================================================

    console.log("");
    console.log("======================================");
    console.log(
      "EXISTING USER IMPROVEMENT COMPLETE"
    );
    console.log("======================================");

    console.log(
      `Users updated: ${updatedCount}`
    );

    console.log("");
    console.log(
      "The 10 @skillbridge.demo users were NOT modified."
    );

    console.log("");
    console.log("Existing users now have:");

    console.log("✓ Better bios");
    console.log("✓ Teaching skills");
    console.log("✓ Learning skills");
    console.log("✓ Ratings");
    console.log("✓ Review counts");
    console.log("✓ Real review documents");
    console.log("✓ Updated peer profiles");

    console.log("======================================");

    await mongoose.disconnect();

    process.exit(0);

  } catch (error) {
    console.error("");
    console.error("======================================");
    console.error(
      "IMPROVE USERS ERROR"
    );
    console.error("======================================");

    console.error(error);

    console.error("======================================");

    await mongoose.disconnect();

    process.exit(1);
  }
}

// =====================================================
// RUN
// =====================================================

improveExistingUsers();