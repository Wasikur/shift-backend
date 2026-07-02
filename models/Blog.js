const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: {
    fileId: String,
    url: String
  },
  author: { type: String, default: 'Shift Admin' },
  category: { type: String, default: 'Events' },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
