// import express from 'express';
// import Order from '../models/Order.js';
// import mongoose from 'mongoose'; // Import mongoose to use isValidObjectId

// const router = express.Router();

// // Helper for order input validation
// const validateOrderInput = (data, isNew = true) => {
//     const errors = [];

//     // Common validations for new orders
//     if (isNew) {
//         if (!data.orderNumber || typeof data.orderNumber !== 'string' || data.orderNumber.trim() === '') {
//             errors.push('Order number is required and must be a non-empty string.');
//         }
//         if (!data.customerName || typeof data.customerName !== 'string' || data.customerName.trim() === '') {
//             errors.push('Customer name is required and must be a non-empty string.');
//         }
//         if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
//             errors.push('A valid customer email is required.');
//         }
//         if (!data.shippingAddress || typeof data.shippingAddress !== 'string' || data.shippingAddress.trim() === '') {
//             errors.push('Shipping address is required.');
//         }
//         if (!data.date || typeof data.date !== 'string' || data.date.trim() === '') {
//             errors.push('Order date is required.');
//         }
//         if (typeof data.subtotal !== 'number' || data.subtotal < 0) {
//             errors.push('Subtotal is required and must be a non-negative number.');
//         }
//         if (typeof data.tax !== 'number' || data.tax < 0) {
//             errors.push('Tax is required and must be a non-negative number.');
//         }
//         if (typeof data.shipping !== 'number' || data.shipping < 0) {
//             errors.push('Shipping cost is required and must be a non-negative number.');
//         }
//         if (typeof data.itemCount !== 'number' || data.itemCount < 0) {
//             errors.push('Item count is required and must be a non-negative number.');
//         }
//         if (data.discountAmount !== undefined && (typeof data.discountAmount !== 'number' || data.discountAmount < 0)) {
//             errors.push('Discount amount must be a non-negative number.');
//         }
//     }

//     if (data.total === undefined || typeof data.total !== 'number' || data.total < 0) {
//         errors.push('Total amount is required and must be a non-negative number.');
//     }

//     if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
//         errors.push('Order must contain at least one item.');
//     } else {
//         data.items.forEach((item, index) => {
//             if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
//                 errors.push(`Item ${index + 1}: Product ID (id) is required.`);
//             }
//             if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
//                 errors.push(`Item ${index + 1}: Item name is required.`);
//             }
//             if (typeof item.quantity !== 'number' || item.quantity <= 0) {
//                 errors.push(`Item ${index + 1}: Quantity must be a positive number.`);
//             }
//             if (typeof item.price !== 'number' || item.price < 0) {
//                 errors.push(`Item ${index + 1}: Price must be a non-negative number.`);
//             }
//             if (!item.size || typeof item.size !== 'string' || item.size.trim() === '') {
//                 errors.push(`Item ${index + 1}: Size is required.`);
//             }
//         });
//     }

//     if (data.status !== undefined && !['pending', 'confirmed', 'cancelled', 'shipped', 'delivered'].includes(data.status)) {
//         errors.push('Invalid order status. Must be pending, confirmed, cancelled, shipped, or delivered.');
//     }
//     if (data.shipped !== undefined && typeof data.shipped !== 'boolean') {
//         errors.push('Shipped status must be a boolean.');
//     }
//     if (data.delivered !== undefined && typeof data.delivered !== 'boolean') {
//         errors.push('Delivered status must be a boolean.');
//     }

//     return errors;
// };


// // GET all orders
// router.get('/', async (req, res) => {
//   try {
//     const orders = await Order.find(); // .populate('items.productId'); // Removed populate as item details are now denormalized
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
//   }
// });

// // POST a new order
// router.post('/', async (req, res) => {
//   const validationErrors = validateOrderInput(req.body, true);
//   if (validationErrors.length > 0) {
//       return res.status(400).json({ errors: validationErrors });
//   }

//   try {
//     const newOrder = new Order(req.body);
//     const saved = await newOrder.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     // Handle potential duplicate orderNumber error
//     if (err.code === 11000) { // Duplicate key error
//         return res.status(409).json({ error: 'Order with this number already exists. Please try again.' });
//     }
//     res.status(400).json({ error: 'Failed to place order', details: err.message });
//   }
// });

// // PATCH order status (or other fields)
// router.patch('/:id', async (req, res) => {
//   if (!mongoose.isValidObjectId(req.params.id)) {
//       return res.status(400).json({ error: 'Invalid order ID format.' });
//   }

//   const validationErrors = validateOrderInput(req.body, false); // Validate updates, but not all fields are required for patch
//   if (validationErrors.length > 0) {
//       return res.status(400).json({ errors: validationErrors });
//   }

//   try {
//     const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//     if (!updated) {
//         return res.status(404).json({ error: 'Order not found.' });
//     }
//     res.json(updated);
//   } catch (err) {
//     if (err.name === 'ValidationError') {
//         const errors = Object.keys(err.errors).map(key => err.errors[key].message);
//         return res.status(400).json({ error: 'Validation failed', details: errors });
//     }
//     res.status(400).json({ error: 'Failed to update order', details: err.message });
//   }
// });

// export default router;
// LastV2Gemini/backend/routes/orders.js
import express from 'express';
import Order from '../models/Order.js';
import mongoose from 'mongoose'; // Import mongoose to use isValidObjectId

const router = express.Router();

// Helper for order input validation
const validateOrderInput = (data, isNew = true) => {
    const errors = [];

    // Validations for new orders (all fields required)
    if (isNew) {
        if (!data.orderNumber || typeof data.orderNumber !== 'string' || data.orderNumber.trim() === '') {
            errors.push('Order number is required and must be a non-empty string.');
        }
        if (!data.customerName || typeof data.customerName !== 'string' || data.customerName.trim() === '') {
            errors.push('Customer name is required and must be a non-empty string.');
        }
        if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
            errors.push('A valid customer email is required.');
        }
        if (!data.shippingAddress || typeof data.shippingAddress !== 'string' || data.shippingAddress.trim() === '') {
            errors.push('Shipping address is required.');
        }
        if (!data.date || typeof data.date !== 'string' || data.date.trim() === '') {
            errors.push('Order date is required.');
        }
        if (typeof data.subtotal !== 'number' || data.subtotal < 0) {
            errors.push('Subtotal is required and must be a non-negative number.');
        }
        if (typeof data.tax !== 'number' || data.tax < 0) {
            errors.push('Tax is required and must be a non-negative number.');
        }
        if (typeof data.shipping !== 'number' || data.shipping < 0) {
            errors.push('Shipping cost is required and must be a non-negative number.');
        }
        if (typeof data.itemCount !== 'number' || data.itemCount < 0) {
            errors.push('Item count is required and must be a non-negative number.');
        }
        if (data.discountAmount === undefined || typeof data.discountAmount !== 'number' || data.discountAmount < 0) {
            errors.push('Discount amount is required and must be a non-negative number.'); // Made required for new
        }

        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
            errors.push('Order must contain at least one item.');
        } else {
            data.items.forEach((item, index) => {
                if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
                    errors.push(`Item ${index + 1}: Product ID (id) is required.`);
                }
                if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
                    errors.push(`Item ${index + 1}: Item name is required.`);
                }
                if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                    errors.push(`Item ${index + 1}: Quantity must be a positive number.`);
                }
                if (typeof item.price !== 'number' || item.price < 0) {
                    errors.push(`Item ${index + 1}: Price must be a non-negative number.`);
                }
                if (!item.size || typeof item.size !== 'string' || item.size.trim() === '') {
                    errors.push(`Item ${index + 1}: Size is required.`);
                }
            });
        }
    }


    // Validations for fields if they are present (for both new and updates)
    if (data.total !== undefined && (typeof data.total !== 'number' || data.total < 0)) {
        errors.push('Total amount must be a non-negative number.');
    }
    if (data.status !== undefined && !['pending', 'confirmed', 'cancelled', 'shipped', 'delivered'].includes(data.status)) {
        errors.push('Invalid order status. Must be pending, confirmed, cancelled, shipped, or delivered.');
    }
    if (data.shipped !== undefined && typeof data.shipped !== 'boolean') {
        errors.push('Shipped status must be a boolean.');
    }
    if (data.delivered !== undefined && typeof data.delivered !== 'boolean') {
        errors.push('Delivered status must be a boolean.');
    }
    // For updates, if items are provided, validate them. Otherwise, don't require them.
    if (!isNew && data.items !== undefined) {
      if (!Array.isArray(data.items) || data.items.length === 0) {
          errors.push('If provided, order must contain at least one item.');
      } else {
          data.items.forEach((item, index) => {
              if (item.id !== undefined && (typeof item.id !== 'string' || item.id.trim() === '')) {
                  errors.push(`Item ${index + 1}: Product ID (id) must be a non-empty string.`);
              }
              if (item.name !== undefined && (typeof item.name !== 'string' || item.name.trim() === '')) {
                  errors.push(`Item ${index + 1}: Item name must be a non-empty string.`);
              }
              if (item.quantity !== undefined && (typeof item.quantity !== 'number' || item.quantity <= 0)) {
                  errors.push(`Item ${index + 1}: Quantity must be a positive number.`);
              }
              if (item.price !== undefined && (typeof item.price !== 'number' || item.price < 0)) {
                  errors.push(`Item ${index + 1}: Price must be a non-negative number.`);
              }
              if (item.size !== undefined && (typeof item.size !== 'string' || item.size.trim() === '')) {
                  errors.push(`Item ${index + 1}: Size must be a non-empty string.`);
              }
          });
      }
    }
    
    return errors;
};


// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// POST a new order
router.post('/', async (req, res) => {
  const validationErrors = validateOrderInput(req.body, true); // true for new order
  if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
  }

  try {
    const newOrder = new Order(req.body);
    const saved = await newOrder.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error
        return res.status(409).json({ error: 'Order with this number already exists. Please try again.' });
    }
    res.status(400).json({ error: 'Failed to place order', details: err.message });
  }
});

// PATCH order status (or other fields)
router.patch('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID format.' });
  }

  // Pass false for isNew to allow partial validation
  const validationErrors = validateOrderInput(req.body, false);
  if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
  }

  try {
    // Only update fields that are provided in the request body
    const updateDoc = { $set: req.body };
    const updated = await Order.findByIdAndUpdate(req.params.id, updateDoc, { new: true, runValidators: true });
    
    if (!updated) {
        return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
        const errors = Object.keys(err.errors).map(key => err.errors[key].message);
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    res.status(400).json({ error: 'Failed to update order', details: err.message });
  }
});

// DELETE an order
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID format.' });
  }
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ error: 'Order not found.' });
    }
    res.json({ success: true, message: 'Order deleted successfully.' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete order', details: err.message });
  }
});

export default router;