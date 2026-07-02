const Coupon = require('../models/Coupon');

const validateCoupon = async (req, res) => {
  try {
    const { code, cartItems, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true, expiryDate: { $gte: new Date() } });

    if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon' });
    if (subtotal < coupon.minOrderAmount) return res.status(400).json({ message: `Min order amount is ${coupon.minOrderAmount}` });

    let discount = 0;
    let isApplicable = false;

    // Check application rules
    const hasProductRule = coupon.applicableTo.products.length > 0;
    const hasCategoryRule = coupon.applicableTo.categories.length > 0;
    const hasBrandRule = coupon.applicableTo.brands.length > 0;

    if (!hasProductRule && !hasCategoryRule && !hasBrandRule) {
      isApplicable = true;
    } else {
      for (const item of cartItems) {
        const prodMatch = coupon.applicableTo.products.includes(item.product);
        const catMatch = coupon.applicableTo.categories.includes(item.category);
        const brandMatch = coupon.applicableTo.brands.includes(item.brand);
        
        if (prodMatch || catMatch || brandMatch) {
          isApplicable = true;
          break;
        }
      }
    }

    if (!isApplicable) return res.status(400).json({ message: 'Coupon not applicable to items in cart' });

    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }

    res.json({ message: 'Coupon applied', discount, code: coupon.code });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { validateCoupon, createCoupon, getCoupons, deleteCoupon };
