const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  generateFromPlan,
  generateFrontend,
  generateBackend,
} = require('../controllers/codegenController');

const router = express.Router();
router.use(requireAuth);

// Generate directly from a brief's plan item (auto-chooses frontend/backend by area)
router.post('/from-plan/:id/:idx', generateFromPlan);

// Optional direct generators
router.post('/frontend', generateFrontend);
router.post('/backend', generateBackend);

module.exports = router;
