const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Brief = require('../models/Brief');
const { createTasksFromPlan } = require('../controllers/taskController');  // Import task creation function

/**
 * POST /api/brief/plan
 * Body: { brief: string }
 * - Accepts a project brief and breaks it into a structured plan
 * - Creates tasks based on the plan
 */
router.post('/plan', async (req, res) => {
  try {
    const { brief } = req.body || {};
    if (!brief || !String(brief).trim()) {
      return res.status(400).json({ error: 'brief is required' });
    }

    // Generate the plan from the brief
    const plan = planFromBrief(brief);
    
    // Save the brief and plan to the database
    const briefDoc = await Brief.create({
      userId: req.user.id,
      brief: String(brief).trim(),
      plan,
    });

    // Create tasks from the plan
    const tasks = await createTasksFromPlan(plan, req.user.id);

    return res.status(201).json({ brief: briefDoc, tasks });
  } catch (err) {
    console.error('Error committing plan:', err);
    return res.status(500).json({ error: err.message || 'Failed to commit plan' });
  }
});

module.exports = router;
