const mongoose = require("mongoose");

const redactConnectionSecrets = (message) => String(message || "")
  .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, "[REDACTED MONGO_URI]")
  .replace(/(password|passwd|pwd)(\s*[=:]\s*)[^\s,;]+/gi, "$1$2[REDACTED]");

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 10000,
    };
    if (process.env.MONGO_DB_NAME) options.dbName = process.env.MONGO_DB_NAME;
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed", {
      name: error.name,
      code: error.code,
      codeName: error.codeName,
      message: redactConnectionSecrets(error.message),
    });
    throw new Error("MongoDB connection failed; verify private connection settings.");
  }
};

module.exports = connectDB;
