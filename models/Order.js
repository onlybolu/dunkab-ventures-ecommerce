import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    quantity: Number,
    color: String,
    selectedColor: String,
    image: String,
  }],
  method: { type: String, required: true }, // delivery / pickup
  paymentMethod: { type: String, default: 'card' }, // card / cash
  deliveryInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
    shippingFee: String,
    isWithinLagos: String,
    state: String,
    lga: String,
  },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'pending' },
  orderStatus: { type: String, default: 'pending' },
}, {
  timestamps: true 
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);


