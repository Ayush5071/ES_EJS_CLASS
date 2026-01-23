import User from '../models/User.js';
import Submission from '../models/Submission.js';

export async function register(req, res) {
  const { name, email } = req.body;
  if (!email) return res.status(400).render('auth', { message: 'Email is required' });
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.render('auth', { message: 'User already registered' });
    await User.create({ name, email });
    res.render('auth', { message: 'Registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).render('auth', { message: 'Error registering user' });
  }
}

export async function login(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).render('auth', { message: 'Email is required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.render('auth', { message: 'User has not registered' });

    const sub = await Submission.findOne({ email }).sort({ createdAt: -1 });
    if (sub) return res.redirect(`/submissions/profile/${sub._id}?email=${encodeURIComponent(email)}`);

    res.render('auth', { message: 'Logged in — no submissions yet. Submit the form first.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('auth', { message: 'Error during login' });
  }
}