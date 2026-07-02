const Review = require('../models/Review');

const createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;
    
    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({ user: req.user._id, product });
    if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });

    const review = await Review.create({
      user: req.user._id,
      product,
      rating: Number(rating),
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name avatar').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getProductReviews };
