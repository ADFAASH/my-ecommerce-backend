import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import 'dotenv/config'; // Correct way to load .env variables in ES Modules
import userRoutes from './routes/users.js'; 

const app = express();
app.use(cors());
app.use(express.json());
app.get('/test-server', (req, res) => {
  res.send('✅ Server is working!');
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// --- ADD new users route ---
app.use('/api/users', userRoutes); 

// Connect to MongoDB Atlas using the environment variable
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,    // Recommended options for new connections
  useUnifiedTopology: true  // Recommended options for new connections
})
  .then(() => {
    console.log('MongoDB connected to Atlas!'); // Updated log message
    app.listen(5050, () => console.log('Server running on port 5050'));
  })
  .catch(err => console.error("MongoDB connection error:", err)); // More descriptive error log