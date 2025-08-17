
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  userId: {
    type: String, // This MUST be String to accept guest IDs like "guest_..."
    required: true,
    index: true, // Index for efficient querying by userId
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000, // Limit message length
  },
  sender: {
    type: String, // 'user' or 'admin'
    required: true,
    enum: ['user', 'admin'],
  },
  timestamp: {
    type: Date,
    default: Date.now, // Default to current time
    index: true, // Index for efficient sorting
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Ensure the model is not recompiled if it already exists
// This pattern helps prevent "OverwriteModelError" in development mode
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

export default Message;
