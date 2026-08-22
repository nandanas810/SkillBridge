const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewerName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Kept for backward compatibility with existing records.
    role: { type: String, enum: ["student", "mentor"], default: "student" },

    skillsToTeach: { type: [String], default: [] },
    skillsToLearn: { type: [String], default: [] },

    bio: { type: String, default: "" },
    availability: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    reviews: { type: [reviewSchema], default: [] },

    academicProjects: {
      type: [{ title: { type: String, default: "" }, description: { type: String, default: "" } }],
      default: [],
    },
    certificates: {
      type: [{ name: { type: String, default: "" }, issuer: { type: String, default: "" } }],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
