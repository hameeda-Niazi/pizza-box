require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

const name = process.env.ADMIN_NAME || "Pizza Box Admin";
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const createAdmin = async () => {
  if (!email || !isValidEmail(email) || !password || Buffer.byteLength(password) < 12 || Buffer.byteLength(password) > 72 || !name.trim() || name.trim().length > 100) {
    console.error("Set ADMIN_EMAIL and a 12-72 byte ADMIN_PASSWORD in the private backend environment first.");
    process.exitCode = 1;
    return;
  }

  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).select("role");
    if (existingUser && existingUser.role !== "admin") {
      throw new Error("Configured email belongs to a customer");
    }
    await User.findOneAndUpdate(
      { email: normalizedEmail },
      { name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 10), role: "admin" },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    console.log("Admin account ready. Credentials were not printed.");
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin().catch(() => {
  console.error("Unable to create admin; verify private environment settings and database access.");
  process.exitCode = 1;
});
