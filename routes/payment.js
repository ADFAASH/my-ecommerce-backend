// backend/routes/payment.js
import express from 'express';
// import Stripe from 'stripe'; // REMOVE this top-level import

const router = express.Router();

// REMOVE this top-level initialization
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST endpoint to create a Payment Intent
router.post('/create-payment-intent', async (req, res) => {
  // --- ADD THIS LINE TO GET STRIPE INSTANCE ---
  const stripe = req.app.get('stripe'); // Get the stripe instance from app.set()
  if (!stripe) {
    console.error('Stripe not initialized on app instance.');
    return res.status(500).json({ error: 'Stripe service not available.' });
  }
  // --- END ADDED LINE ---

  const { amount, currency = 'usd' } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ['card'],
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating Payment Intent:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;