import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: String,
  colors: { type: [String], default: [] }, 
  image: String,
  image1: String,
  image2: String,
  image3: String,
  image4: String,
  image5: String,
  image6: String,
  image7: String,
  image8: String,
  category: String,
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
