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

export const executeJava = async (code, input) => {
  if (!storageService) {
    throw new Error('Storage service not initialized');
  }

  // Create job directory using enhanced storage service
  const { jobId, jobDir } = await storageService.createJobDirectory();

  const codePath = path.join(jobDir, "Main.java");
  const inputPath = path.join(jobDir, "input.txt");
  const outputPath = path.join(jobDir, "output.txt");

  try {
    await fs.writeFile(codePath, code);
    await fs.writeFile(inputPath, input);

    return new Promise((resolve, reject) => {
      // Create absolute paths for Docker volume mounting
      const absoluteJobDir = path.resolve(jobDir);
      
      const command = `docker run --rm -v "${absoluteJobDir}:/app" java-runner bash -c "cd /app && javac Main.java && echo '${input}' > input.txt && java Main < input.txt > output.txt && cat output.txt"`;

      exec(command, { maxBuffer: 1024 * 500 }, async (err, stdout, stderr) => {
        try {
          if (err) {
            return reject({ error: stderr || "Execution error" });
          }

          // Update job access time
          await storageService.updateJobAccess(jobId);

          // Read the output file directly
          const output = await fs.readFile(outputPath, 'utf8');
          resolve(output);
        } catch (error) {
          reject({ error: "Failed to read output" });
        } finally {
          // Clean up using enhanced storage service
          await storageService.cleanupJob(jobId);
        }
      });
    });
  } catch (error) {
    // Ensure cleanup on error
    await storageService.cleanupJob(jobId);
    throw error;
  }
};
