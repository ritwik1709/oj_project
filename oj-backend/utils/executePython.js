import fs from "fs/promises";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { EnhancedStorageService } from '../services/enhanced-storage-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get storage service instance from app.locals
let storageService;
export const setStorageService = (service) => {
  storageService = service;
};

export const executePython = async (code, input) => {
  if (!storageService) {
    throw new Error('Storage service not initialized');
  }

  console.log('Python Execution - Starting');
  console.log('Code:', code);
  console.log('Input:', input);

  // Create job directory using enhanced storage service
  const { jobId, jobDir } = await storageService.createJobDirectory();
  console.log('Job Directory:', jobDir);

  const codePath = path.join(jobDir, "code.py");
  const inputPath = path.join(jobDir, "input.txt");

  try {
    // Write code and input to files
    await fs.writeFile(codePath, code);
    await fs.writeFile(inputPath, input || '');
    console.log('Files written successfully');

    // Verify file contents
    const writtenCode = await fs.readFile(codePath, 'utf8');
    const writtenInput = await fs.readFile(inputPath, 'utf8');
    console.log('Written code:', writtenCode);
    console.log('Written input:', writtenInput);

    return new Promise((resolve, reject) => {
      // Create absolute paths for Docker volume mounting
      const absoluteJobDir = path.resolve(jobDir);
      console.log('Absolute job directory:', absoluteJobDir);
      
      // Use python3 with -u flag for unbuffered output and proper error handling
      const command = `docker run --rm -v "${absoluteJobDir}:/app" python-runner bash -c "cd /app && python3 -u code.py < input.txt 2>&1"`;

      console.log('Executing command:', command);

      exec(command, { 
        maxBuffer: 1024 * 500,
        timeout: 5000 // 5 second timeout
      }, async (err, stdout, stderr) => {
        console.log('Execution completed');
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
        console.log('error:', err);

        try {
          if (err) {
            // Check if it's a timeout error
            if (err.killed) {
              console.log('Timeout error detected');
              return reject({ error: "Time Limit Exceeded" });
            }
            // Return the error message from stderr if available
            const errorMessage = stderr || err.message;
            console.log('Error message:', errorMessage);
            return reject({ error: errorMessage });
          }

          // Update job access time
          await storageService.updateJobAccess(jobId);

          // Return the stdout directly
          console.log('Execution successful, output:', stdout);
          resolve(stdout);
        } catch (error) {
          console.error('Error in execution handler:', error);
          reject({ error: "Failed to execute code: " + error.message });
        } finally {
          // Clean up using enhanced storage service
          console.log('Cleaning up job:', jobId);
          await storageService.cleanupJob(jobId);
        }
      });
    });
  } catch (error) {
    console.error('Error in Python execution:', error);
    // Ensure cleanup on error
    await storageService.cleanupJob(jobId);
    throw { error: "Failed to execute Python code: " + error.message };
  }
};
