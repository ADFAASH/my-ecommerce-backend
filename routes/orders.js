import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js'; // Import Product model

const router = express.Router();

router.get('/test', (req, res) => {
  res.send('✅ Orders route is working!');
});

// Helper for order input validation
const validateOrderInput = (data) => {
    const errors = [];
    if (!data.orderNumber || typeof data.orderNumber !== 'string' || data.orderNumber.trim() === '') {
        errors.push('Order number is required and must be a non-empty string.');
    }
    if (!data.customerName || typeof data.customerName !== 'string' || data.customerName.trim() === '') {
        errors.push('Customer name is required and must be a non-empty string.');
    }
    if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
        errors.push('Valid email is required.');
    }
    if (!Array.isArray(data.items) || data.items.length === 0) {
        errors.push('Order must contain at least one item.');
    } else {
        data.items.forEach((item, index) => {
            if (!item.id || typeof item.id !== 'string') errors.push(`Item ${index}: Product ID is required.`);
            if (!item.name || typeof item.name !== 'string') errors.push(`Item ${index}: Product name is required.`);
            if (typeof item.quantity !== 'number' || item.quantity <= 0) errors.push(`Item ${index}: Quantity must be a positive number.`);
            if (typeof item.price !== 'number' || item.price < 0) errors.push(`Item ${index}: Price must be a non-negative number.`);
            if (!item.size || typeof item.size !== 'string') errors.push(`Item ${index}: Size is required.`);
        });
    }
    if (typeof data.total !== 'number' || data.total < 0) {
        errors.push('Total amount is required and must be a non-negative number.');
    }
    if (!data.status || !['pending', 'confirmed', 'cancelled'].includes(data.status)) {
        errors.push('Status must be pending, confirmed, or cancelled.');
    }
    if (!data.shippingAddress || typeof data.shippingAddress !== 'string' || data.shippingAddress.trim() === '') {
        errors.push('Shipping address is required.');
    }
    if (typeof data.subtotal !== 'number' || data.subtotal < 0) errors.push('Subtotal is required and must be non-negative.');
    if (typeof data.tax !== 'number' || data.tax < 0) errors.push('Tax is required and must be non-negative.');
    if (typeof data.shipping !== 'number' || data.shipping < 0) errors.push('Shipping is required and must be non-negative.');
    if (typeof data.itemCount !== 'number' || data.itemCount < 0) errors.push('Item count is required and must be non-negative.');
    if (typeof data.discountAmount !== 'number' || data.discountAmount < 0) errors.push('Discount amount is required and must be non-negative.');

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

// GET a single order by ID
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID format.' });
  }
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order', details: err.message });
  }
});

// POST a new order
router.post('/', async (req, res) => {
  console.log('!!!!!!! DEBUG: Order POST route was hit !!!!!!!'); // DEBUG LOG

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('Backend: Order POST request received.'); // DEBUG LOG
    console.log('Backend: Request Body:', JSON.stringify(req.body, null, 2)); // DEBUG LOG

    const validationErrors = validateOrderInput(req.body);
    if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
    }

    // Check for existing order number to prevent duplicates
    const existingOrder = await Order.findOne({ orderNumber: req.body.orderNumber }).session(session);
    if (existingOrder) {
        throw new Error('Order number already exists.');
    }

    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save({ session });
    console.log('Backend: New order saved with ID:', savedOrder._id); // DEBUG LOG

    // Deduct stock for each item in the order
    for (const item of req.body.items) {
      console.log(`Backend: Processing item ${item.name} (${item.size}) with ID ${item.id}`); // DEBUG LOG
      const product = await Product.findById(item.id).session(session);

      if (!product) {
        console.error(`Backend: Product not found for ID ${item.id}.`); // DEBUG LOG
        throw new Error(`Product with ID ${item.id} not found.`);
      }

      const requestedQuantity = item.quantity;
      // Use bracket notation for reading stock (Fix for .get() error)
      const currentStock = product.sizeStocks[item.size];

      console.log(`Backend: Product "${product.name}" (ID: ${product._id}) - Current stock for ${item.size}: ${currentStock}, Requested: ${requestedQuantity}`); // DEBUG LOG

      if (currentStock === undefined || currentStock < requestedQuantity) {
        console.error(`Backend: Insufficient stock for ${product.name} (${item.size}).`); // DEBUG LOG
        throw new Error(`Insufficient stock for product "${product.name}" (Size: ${item.size}). Available: ${currentStock || 0}, Requested: ${requestedQuantity}.`);
      }

      // Use assignment for deducting stock (Fix for .set() error)
      product.sizeStocks[item.size] = currentStock - requestedQuantity;

      // --- ADDED FIX: Mark sizeStocks as modified for Mongoose Mixed type ---
      product.markModified('sizeStocks'); // <-- Crucial for Mongoose to detect nested changes
      console.log('Backend: sizeStocks marked as modified.'); // DEBUG LOG
      // --- END ADDED FIX ---

      // Update overall inStock status based on new sizeStocks (Fix for .values() error)
      let overallInStock = false;
      for (const stock of Object.values(product.sizeStocks)) { // Use Object.values()
          if (stock > 0) {
              overallInStock = true;
              break;
          }
      }
      product.inStock = overallInStock;
      console.log(`Backend: Overall inStock for ${product.name} set to: ${product.inStock}`); // DEBUG LOG

      await product.save({ session });
      console.log(`Backend: Product ${product.name} (ID: ${product._id}) saved after stock update.`); // DEBUG LOG
    }

    await session.commitTransaction();
    console.log('Backend: Transaction committed successfully!'); // DEBUG LOG
    res.status(201).json(savedOrder);

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Backend: Order creation failed and transaction aborted:', err.message); // DEBUG LOG
    res.status(400).json({ error: 'Failed to create order', details: err.message });
  } finally {
    session.endSession();
    console.log('Backend: Session ended.'); // DEBUG LOG
  }
});

// PATCH (partial update) an order
router.patch('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID format.' });
  }

  const updates = req.body;
  const validUpdates = ['status', 'shipped', 'delivered', 'customerName', 'email', 'shippingAddress', 'total', 'subtotal', 'tax', 'shipping', 'itemCount', 'discountAmount']; // Add any other fields that can be patched

  const receivedUpdates = Object.keys(updates);
  const isValidOperation = receivedUpdates.every(update => validUpdates.includes(update));

  if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates provided!' });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
    }

    // Apply updates
    receivedUpdates.forEach(update => (order[update] = updates[update]));

    // Handle specific status transitions or logic if needed
    if (updates.status && order.status !== updates.status) {
        // You might add logic here for status changes, e.g., if changing from 'pending' to 'cancelled', revert stock
        // For now, only the `status` field is directly updated.
    }


    await order.save();
    res.json(order);
  } catch (err) {
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