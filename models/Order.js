// models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    quantity: Number,
    color: String,
    image: String,
  }],
  method: { type: String, required: true }, 
  deliveryInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
  },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'pending' }, // pending, successful, failed
  orderStatus: { type: String, default: 'pending' }, // pending, delivered, dispatched, cancelled
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);