import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true }, // Smallest size price or default
  pricePer10Ml: { type: Number, required: true },
  calculatedPrices: { type: mongoose.Schema.Types.Mixed, default: {} }, // Stores { '30ml': 50, '50ml': 80 }
  sizeStocks: { type: mongoose.Schema.Types.Mixed, default: {} }, // Stores { '30ml': 100, '50ml': 50 }
  inStock: { type: Boolean, default: true }, // Derived status, can be updated based on sizeStocks
  description: { type: String, default: '' },
  notes: {
    top: { type: [String], default: [] },
    heart: { type: [String], default: [] },
    base: { type: [String], default: [] },
  },
  reviews: { type: Number, default: 0 },
  sizes: { type: [String], default: [] }, // e.g., ['30ml', '50ml', '100ml']
  images: { type: [String], default: [] },
  isFeatured: { type: Boolean, default: false },
  isVisibleInCollection: { type: Boolean, default: true }, // Default to true for new products
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);