const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // at time of purchase
    size: String,
    name: String, // backup in case product deleted
    thumbnail: String
  }],
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    email: String
  },
  payment: {
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    transactionId: String,
    method: { type: String, default: 'Mock Payment' },
    amount: Number
  },
  discount: {
    code: String,
    amount: { type: Number, default: 0 }
  },
  totalPrice: { type: Number, required: true },
  taxPrice: { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  finalPrice: { type: Number, required: true },
  orderStatus: { type: String, enum: ['placed', 'shipped', 'delivered', 'cancelled'], default: 'placed' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
