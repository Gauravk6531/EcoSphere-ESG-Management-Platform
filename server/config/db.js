const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ecosphere";
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

module.exports = connectDB;
