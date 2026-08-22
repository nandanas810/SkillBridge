require("dotenv").config();

const mongoose = require("mongoose");
const Session = require("./models/sessionModel");

async function clearSessions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const result = await Session.deleteMany({});

    console.log(`Deleted ${result.deletedCount} old sessions.`);

    await mongoose.connection.close();

    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("ERROR:", error);
    process.exit(1);
  }
}

clearSessions();