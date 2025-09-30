// backend/routes/agentRoutes.js
const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  createPlan,
  listBriefs,
  getBrief,
  commitPlan,
} = require('../controllers/agentController');

const router = express.Router();

router.use(requireAuth);

router.post('/plan', createPlan);
router.get('/briefs', listBriefs);
router.get('/briefs/:id', getBrief);
router.post('/briefs/:id/commit', commitPlan);

module.exports = router; // <-- important
