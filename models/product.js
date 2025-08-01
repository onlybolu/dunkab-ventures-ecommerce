import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: String,
  image: String,
  image1: { type: String },
  image2: { type: String },
  category: String,
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
