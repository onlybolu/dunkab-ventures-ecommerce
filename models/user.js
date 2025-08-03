import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional if signing up with Google
  image: String,
});

export default mongoose.models.User || mongoose.model("User", userSchema);
