// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import productRoutes from './routes/products.js';
// import orderRoutes from './routes/orders.js';
// import 'dotenv/config'; // Correct way to load .env variables in ES Modules

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.get('/test-server', (req, res) => {
//   res.send('✅ Server is working!');
// });

// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);

// // Connect to MongoDB Atlas using the environment variable
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,    // Recommended options for new connections
//   useUnifiedTopology: true  // Recommended options for new connections
// })
//   .then(() => {
//     console.log('MongoDB connected to Atlas!'); // Updated log message
//     app.listen(5050, () => console.log('Server running on port 5050'));
//   })
//   .catch(err => console.error("MongoDB connection error:", err)); // More descriptive error log
// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
// --- ADD Import for new users route ---
import userRoutes from './routes/users.js'; 
// --- END ADD ---
import Stripe from 'stripe'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
app.set('stripe', stripe);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected to Atlas!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
// --- ADD new users route ---
app.use('/api/users', userRoutes); 
// --- END ADD ---

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});