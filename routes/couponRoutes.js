const express = require('express');
const router = express.Router();
const { validateCoupon, createCoupon, getCoupons, deleteCoupon } = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/validate', validateCoupon);
router.post('/', protect, admin, createCoupon);
router.get('/', protect, admin, getCoupons);
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;
