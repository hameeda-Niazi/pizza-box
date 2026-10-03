const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 10000,
    };
    if (process.env.MONGO_DB_NAME) options.dbName = process.env.MONGO_DB_NAME;
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log("MongoDB connected successfully");
  } catch {
    throw new Error("MongoDB connection failed; verify private connection settings.");
  }
};

module.exports = connectDB;
