import express from 'express';
import { executeCpp, setStorageService as setCppStorageService } from '../utils/executeCpp.js';
import { executePython, setStorageService as setPythonStorageService } from '../utils/executePython.js';
import { executeJava, setStorageService as setJavaStorageService } from '../utils/executeJava.js';

const router = express.Router();

// Maximum code length (in characters)
const MAX_CODE_LENGTH = 10000;
const MAX_INPUT_LENGTH = 1000;

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

router.post('/compile', async (req, res) => {
  const { code, input, language } = req.body;

  // Input validation
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required and must be a string' });
  }

  if (code.length > MAX_CODE_LENGTH) {
    return res.status(400).json({ error: `Code length exceeds maximum limit of ${MAX_CODE_LENGTH} characters` });
  }

  if (input && input.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({ error: `Input length exceeds maximum limit of ${MAX_INPUT_LENGTH} characters` });
  }

  if (!['cpp', 'python', 'java'].includes(language)) {
    return res.status(400).json({ error: 'Invalid programming language. Supported languages: cpp, python, java' });
  }

  try {
    let output;
    switch (language) {
      case 'cpp':
        output = await executeCpp(code, input);
        break;
      case 'python':
        output = await executePython(code, input);
        break;
      case 'java':
        output = await executeJava(code, input);
        break;
    }
    res.json({ output });
  } catch (error) {
    console.error('Compilation error:', error);
    res.status(500).json({ error: error.error || error.message });
  }
});

export default router; 