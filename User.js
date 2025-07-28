// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager'], default: 'admin' }, // Example roles
  pushTokens: { type: [String], default: [] }, // NEW: Array to store device push tokens
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
