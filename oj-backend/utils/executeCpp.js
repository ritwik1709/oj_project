// oj-backend/utils/executeCpp.js
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

export const executeCpp = async (code, input) => {
  if (!storageService) {
    throw new Error('Storage service not initialized');
  }

  // Create job directory using enhanced storage service
  const { jobId, jobDir } = await storageService.createJobDirectory();

  const codePath = path.join(jobDir, "code.cpp");
  const inputPath = path.join(jobDir, "input.txt");
  const outputPath = path.join(jobDir, "output.txt");

  try {
    await fs.writeFile(codePath, code);
    await fs.writeFile(inputPath, input);

    // Copy run.sh to the job directory
    const runScriptPath = path.join(__dirname, '../judge/cpp-runner/run.sh');
    const jobRunScriptPath = path.join(jobDir, 'run.sh');
    await fs.copyFile(runScriptPath, jobRunScriptPath);
    await fs.chmod(jobRunScriptPath, '755'); // Make it executable

    return new Promise((resolve, reject) => {
      // Create absolute paths for Docker volume mounting
      const absoluteJobDir = path.resolve(jobDir);
      
      // Set CODE environment variable and run the script
      const command = `docker run --rm -v "${absoluteJobDir}:/app" -e CODE="${code.replace(/"/g, '\\"')}" cpp-runner bash /app/run.sh`;

      console.log('Executing command:', command);

      exec(command, { maxBuffer: 1024 * 500 }, async (err, stdout, stderr) => {
        try {
          if (err) {
            console.error('Execution error:', err);
            console.error('stderr:', stderr);
            return reject({ error: stderr || "Execution error" });
          }

          // Update job access time
          await storageService.updateJobAccess(jobId);

          // Read the output file
          const output = await fs.readFile(outputPath, 'utf8');
          console.log('Execution successful, output:', output);
          resolve(output);
        } catch (error) {
          console.error('Error reading output:', error);
          reject({ error: "Failed to read output" });
        } finally {
          // Clean up using enhanced storage service
          await storageService.cleanupJob(jobId);
        }
      });
    });
  } catch (error) {
    console.error('Error in C++ execution:', error);
    // Ensure cleanup on error
    await storageService.cleanupJob(jobId);
    throw error;
  }
};
