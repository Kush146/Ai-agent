const mongoose = require('mongoose');
const Task = require('../models/Task');

// Create task
async function createTask(req, res) {
  try {
    const { name, description, area } = req.body || {};
    if (!name || !description || !area) {
      return res.status(400).json({ error: 'name, description, and area are required' });
    }

    // Ensure the task's area is either 'frontend' or 'backend'
    if (!['frontend', 'backend'].includes(area)) {
      return res.status(400).json({ error: 'Area must be either frontend or backend' });
    }

    const newTask = await Task.create({
      userId: req.user.id,
      name,
      description,
      area, // Add area field
    });
    return res.status(201).json(newTask);
  } catch (error) {
    console.error('createTask error:', error);
    return res.status(500).json({ error: error?.message || 'Error creating task' });
  }
}

// Read all tasks for current user
async function getTasks(req, res) {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('getTasks error:', error);
    return res.status(500).json({ error: error?.message || 'Error fetching tasks' });
  }
}

// Update task (load → check owner → save)
async function updateTask(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'invalid task id' });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (String(task.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const hasName = Object.prototype.hasOwnProperty.call(req.body || {}, 'name');
    const hasDesc = Object.prototype.hasOwnProperty.call(req.body || {}, 'description');
    if (!hasName && !hasDesc) return res.status(400).json({ error: 'Nothing to update' });

    if (hasName) task.name = String(req.body.name || '').trim();
    if (hasDesc) task.description = String(req.body.description || '').trim();

    await task.save();
    return res.status(200).json(task);
  } catch (error) {
    console.error('updateTask error:', error);
    return res.status(500).json({ error: error?.message || 'Error updating task' });
  }
}

// Delete task (owner only)
async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'invalid task id' });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (String(task.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await task.deleteOne();
    return res.status(200).json({ ok: true, id });
  } catch (error) {
    console.error('deleteTask error:', error);
    return res.status(500).json({ error: error?.message || 'Error deleting task' });
  }
}

// New function to handle batch task creation from the plan
async function createTasksFromPlan(plan, userId) {
  try {
    const createdTasks = [];

    for (const taskPlan of plan) {
      // Create tasks from plan
      const newTask = await Task.create({
        userId,
        name: `[${taskPlan.area}] ${taskPlan.title}`,
        description: taskPlan.description,
        area: taskPlan.area, // Assign area (frontend or backend)
      });

      createdTasks.push(newTask);
    }

    return createdTasks;
  } catch (error) {
    console.error('createTasksFromPlan error:', error);
    throw new Error('Failed to create tasks from plan');
  }
}

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  createTasksFromPlan, // Expose the new function to handle task creation from the plan
};
