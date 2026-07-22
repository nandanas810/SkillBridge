const express = require("express");
const connectDB = require("./config/db");
const app = express();

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("SkillBridge Backend Running Successfully 🚀");
});
connectDB();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});