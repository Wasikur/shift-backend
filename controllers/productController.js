const Product = require('../models/Product');
const imagekit = require('../config/imagekitConfig');

// @desc    Get all products
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, sizes, specifications, stock } = req.body;
    
    // Parse sizes if it's coming as a string from form-data
    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    const parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResponse = await imagekit.upload({
          file: file.buffer,
          fileName: `${Date.now()}-${file.originalname}`,
          folder: '/shift/products'
        });
        images.push({
          fileId: uploadResponse.fileId,
          url: uploadResponse.url,
          thumbnailUrl: uploadResponse.thumbnailUrl
        });
      }
    }

    const product = await Product.create({
      name, description, price, category, brand, 
      sizes: parsedSizes, 
      specifications: parsedSpecs, 
      stock, 
      images
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, price, category, brand, sizes, specifications, stock, keepImages } = req.body;
    
    const parsedSizes = sizes ? (typeof sizes === 'string' ? JSON.parse(sizes) : sizes) : product.sizes;
    const parsedSpecs = specifications ? (typeof specifications === 'string' ? JSON.parse(specifications) : specifications) : product.specifications;
    const parsedKeepImages = keepImages ? (typeof keepImages === 'string' ? JSON.parse(keepImages) : keepImages) : [];

    // Delete removed images from ImageKit
    const imagesToDelete = product.images.filter(img => !parsedKeepImages.includes(img.fileId));
    for (const img of imagesToDelete) {
      await imagekit.deleteFile(img.fileId);
    }

    let updatedImages = product.images.filter(img => parsedKeepImages.includes(img.fileId));

    // Upload new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResponse = await imagekit.upload({
          file: file.buffer,
          fileName: `${Date.now()}-${file.originalname}`,
          folder: '/shift/products'
        });
        updatedImages.push({
          fileId: uploadResponse.fileId,
          url: uploadResponse.url,
          thumbnailUrl: uploadResponse.thumbnailUrl
        });
      }
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.sizes = parsedSizes;
    product.specifications = parsedSpecs;
    product.stock = stock || product.stock;
    product.images = updatedImages;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete images from ImageKit
    for (const img of product.images) {
      await imagekit.deleteFile(img.fileId);
    }

    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
