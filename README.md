# EJS + Tailwind Setup Guide ✅

A concise step-by-step guide to set up EJS in an Express project and include Tailwind via CDN.

---

## Prerequisites 💡
- Node.js (v14+)
- A project folder opened in your terminal/VS Code

## 1) Initialize project
```bash
npm init -y
```

## 2) Install only the libraries your project actually uses
Your project already uses **express**, **ejs**, and **mongoose** (check `package.json`). Install only what you need:

```bash
npm i express ejs mongoose
```

For development convenience (optional):
```bash
npm i -D nodemon
```

**Don't** install libraries you won't use — only add extras (e.g. `cors`) if your code requires them.


## 3) Use ES modules (optional but recommended)
- Add or ensure the following in `package.json`:
```json
{
  "type": "module"
}
```
This allows `import`/`export` syntax (example: `import express from 'express'`).

## 4) Add npm scripts to `package.json`
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

## 5) Example `server.js` (matches your project)
```js
import express from 'express';
import { connectDB } from './helpers/db.js';
import authRouter from './routes/auth.js';
import submissionsRouter from './routes/submissions.js';
import Submission from './models/Submission.js';

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// connect to MongoDB
connectDB().catch(err => console.error(err));

// render the form at root
app.get('/', (req, res) => res.render('form'));

// mount routers
app.use('/auth', authRouter);
app.use('/submissions', submissionsRouter);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

## Project structure (your repo)
```
package.json
server.js
controllers/
	authController.js
	submissionController.js
helpers/
	auth.js
	db.js
models/
	Submission.js
	User.js
routes/
	auth.js
	submissions.js
views/
	auth.ejs
	form.ejs
	list.ejs
	profile.ejs
	result.ejs
public/
	(static assets)
```

> Note: This README reflects the files and templates already present in your project. Avoid installing libraries that aren't used in your code.

## 6) Basic view example (`views/index.ejs`)
```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title><%= title %></title>
  <!-- Tailwind CDN (add this to use Tailwind quickly) -->
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 font-sans">
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold"><%= title %></h1>
  </div>
</body>
</html>
```

> Note: The Tailwind CDN is good for quick prototypes. For production usage or advanced customization, prefer installing Tailwind via npm and building your CSS.

## 7) Forms & POST handling
- HTML form example:
```html
<form action="/submit" method="POST">
  <input name="name" />
  <button>Send</button>
</form>
```
- Express route:
```js
app.post('/submit', (req, res) => {
  res.render('result', { name: req.body.name });
});
```

## 8) Run the app
```bash
npm run dev  # development with nodemon
npm start    # production
```

---

If you'd like, I can add a small example page or partials for `header.ejs`/`footer.ejs` and wire Tailwind partials into your existing views. 🔧

---

## Exact file contents (current project) 🔍

Below are the exact contents of the main files in this project as they currently exist — paste or inspect as needed.

### `package.json`
```json
{
  "name": "class",
  "version": "1.0.0",
  "description": "",
  "keywords": [
    "e"
  ],
  "license": "ISC",
  "author": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.6",
    "ejs": "^4.0.1",
    "express": "^5.2.1",
    "mongoose": "^9.1.5",
    "nodemon": "^3.1.11"
  }
}
```

---

### `server.js`
```js
import express from 'express';
import { connectDB } from './helpers/db.js';
import Submission from './models/Submission.js';
import User from './models/User.js';
import { requireRegistered } from './helpers/auth.js';
import authRouter from './routes/auth.js';
import submissionsRouter from './routes/submissions.js';
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
```

---

### `helpers/db.js`
```js
import mongoose from 'mongoose';

export async function connectDB(uri = 'mongodb://127.0.0.1:27017/classDB') {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}
```

---

### `helpers/auth.js`
```js
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
```

---

### `controllers/authController.js`
```js
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
```

---

### `controllers/submissionController.js`
```js
import Submission from '../models/Submission.js';

export async function submit(req, res) {
  const { name, email, message } = req.body;
  try {
    const doc = await Submission.create({ name, email, message });
    res.render('result', { id: doc._id, name: doc.name, email: doc.email, message: doc.message });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).send('Error saving submission');
  }
}

export async function profile(req, res) {
  try {
    const doc = await Submission.findById(req.params.id).lean();
    if (!doc) return res.status(404).send('Not found');
    res.render('profile', { submission: doc });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).send('Error fetching submission');
  }
}

export async function list(req, res) {
  try {
    const docs = await Submission.find().sort({ createdAt: -1 }).lean();
    res.render('list', { submissions: docs });
  } catch (err) {
    console.error('List fetch error:', err);
    res.status(500).send('Error fetching submissions');
  }
}
```

---

### `models/Submission.js`
```js
import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
}, { timestamps: true });

export default mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
```

---

### `models/User.js`
```js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
```

---

### `routes/auth.js`
```js
import express from 'express';
import { register, login } from '../controllers/authController.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

export default router;
```

---

### `routes/submissions.js`
```js
import express from 'express';
import { submit, profile, list } from '../controllers/submissionController.js';
import { requireRegistered } from '../helpers/auth.js';
const router = express.Router();

router.post('/submit', submit);
router.get('/profile/:id', requireRegistered, profile);
router.get('/list', list);

export default router;
```

---

### `views/form.ejs`
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Simple Form</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen flex items-start justify-center py-10">
  <main class="bg-white rounded-lg shadow-md w-full max-w-md p-6">
    <h1 class="text-2xl font-semibold mb-4">Simple Form</h1>

    <form action="/submissions/submit" method="post" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Name</label>
        <input name="name" required class="mt-1 block w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="email" required class="mt-1 block w-full border rounded px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Message</label>
        <textarea name="message" rows="4" class="mt-1 block w-full border rounded px-3 py-2"></textarea>
      </div>

      <div>
        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded">Send</button>
      </div>
    </form>

    <hr class="my-6">

    <div class="grid grid-cols-1 gap-4">
      <div>
        <h2 class="text-lg font-medium mb-2">Register (demo)</h2>
        <form action="/auth/register" method="post" class="space-y-3">
          <div>
            <label class="block text-sm text-gray-700">Name</label>
            <input name="name" class="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm text-gray-700">Email</label>
            <input name="email" type="email" required class="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">Register</button>
          </div>
        </form>
      </div>

      <div>
        <h2 class="text-lg font-medium mb-2">Login (demo)</h2>
        <form action="/auth/login" method="post" class="space-y-3">
          <div>
            <label class="block text-sm text-gray-700">Email</label>
            <input name="email" type="email" required class="mt-1 block w-full border rounded px-3 py-2" />
          </div>
          <div>
            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded">Login</button>
          </div>
        </form>
        <p class="mt-2 text-xs text-gray-500">Note: This demo checks registration only (no passwords/hashing) to teach middleware.</p>
      </div>
    </div>
  </main>
</body>
</html>
```

---

### `views/list.ejs`
```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Submissions</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen flex items-start justify-center py-10">
  <main class="bg-white rounded-lg shadow-md w-full max-w-2xl p-6">
    <h1 class="text-2xl font-semibold mb-4">Submissions</h1>
    <ul class="divide-y divide-gray-200">
      <% submissions.forEach(function(s){ %>
        <li class="py-3 flex justify-between items-center">
          <div>
            <div class="font-medium"><%= s.name || '—' %></div>
            <div class="text-sm text-gray-500"><%= s.email %></div>
          </div>
          <div>
            <a href="/submissions/profile/<%= s._id %>?email=<%= encodeURIComponent(s.email) %>" class="text-indigo-600 hover:underline text-sm">View</a>
          </div>
        </li>
      <% }) %>
    </ul>
    <div class="mt-4"><a href="/" class="text-sm text-gray-600 hover:underline">Back</a></div>
  </main>
</body>
</html>
```

---

### `views/auth.ejs`
```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Auth</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
  <div class="bg-white rounded-lg shadow-md p-6 w-full max-w-sm text-center">
    <h1 class="text-xl font-semibold mb-4">Status</h1>
    <p class="text-gray-800"> <%= message %> </p>
    <div class="mt-4">
      <a href="/" class="text-indigo-600 hover:underline">Back to Home</a>
    </div>
  </div>
</body>
</html>
```

---

### `views/result.ejs`
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Result</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen flex items-start justify-center py-10">
  <main class="bg-white rounded-lg shadow-md w-full max-w-md p-6">
    <h1 class="text-2xl font-semibold mb-4">Form Received</h1>

    <dl class="space-y-2">
      <div>
        <dt class="text-sm font-medium text-gray-500">Name</dt>
        <dd class="text-gray-900"><%= name %></dd>
      </div>
      <div>
        <dt class="text-sm font-medium text-gray-500">Email</dt>
        <dd class="text-gray-900"><%= email %></dd>
      </div>
      <div>
        <dt class="text-sm font-medium text-gray-500">Message</dt>
        <dd class="text-gray-900 whitespace-pre-wrap"><%= message %></dd>
      </div>
    </dl>

    <div class="mt-4">
      <a href="/submissions/profile/<%= id %>" class="text-indigo-600 hover:underline text-sm">View profile</a>
    </div>

    <div class="mt-4">
      <a href="/" class="text-sm text-gray-600 hover:underline">Back</a>
    </div>
  </main>
</body>
</html>
```

---

### `views/profile.ejs`
```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Profile</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen flex items-start justify-center py-10">
  <main class="bg-white rounded-lg shadow-md w-full max-w-md p-6">
    <h1 class="text-2xl font-semibold mb-4">Profile</h1>

    <dl class="divide-y divide-gray-200">
      <div class="py-3">
        <dt class="text-sm font-medium text-gray-500">Name</dt>
        <dd class="mt-1 text-lg text-gray-900"><%= submission.name %></dd>
      </div>

      <div class="py-3">
        <dt class="text-sm font-medium text-gray-500">Email</dt>
        <dd class="mt-1 text-gray-900"><%= submission.email %></dd>
      </div>

      <div class="py-3">
        <dt class="text-sm font-medium text-gray-500">Message</dt>
        <dd class="mt-1 text-gray-900 whitespace-pre-wrap"><%= submission.message %></dd>
      </div>

      <div class="py-3">
        <dt class="text-sm font-medium text-gray-500">Submitted</dt>
        <dd class="mt-1 text-gray-900 text-sm"><%= submission.createdAt ? new Date(submission.createdAt).toLocaleString() : '' %></dd>
      </div>
    </dl>

    <div class="mt-6">
      <a href="/" class="inline-block text-sm text-indigo-600 hover:underline">Back</a>
    </div>
  </main>
</body>
</html>
```

---

If you want any of these files broken out into separate example snippets or comments explaining each line, tell me which file to annotate and I will add short comments or a walkthrough for it. 🔧