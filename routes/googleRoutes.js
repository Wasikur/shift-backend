const express = require('express');
const router = express.Router();
const { getGoogleReviews } = require('../controllers/googleReviewsController');

router.get('/', getGoogleReviews);

module.exports = router;
