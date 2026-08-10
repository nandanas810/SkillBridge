const Mentor = require("../models/Mentor");

// Create a new mentor
const createMentor = async (req, res) => {
    try {
        const {
            name,
            email,
            skills,
            bio,
            availability
        } = req.body;

        const mentor = await Mentor.create({
            name,
            email,
            skills,
            bio,
            availability
        });

        res.status(201).json({
            message: "Mentor created successfully",
            mentor
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create mentor",
            error: error.message
        });
    }
};


// Get all mentors
const getAllMentors = async (req, res) => {
    try {
        const mentors = await Mentor.find();

        res.status(200).json({
            message: "Mentors fetched successfully",
            mentors
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch mentors",
            error: error.message
        });
    }
};


module.exports = {
    createMentor,
    getAllMentors
};