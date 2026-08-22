const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Mentor = require("../models/Mentor");

// =======================
// Register User
// =======================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Allow only valid roles
    const userRole = "student";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    // Every student gets a peer profile so other students can discover them.
    await Mentor.create({
      user: user._id,
      name: user.name,
      email: user.email,
      skills: [],
      skillsToLearn: [],
      bio: "New SkillBridge peer",
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
};

// =======================
// Login User
// =======================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Login successful
    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};
// =======================
// CHECK USERS - TEMPORARY
// =======================
const getUsersForTesting = async (req, res) => {
  try {
    const users = await User.find().select(
      "name email role"
    );

    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Failed to get users",
    });
  }
};


// =======================
// GET STUDENT PORTFOLIO
// =======================
const getStudentPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email role skillsToTeach skillsToLearn academicProjects certificates"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        message: "Only students can access the student portfolio",
      });
    }

    res.status(200).json({
      message: "Portfolio fetched successfully",
      portfolio: user,
    });
  } catch (error) {
    console.error("Get portfolio error:", error);

    res.status(500).json({
      message: "Failed to fetch portfolio",
    });
  }
};


// =======================
// UPDATE STUDENT PORTFOLIO
// =======================
const updateStudentPortfolio = async (req, res) => {
  try {
    const {
      skillsToTeach,
      skillsToLearn,
      academicProjects,
      certificates,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        message: "Only students can update the student portfolio",
      });
    }

    user.skillsToTeach = skillsToTeach || [];
    user.skillsToLearn = skillsToLearn || [];
    user.academicProjects = academicProjects || [];
    user.certificates = certificates || [];

    await user.save();

    res.status(200).json({
      message: "Portfolio updated successfully",
      portfolio: {
        name: user.name,
        email: user.email,
        role: user.role,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        academicProjects: user.academicProjects,
        certificates: user.certificates,
      },
    });
  } catch (error) {
    console.error("Update portfolio error:", error);

    res.status(500).json({
      message: "Failed to update portfolio",
    });
  }
};







module.exports = {
  registerUser,
  loginUser,
  getUsersForTesting,
  getStudentPortfolio,
  updateStudentPortfolio,
};




