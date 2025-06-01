import express from 'express';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { EnhancedStorageService } from '../services/enhanced-storage-service.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Maximum code length (in characters)
const MAX_CODE_LENGTH = 10000;
const MAX_INPUT_LENGTH = 1000;

// Initialize storage service
router.use((req, res, next) => {
  const storageService = req.app.locals.storageService;
  if (!storageService) {
    return res.status(500).json({ error: 'Storage service not initialized' });
  }
  next();
});

const executeCode = async (code, input, language, storageService) => {
  const { jobId, jobDir } = await storageService.createJobDirectory();
  
  try {
    let codePath, outputPath, inputPath, command;
    
    switch (language) {
      case 'python':
        codePath = path.join(jobDir, "code.py");
        inputPath = path.join(jobDir, "input.txt");
        outputPath = path.join(jobDir, "output.txt");
        await fs.writeFile(codePath, code);
        await fs.writeFile(inputPath, input || '');
        command = `python3 "${codePath}" < "${inputPath}" > "${outputPath}"`;
        break;
        
      case 'cpp':
        codePath = path.join(jobDir, "code.cpp");
        inputPath = path.join(jobDir, "input.txt");
        outputPath = path.join(jobDir, "output.txt");
        const executablePath = path.join(jobDir, "code");
        await fs.writeFile(codePath, code);
        await fs.writeFile(inputPath, input || '');
        // Compile first
        await new Promise((resolve, reject) => {
          exec(`g++ -std=c++17 -O2 -o "${executablePath}" "${codePath}"`, (err, stdout, stderr) => {
            if (err) reject({ error: "Compilation Error", details: stderr });
            else resolve();
          });
        });
        command = `"${executablePath}" < "${inputPath}" > "${outputPath}"`;
        break;
        
      case 'java':
        codePath = path.join(jobDir, "Main.java");
        inputPath = path.join(jobDir, "input.txt");
        outputPath = path.join(jobDir, "output.txt");
        await fs.writeFile(codePath, code);
        await fs.writeFile(inputPath, input || '');
        // Compile first
        await new Promise((resolve, reject) => {
          exec(`javac "${codePath}"`, (err, stdout, stderr) => {
            if (err) reject({ error: "Compilation Error", details: stderr });
            else resolve();
          });
        });
        command = `cd "${jobDir}" && java Main < "${inputPath}" > "${outputPath}"`;
        break;
        
      default:
        throw new Error('Unsupported language');
    }

    // Execute the code
    await new Promise((resolve, reject) => {
      exec(command, { timeout: 5000 }, async (err, stdout, stderr) => {
        if (err) {
          if (err.killed) {
            reject({ error: "Time Limit Exceeded" });
          } else {
            reject({ error: "Runtime Error", details: stderr });
          }
        } else {
          resolve();
        }
      });
    });

    // Read the output
    const output = await fs.readFile(outputPath, 'utf8');
    return output;
  } finally {
    // Always clean up
    await storageService.cleanupJob(jobId);
  }
};

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
    const storageService = req.app.locals.storageService;
    const output = await executeCode(code, input, language, storageService);
    res.json({ output });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ 
      error: error.error || 'Unknown error occurred',
      details: error.details
    });
  }
});

export default router; 