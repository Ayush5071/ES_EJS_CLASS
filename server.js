import express from 'express';
import { connectDB } from './helpers/db.js';
import Submission from './models/Submission.js';
import User from './models/User.js';
import { requireRegistered } from './helpers/auth.js';
import authRouter from './routes/auth.js';
import submissionsRouter from './routes/submissions.js';
import dotenv from 'dotenv';

const app = express();
dotenv.config();


console.log('Using MongoDB URI:', process.env.MONGODB_URI);

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
// mount routers
app.use('/auth', authRouter);
app.use('/submissions', submissionsRouter);

// optional: a demo list (for classroom use)
app.get('/list', async (req, res) => {
  try {
    const docs = await Submission.find().sort({ createdAt: -1 }).lean();
    res.render('list', { submissions: docs });
  } catch (err) {
    console.error('List fetch error:', err);
    res.status(500).send('Error fetching submissions');
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});