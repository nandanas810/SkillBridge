const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        skills: {
            type: [String],
            required: true,
        },

        bio: {
            type: String,
            required: true,
        },

        rating: {
            type: Number,
            default: 0,
        },

        reviewCount: {
            type: Number,
            default: 0,
        },

        badges: {
            type: [String],
            default: [],
        },

        availability: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Mentor = mongoose.model("Mentor", mentorSchema);

module.exports = Mentor;