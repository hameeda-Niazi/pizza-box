const bcrypt = require("bcryptjs");
const User = require("../models/User");
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const ensureAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = "Pizza Box Admin" } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
  if (Buffer.byteLength(ADMIN_PASSWORD) < 12 || Buffer.byteLength(ADMIN_PASSWORD) > 72) {
    throw new Error("ADMIN_PASSWORD must be between 12 and 72 bytes");
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const name = ADMIN_NAME.trim();
  if (!isValidEmail(email) || !name || name.length > 100) {
    throw new Error("ADMIN_EMAIL and ADMIN_NAME must be valid");
  }
  const existingAdmin = await User.findOne({ email });

  if (existingAdmin && existingAdmin.role !== "admin") {
    throw new Error("ADMIN_EMAIL already belongs to a non-admin account");
  }

  await User.findOneAndUpdate(
    { email },
    {
      name,
      email,
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "admin",
    },
    { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true }
  );
  console.log("Configured administrator account is ready");
};

module.exports = ensureAdmin;
