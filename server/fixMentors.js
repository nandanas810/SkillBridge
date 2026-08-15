require("dotenv").config();
const mongoose = require("mongoose");
const Mentor = require("./models/Mentor");
const User = require("./models/userModel");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const mentorUsers = await User.find({ role: "mentor" });

  let created = 0;
  let skipped = 0;

  for (const user of mentorUsers) {
    const existing = await Mentor.findOne({ email: user.email });

    if (existing) {
      skipped++;
      continue;
    }

    await Mentor.create({
      name: user.name,
      email: user.email,
      skills: [],
      bio: "Mentor Profile",
      availability: [],
    });

    created++;
    console.log(`Created mentor profile for: ${user.email}`);
  }

  console.log(`Done. Created: ${created}, Already existed: ${skipped}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});