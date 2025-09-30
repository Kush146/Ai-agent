// models/Plan.js
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  brief: String,
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});

module.exports = mongoose.model('Plan', planSchema);
