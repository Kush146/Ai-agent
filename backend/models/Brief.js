const mongoose = require('mongoose');

const plannedTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    area: {
      type: String,
      enum: ['frontend', 'backend'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['planned', 'created'],
      default: 'planned',
    },
  },
  { _id: false }
);

const briefSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    brief: { type: String, required: true, trim: true },
    plan: [plannedTaskSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Brief', briefSchema);
