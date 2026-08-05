const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
// =======================
// Register User
// =======================
const registerUser = async (req, res) => {

   const { name, email, password } = req.body;

// Hash the password
const hashedPassword = await bcrypt.hash(password, 10);

const user = await User.create({
    name,
    email,
    password: hashedPassword,
});

    res.status(201).json(user);
};

// =======================
// Login User
// =======================
const loginUser = async (req, res) => {

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    // Check password
   // Compare entered password with hashed password
const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
    return res.status(401).json({
        message: "Invalid Password",
    });
}

    // Login Successful
    res.status(200).json({
        message: "Login Successful",
        user
    });
};

module.exports = {
    registerUser,
    loginUser,
};