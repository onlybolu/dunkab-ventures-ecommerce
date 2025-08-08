// lib/dbconnect.js
import mongoose from "mongoose";

let isConnected = false;

export default async function Connectdb() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI2, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
