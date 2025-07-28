// backend/routes/users.js
import express from 'express';
import User from '../models/User.js'; // Import your User model

const router = express.Router();

// POST endpoint to register a push token for a user
// In a real app, this route would be protected and userId would come from authenticated session
router.post('/register-push-token', async (req, res) => {
  const { userId, token } = req.body; // Mobile app sends userId and token

  if (!userId || !token) {
    return res.status(400).json({ message: 'User ID and token are required.' });
  }

  try {
    // Find the user (admin) by their ID
    const user = await User.findById(userId);
    // You might also find by username or email if that's how your admins are identified
    // const user = await User.findOne({ username: userId }); 

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Add token if not already present in the user's pushTokens array
    if (!user.pushTokens.includes(token)) {
      user.pushTokens.push(token);
      await user.save();
    }
    res.status(200).json({ message: 'Push token registered successfully.' });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ message: 'Failed to register push token.' });
  }
});

export default router;