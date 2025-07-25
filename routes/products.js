// LastV2Gemini/backend/routes/products.js
import express from 'express';
import Product from '../models/Product.js';
import mongoose from 'mongoose'; // Import mongoose to use isValidObjectId

const router = express.Router();

router.get('/test', (req, res) => {
  res.send('✅ Products route is working!');
});

// Helper for product input validation
const validateProductInput = (data, isNew = true) => {
    const errors = [];

    if (isNew || data.name !== undefined) {
        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            errors.push('Product name is required and must be a non-empty string.');
        }
    }
    if (isNew || data.category !== undefined) {
        if (!data.category || typeof data.category !== 'string' || data.category.trim() === '') {
            errors.push('Category is required and must be a non-empty string.');
        }
    }
    if (isNew || data.price !== undefined) {
        if (typeof data.price !== 'number' || data.price < 0) {
            errors.push('Price is required and must be a non-negative number.');
        }
    }
    if (isNew || data.pricePer10Ml !== undefined) {
        if (typeof data.pricePer10Ml !== 'number' || data.pricePer10Ml < 0) {
            errors.push('Price Per 10ML is required and must be a non-negative number.');
        }
    }
    if (data.reviews !== undefined && (typeof data.reviews !== 'number' || data.reviews < 0)) {
        errors.push('Reviews must be a non-negative number.');
    }
    if (data.description !== undefined && typeof data.description !== 'string') {
        errors.push('Description must be a string.');
    }

    // Validate notes
    if (data.notes !== undefined) {
        if (typeof data.notes !== 'object' || data.notes === null) {
            errors.push('Notes must be an object.');
        } else {
            if (data.notes.top !== undefined && !Array.isArray(data.notes.top)) errors.push('Top notes must be an array of strings.');
            if (data.notes.heart !== undefined && !Array.isArray(data.notes.heart)) errors.push('Heart notes must be an array of strings.');
            if (data.notes.base !== undefined && !Array.isArray(data.notes.base)) errors.push('Base notes must be an array of strings.');
        }
    }

    // Validate sizes
    if (data.sizes !== undefined) {
        if (!Array.isArray(data.sizes) || !data.sizes.every(s => typeof s === 'string')) {
            errors.push('Sizes must be an array of strings.');
        }
    }

    // Validate images
    if (data.images !== undefined) {
        if (!Array.isArray(data.images) || !data.images.every(img => typeof img === 'string' && img.trim() !== '')) {
            errors.push('Images must be an array of non-empty strings (URLs).');
        }
    }

    // Validate calculatedPrices and sizeStocks (as mixed types, check for object structure)
    if (data.calculatedPrices !== undefined && (typeof data.calculatedPrices !== 'object' || data.calculatedPrices === null)) {
        errors.push('Calculated prices must be an object.');
    }
    if (data.sizeStocks !== undefined && (typeof data.sizeStocks !== 'object' || data.sizeStocks === null)) {
        errors.push('Size stocks must be an object.');
    } else if (data.sizeStocks !== undefined) {
        for (const size in data.sizeStocks) {
            if (typeof data.sizeStocks[size] !== 'number' || data.sizeStocks[size] < 0) {
                errors.push(`Stock for size "${size}" must be a non-negative number.`);
            }
        }
    }
    
    if (data.isFeatured !== undefined && typeof data.isFeatured !== 'boolean') {
        errors.push('isFeatured must be a boolean.');
    }
    if (data.isVisibleInCollection !== undefined && typeof data.isVisibleInCollection !== 'boolean') {
        errors.push('isVisibleInCollection must be a boolean.');
    }


    return errors;
};


// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

// GET a single product by ID
router.get('/:id', async (req, res) => {
  // Validate if the ID is a valid MongoDB ObjectId format
  if (!mongoose.isValidObjectId(req.params.id)) {
      // If not a valid ObjectId, try to find by the 'id' field that might be string based
      try {
          const product = await Product.findOne({ id: req.params.id });
          if (!product) {
              return res.status(404).json({ error: 'Product not found with the given ID.' });
          }
          return res.json(product);
      } catch (err) {
          return res.status(500).json({ error: 'Failed to fetch product by string ID', details: err.message });
      }
  }

  // If it is a valid ObjectId, try to find by _id
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product', details: err.message });
  }
});

// POST a new product
router.post('/', async (req, res) => {
  const validationErrors = validateProductInput(req.body, true);
  if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
  }

  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add product', details: err.message });
  }
});

// PUT (update) a product
router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid product ID format.' });
    }

    const validationErrors = validateProductInput(req.body, false); // false for partial update
    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }

    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); // runValidators ensures schema validation on update
        if (!updated) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.json(updated);
    } catch (err) {
        // Handle Mongoose validation errors separately if needed
        if (err.name === 'ValidationError') {
            const errors = Object.keys(err.errors).map(key => err.errors[key].message);
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        res.status(400).json({ error: 'Failed to update product', details: err.message });
    }
});

// DELETE a product
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID format.' });
  }
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete product', details: err.message });
  }
});

export default router;