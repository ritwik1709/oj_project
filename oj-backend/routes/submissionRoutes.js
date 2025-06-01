import express from 'express';
const router = express.Router();

import {
  submitCode,
  getUserSubmissions,
} from '../controllers/submissionController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { executeCpp, setStorageService as setCppStorageService } from '../utils/executeCpp.js';
import { executePython, setStorageService as setPythonStorageService } from '../utils/executePython.js';
import { executeJava, setStorageService as setJavaStorageService } from '../utils/executeJava.js';

// Initialize storage service for execution utilities
router.use((req, res, next) => {
  const storageService = req.app.locals.storageService;
  if (!storageService) {
    return res.status(500).json({ error: 'Storage service not initialized' });
  }
  
  // Set storage service for all execution utilities
  setCppStorageService(storageService);
  setPythonStorageService(storageService);
  setJavaStorageService(storageService);
  
  next();
});

router.post('/submit', authMiddleware, submitCode); // run or submit
router.get('/my-submissions', authMiddleware, getUserSubmissions);

export default router;
