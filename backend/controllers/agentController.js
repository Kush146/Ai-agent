const mongoose = require('mongoose');
const Brief = require('../models/Brief');
const Task = require('../models/Task');

/**
 * Naive brief -> task planner
 * - Scans for keywords to split into frontend/backend buckets
 * - Expands into concrete tasks
 */
function planFromBrief(brief) {
  const text = brief.toLowerCase();

  const wantsAuth = /(auth|login|signup|register)/.test(text);
  const wantsShare = /(share|invite|collaborate)/.test(text);
  const wantsApi = /(api|rest|graphql|endpoint)/.test(text);
  const wantsDb = /(db|database|schema|model|persist)/.test(text);
  const wantsUi = /(ui|page|screen|react|component|form)/.test(text);

  /** @type {Array<{title:string, description:string, area:'frontend'|'backend'}>} */
  const plan = [];

  // Backend
  if (wantsAuth) {
    plan.push(
      {
        area: 'backend',
        title: 'Auth: Register/Login endpoints',
        description: 'Add /api/auth/register and /api/auth/login with JWT issuing and password hashing.',
      },
      {
        area: 'backend',
        title: 'Auth: Protect routes',
        description: 'Add requireAuth middleware and secure all user-owned routes.',
      }
    );
  }

  if (wantsApi || wantsDb) {
    plan.push(
      {
        area: 'backend',
        title: 'Design data model',
        description: 'Define Mongoose schemas and indexes for main entities following the brief.',
      },
      {
        area: 'backend',
        title: 'CRUD endpoints',
        description: 'Expose REST endpoints for create/read/update/delete per entity.',
      }
    );
  }

  if (wantsShare) {
    plan.push(
      {
        area: 'backend',
        title: 'Sharing model & rules',
        description: 'Add sharing schema (owner, members, roles). Write access checks in controllers.',
      },
      {
        area: 'backend',
        title: 'Invite endpoint',
        description: 'Endpoint to send an invite (email token or direct add) and accept invite.',
      }
    );
  }

  // Frontend
  if (wantsUi || wantsAuth || wantsApi) {
    plan.push(
      {
        area: 'frontend',
        title: 'Auth screens',
        description: 'Build Login and Register screens. Save JWT to localStorage. Add Logout.',
      },
      {
        area: 'frontend',
        title: 'Core list/detail UI',
        description: 'Create responsive components to list, create, edit, delete the main entity.',
      }
    );
  }

  // Always add a README task
  plan.push({
    area: 'backend',
    title: 'Project README & scripts',
    description: 'Provide setup steps, env variables, and npm scripts for dev & prod.',
  });

  // Fallback if nothing matched
  if (plan.length === 1) {
    plan.unshift({
      area: 'frontend',
      title: 'Initial UI skeleton',
      description: 'Set up React entry, routing, and a placeholder screen for the feature.',
    });
  }

  return plan;
}

/**
 * POST /api/agent/plan
 * body: { brief: string }
 * returns: created Brief doc with plan[]
 */
async function createPlan(req, res) {
  try {
    const { brief } = req.body || {};
    if (!brief || !String(brief).trim()) {
      return res.status(400).json({ error: 'brief is required' });
    }

    const plan = planFromBrief(brief);
    const doc = await Brief.create({
      userId: req.user.id,
      brief: String(brief).trim(),
      plan,
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error('createPlan error:', err);
    return res.status(500).json({ error: err.message || 'failed to create plan' });
  }
}

/**
 * GET /api/agent/briefs
 * returns: list of briefs for current user
 */
async function listBriefs(req, res) {
  try {
    const items = await Brief.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json(items);
  } catch (err) {
    console.error('listBriefs error:', err);
    return res.status(500).json({ error: err.message || 'failed to load briefs' });
  }
}

/**
 * GET /api/agent/briefs/:id
 */
async function getBrief(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'invalid id' });
    const b = await Brief.findOne({ _id: id, userId: req.user.id });
    if (!b) return res.status(404).json({ error: 'not found' });
    return res.json(b);
  } catch (err) {
    console.error('getBrief error:', err);
    return res.status(500).json({ error: err.message || 'failed to load brief' });
  }
}

/**
 * POST /api/agent/briefs/:id/commit
 * Creates real Task docs from plan items (marks them created in Brief)
 */
async function commitPlan(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'invalid id' });

    const brief = await Brief.findOne({ _id: id, userId: req.user.id });
    if (!brief) return res.status(404).json({ error: 'not found' });

    const toCreate = brief.plan.filter(p => p.status === 'planned');
    const created = [];

    for (const p of toCreate) {
      const task = await Task.create({
        userId: req.user.id,
        name: `[${p.area}] ${p.title}`,
        description: p.description,
      });
      created.push(task);
      p.status = 'created';
    }

    await brief.save();

    return res.json({ ok: true, createdCount: created.length, tasks: created, brief });
  } catch (err) {
    console.error('commitPlan error:', err);
    return res.status(500).json({ error: err.message || 'failed to commit plan' });
  }
}

module.exports = {
  createPlan,
  listBriefs,
  getBrief,
  commitPlan,
};
