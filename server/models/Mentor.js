const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    skills: { type: [String], default: [] },
    skillsToLearn: { type: [String], default: [] },
    bio: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    availability: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mentor", mentorSchema);
