const jwt = require('jsonwebtoken');
const User = require('../models/User');

function sign(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'email, name, password required' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'email already in use' });

    const user = await User.create({ email, name, password });
    const token = sign(user._id);
    return res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: err.message || 'register failed' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = sign(user._id);
    return res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: err.message || 'login failed' });
  }
}

// GET /api/auth/me
async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select('_id email name');
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json({ user });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ error: err.message || 'failed' });
  }
}

module.exports = { register, login, me };
