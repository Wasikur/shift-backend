const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [{
    fileId: String,
    url: String
  }]
}, { timestamps: true });

// Update product rating on save
reviewSchema.post('save', async function() {
  const Product = mongoose.model('Product');
  const stats = await this.constructor.aggregate([
    { $match: { product: this.product } },
    { $group: { _id: '$product', averageRating: { $avg: '$rating' }, ratingCount: { $sum: 1 } } }
  ]);
  
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      'ratings.average': stats[0].averageRating,
      'ratings.count': stats[0].ratingCount
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
