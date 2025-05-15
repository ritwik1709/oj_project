import express from 'express';
const router = express.Router();
import {
  getAllProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem
} from '../controllers/problemController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

// Public
router.get('/', getAllProblems);
router.get('/:id', getProblemById);

// Admin protected
router.post('/', authMiddleware, adminMiddleware, createProblem);
router.put('/:id', authMiddleware, adminMiddleware, updateProblem);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProblem);

export default router;
