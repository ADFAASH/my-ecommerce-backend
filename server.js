// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import productRoutes from './routes/products.js';  // ✅ this must be correct
// import orderRoutes from './routes/orders.js';      // ✅ optional for later
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.get('/test-server', (req, res) => {
//   res.send('✅ Server is working!');
// });

// app.use('/api/products', productRoutes);  // ✅ this must exist
// app.use('/api/orders', orderRoutes);      // ✅ this must exist if needed

// mongoose.connect('mongodb://localhost:27017/lumiere')
//   .then(() => {
//     console.log('MongoDB connected');
//     app.listen(5050, () => console.log('Server running on port 5050'));
//   })
//   .catch(err => console.error(err));
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import 'dotenv/config'; // Correct way to load .env variables in ES Modules

const app = express();
app.use(cors());
app.use(express.json());
app.get('/test-server', (req, res) => {
  res.send('✅ Server is working!');
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

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