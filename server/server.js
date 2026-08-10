const express = require("express");
require("dotenv").config();
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("SkillBridge Backend Running Successfully 🚀");
});
connectDB();
app.use("/api/users", userRoutes);
app.use("/api/mentors", mentorRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});