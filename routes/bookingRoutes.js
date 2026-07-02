const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createServiceBooking } = require('../controllers/bookingController');

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/', upload.single('cycleImage'), createServiceBooking);

module.exports = router;
