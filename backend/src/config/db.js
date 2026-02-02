import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined");
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log('✅ MongoDB Connected');

    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    console.error("Full error:", error);
    process.exit(1);
  }
};
