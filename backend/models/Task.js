const mongoose = require('mongoose');

// Define schema for tasks
const taskSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true 
    },
    status: { 
      type: String, 
      enum: ['planned', 'in-progress', 'completed'],
      default: 'planned' // Status can be 'planned', 'in-progress', or 'completed'
    },
    area: { 
      type: String, 
      enum: ['frontend', 'backend'], 
      required: true 
    },
  },
  { timestamps: true }
);

// Create model and export
module.exports = mongoose.model('Task', taskSchema);
