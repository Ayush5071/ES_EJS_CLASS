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