const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Bikes', 'Apparels', 'Accessories', 'Spares'] 
  },
  brand: { type: String, required: true },
  images: [{
    fileId: String,
    url: String,
    thumbnailUrl: String
  }],
  sizes: [{ type: String }],
  specifications: {
    type: Map,
    of: String
  },
  stock: { type: Number, default: 0 },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
