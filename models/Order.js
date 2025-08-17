import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  // The correct way to reference a user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This MUST match the name of your User model
  },
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
  paymentStatus: { type: String, default: 'pending' },
  orderStatus: { type: String, default: 'pending' },
}, {
  timestamps: true // A good practice to automatically add createdAt/updatedAt
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);