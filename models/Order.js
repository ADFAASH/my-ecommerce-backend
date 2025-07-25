import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true }, // NEW: Added orderNumber
  customerName: { type: String, required: true }, // NEW: Added customerName
  email: { type: String, required: true },
  items: [
    {
      id: { type: String, required: true }, // Changed from productId to id and type to String to match frontend
      name: { type: String, required: true }, // NEW: Added item name
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }, // NEW: Added item price
      size: { type: String, required: true }, // NEW: Added item size
      // Optional: you might want to store a snapshot of other item details like image, inStock etc.
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  date: { type: String, required: true }, // NEW: Added order date (YYYY-MM-DD string)
  shippingAddress: { type: String, required: true }, // NEW: Added shipping address
  subtotal: { type: Number, required: true }, // NEW: Added subtotal
  tax: { type: Number, required: true }, // NEW: Added tax
  shipping: { type: Number, required: true }, // NEW: Added shipping
  itemCount: { type: Number, required: true }, // NEW: Added itemCount
  discountAmount: { type: Number, default: 0 }, // NEW: Added discountAmount
  shipped: { type: Boolean, default: false }, // NEW: Added shipped status
  delivered: { type: Boolean, default: false }, // NEW: Added delivered status
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);