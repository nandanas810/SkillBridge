const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const app = express();
app.use(express.json());
const PORT = 5000;

app.get("/", (req, res) => {
    res.send("SkillBridge Backend Running Successfully 🚀");
});
connectDB();
app.use("/api/users", userRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});