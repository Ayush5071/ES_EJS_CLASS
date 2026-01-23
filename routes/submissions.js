import express from 'express';
import { submit, profile, list } from '../controllers/submissionController.js';
import { requireRegistered } from '../helpers/auth.js';
const router = express.Router();

router.post('/submit', submit);
router.get('/profile/:id', requireRegistered, profile);
router.get('/list', list);

export default router;