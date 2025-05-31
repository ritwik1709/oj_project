import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { executeCpp, setStorageService as setCppStorageService } from '../utils/executeCpp.js';
import { executePython, setStorageService as setPythonStorageService } from '../utils/executePython.js';
import { executeJava, setStorageService as setJavaStorageService } from '../utils/executeJava.js';

const router = express.Router();

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Maximum code length (in characters)
const MAX_CODE_LENGTH = 10000;
const MAX_INPUT_LENGTH = 1000;

// Maximum execution time (in milliseconds)
const MAX_EXECUTION_TIME = 5000;

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

  const fileId = uuidv4();
  
  try {
    let fileName, compileCommand, runCommand;
    
    switch (language) {
      case 'cpp':
        fileName = `${fileId}.cpp`;
        compileCommand = `g++ ${path.join(tempDir, fileName)} -o ${path.join(tempDir, fileId)}`;
        runCommand = `${path.join(tempDir, fileId)}`;
        break;
      case 'python':
        fileName = `${fileId}.py`;
        compileCommand = null;
        runCommand = `python ${path.join(tempDir, fileName)}`;
        break;
      case 'java':
        fileName = `${fileId}.java`;
        compileCommand = `javac ${path.join(tempDir, fileName)}`;
        runCommand = `java -cp ${tempDir} ${fileId}`;
        break;
    }

    // Write code to file
    fs.writeFileSync(path.join(tempDir, fileName), code);

    // Compile if needed
    if (compileCommand) {
      try {
        await new Promise((resolve, reject) => {
          exec(compileCommand, (error, stdout, stderr) => {
            if (error) {
              reject(new Error(`Compilation Error: ${stderr || error.message}`));
            } else {
              resolve();
            }
          });
        });
      } catch (error) {
        throw new Error(`Compilation failed: ${error.message}`);
      }
    }

    // Run the program with timeout
    const output = await new Promise((resolve, reject) => {
      const process = exec(runCommand, {
        timeout: MAX_EXECUTION_TIME
      }, (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            reject(new Error('Execution timed out'));
          } else {
            reject(new Error(`Runtime Error: ${stderr || error.message}`));
          }
        } else {
          resolve(stdout);
        }
      });

      // Write input to stdin if provided
      if (input) {
        process.stdin.write(input);
        process.stdin.end();
      }
    });

    // Cleanup
    const filesToDelete = [
      path.join(tempDir, fileName),
      path.join(tempDir, fileId),
      path.join(tempDir, `${fileId}.class`)
    ];

    filesToDelete.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    res.json({ output });
  } catch (error) {
    // Cleanup on error
    const filesToDelete = [
      path.join(tempDir, `${fileId}.cpp`),
      path.join(tempDir, `${fileId}.py`),
      path.join(tempDir, `${fileId}.java`),
      path.join(tempDir, fileId),
      path.join(tempDir, `${fileId}.class`)
    ];

    filesToDelete.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    res.status(500).json({ error: error.message });
  }
});

export default router; 