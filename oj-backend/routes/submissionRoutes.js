import express from 'express';
const router = express.Router();

import {
  submitCode,
  getUserSubmissions,
} from '../controllers/submissionController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

router.post('/submit', authMiddleware, submitCode); // run or submit
router.get('/my-submissions', authMiddleware, getUserSubmissions);

export default router;
