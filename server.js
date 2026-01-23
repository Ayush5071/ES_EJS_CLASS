import express from 'express';
import { connectDB } from './helpers/db.js';
import Submission from './models/Submission.js';
import User from './models/User.js';
import { requireRegistered } from './helpers/auth.js';
const app = express();

// parse HTML form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // support JSON bodies too

// view engine setup (EJS)
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

// connect to local MongoDB helper
connectDB().catch(err => console.error(err));

// show the simple form
app.get('/', (req, res) => {
  res.render('form');
});
app.post('/submit', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const doc = await Submission.create({ name, email, message });
    res.render('result', { id: doc._id, name: doc.name, email: doc.email, message: doc.message });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).send('Error saving submission');
  }
});

// register (minimal, no hashing)
app.post('/register', async (req, res) => {
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
});

// login (minimal)
app.post('/login', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).render('auth', { message: 'Email is required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.render('auth', { message: 'User has not registered' });

    // find latest submission by this email and redirect to profile if exists
    const sub = await Submission.findOne({ email }).sort({ createdAt: -1 });
    if (sub) return res.redirect(`/profile/${sub._id}?email=${encodeURIComponent(email)}`);

    // otherwise show a message
    res.render('auth', { message: 'Logged in — no submissions yet. Submit the form first.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('auth', { message: 'Error during login' });
  }
});

// profile page (minimal, protected by middleware)
app.get('/profile/:id', requireRegistered, async (req, res) => {
  try {
    const doc = await Submission.findById(req.params.id).lean();
    if (!doc) return res.status(404).send('Not found');
    res.render('profile', { submission: doc });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).send('Error fetching submission');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});