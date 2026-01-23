import User from '../models/User.js';

export async function requireRegistered(req, res, next) {
  try {
    const email = (req.body && req.body.email) || (req.query && req.query.email);
    if (!email) return res.status(400).send('Email is required for this action');

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(401).send('User has not registered');

    req.user = user; // attach for downstream handlers (demonstration)
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).send('Server error');
  }
}
