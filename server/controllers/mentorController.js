
           const Mentor = require("../models/Mentor");
const User = require("../models/userModel");

// =======================
// Create Mentor
// =======================
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
            user: req.user.id,
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
        console.error("CREATE MENTOR ERROR:", error);

        res.status(500).json({
            message: "Failed to create mentor",
            error: error.message
        });
    }
};


// =======================
// Get All Mentors
// =======================
const getAllMentors = async (req, res) => {
    try {

        // Get users who registered as mentors
        const mentorUsers = await User.find(
            { role: "mentor" },
            { email: 1 }
        );

        const mentorEmails = mentorUsers.map(
            user => user.email
        );

        // Get their mentor profiles
        const mentors = await Mentor.find({
            email: { $in: mentorEmails }
        });

        res.status(200).json({
            message: "Mentors fetched successfully",
            mentors
        });

    } catch (error) {

        console.error("GET ALL MENTORS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch mentors",
            error: error.message
        });
    }
};


// =======================
// Get Logged-in Mentor
// =======================
const getMyMentor = async (req, res) => {
    try {
        console.log("LOGGED USER:", req.user);
        

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const mentor = await Mentor.findOne({
            email: user.email
        });

        if (!mentor) {
            return res.status(404).json({
                message: "Mentor profile not found"
            });
        }

        res.status(200).json({
            mentor
        });

    } catch (error) {
        console.error("GET MY MENTOR ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch mentor profile",
            error: error.message
        });
    }
};

// =======================
// Update / Create My Expertise
// =======================
const updateMyMentor = async (req, res) => {
    try {

        // Only mentors can update mentor profile
        if (req.user.role !== "mentor") {
            return res.status(403).json({
                message: "Only mentors can manage expertise"
            });
        }

        const {
            skills,
            bio,
            availability
        } = req.body;


        // Check if mentor profile already exists
        let mentor = await Mentor.findOne({
            email: req.user.email
        });


        // =================================
        // If profile doesn't exist → CREATE
        // =================================
        if (!mentor) {

            mentor = await Mentor.create({
                user: req.user.id,
                name: req.user.name,
                email: req.user.email,
                skills: skills || [],
                bio: bio || "Mentor Profile",
                availability: availability || []
            });

        }

        // =================================
        // If profile exists → UPDATE
        // =================================
        else {

            mentor.skills = skills || [];
            mentor.bio = bio || "Mentor Profile";
            mentor.availability = availability || [];

            await mentor.save();
        }


        res.status(200).json({
            message: "Mentor profile saved successfully",
            mentor
        });

    } catch (error) {

        console.error("UPDATE MENTOR ERROR:", error);

        res.status(500).json({
            message: "Failed to save mentor profile",
            error: error.message
        });
    }
};


module.exports = {
    createMentor,
    getAllMentors,
    getMyMentor,
    updateMyMentor
};