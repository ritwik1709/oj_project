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

  console.log('C++ Execution - Starting');
  console.log('Code length:', code.length);
  console.log('Input:', input);

  // Create job directory using enhanced storage service
  const { jobId, jobDir } = await storageService.createJobDirectory();
  console.log('Job Directory:', jobDir);

  const codePath = path.join(jobDir, "code.cpp");
  const inputPath = path.join(jobDir, "input.txt");
  const outputPath = path.join(jobDir, "output.txt");
  const executablePath = path.join(jobDir, "code");

  try {
    // Write code and input to files
    await fs.writeFile(codePath, code);
    await fs.writeFile(inputPath, input || '');
    console.log('Files written successfully');

    return new Promise((resolve, reject) => {
      // Compile the code
      exec(`g++ -std=c++17 -O2 -o "${executablePath}" "${codePath}"`, async (compileErr, compileStdout, compileStderr) => {
        if (compileErr) {
          console.error('Compilation error:', compileErr);
          console.error('Compilation stderr:', compileStderr);
          await storageService.cleanupJob(jobId);
          return reject({ 
            error: "Compilation Error",
            details: {
              stderr: compileStderr,
              error: compileErr.message
            }
          });
        }

        // Run the compiled program
        exec(`"${executablePath}" < "${inputPath}" > "${outputPath}"`, { 
          timeout: 5000 // 5 second timeout
        }, async (runErr, runStdout, runStderr) => {
          try {
            if (runErr) {
              if (runErr.killed) {
                console.log('Timeout error detected');
                await storageService.cleanupJob(jobId);
                return reject({ 
                  error: "Time Limit Exceeded",
                  details: { stdout: runStdout, stderr: runStderr }
                });
              }
              console.error('Runtime error:', runErr);
              console.error('Runtime stderr:', runStderr);
              await storageService.cleanupJob(jobId);
              return reject({ 
                error: "Runtime Error",
                details: {
                  stderr: runStderr,
                  error: runErr.message
                }
              });
            }

            // Read the output file
            const output = await fs.readFile(outputPath, 'utf8');
            console.log('Execution successful, output:', output);
            resolve(output);
          } catch (error) {
            console.error('Error in execution handler:', error);
            await storageService.cleanupJob(jobId);
            reject({ 
              error: "Failed to execute code: " + error.message,
              details: {
                stdout: runStdout,
                stderr: runStderr,
                error: error.message
              }
            });
          } finally {
            // Clean up using enhanced storage service
            console.log('Cleaning up job:', jobId);
            await storageService.cleanupJob(jobId);
          }
        });
      });
    });
  } catch (error) {
    console.error('Error in C++ execution:', error);
    // Ensure cleanup on error
    await storageService.cleanupJob(jobId);
    throw { 
      error: "Failed to execute C++ code: " + (error.error || error.message),
      details: error.details || { error: error.message }
    };
  }
};
