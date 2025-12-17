const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/kra_database";
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ MongoDB connected successfully");
    console.log(`📁 Database: ${mongoose.connection.name}`);
    
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    return false;
  }
};

module.exports = connectDB;