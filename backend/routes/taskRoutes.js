const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { 
  createTask, 
  getTasks, 
  updateTask, 
  deleteTask 
} = require('../controllers/taskController');  // Ensure the controller is properly imported

const router = express.Router();

// All task routes require authentication
router.use(requireAuth);

// Route for creating a new task
router.post('/', createTask);

// Route for getting all tasks for the authenticated user
router.get('/', getTasks);

// Route for updating a task (PUT)
router.put('/:id', updateTask);

// Route for partially updating a task (PATCH)
router.patch('/:id', updateTask);

// Route for deleting a task by ID
router.delete('/:id', deleteTask);

module.exports = router;
