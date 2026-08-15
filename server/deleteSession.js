require("dotenv").config();
const mongoose = require("mongoose");
const Session = require("./models/sessionModel");

const deleteSession = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await Session.deleteOne({
      date: "2026-08-20",
      time: "06:00",
      status: "Pending",
    });

    console.log("Deleted:", result.deletedCount);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

deleteSession();