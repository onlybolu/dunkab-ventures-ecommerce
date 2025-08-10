import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  user: {
    name: String,
    email: String,
    phone: String,
  },
  items: [
    {
      productId: String,
      title: String,
      image: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: Number,
  method: String,
  deliveryInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "successful", "failed"],
    default: "pending"
  },
  orderStatus: {
    type: String,
    enum: ["pending", "being delivered", "delivered"],
    default: "pending"
  },  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
