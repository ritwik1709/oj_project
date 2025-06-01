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
  console.log('Docker Registry:', process.env.DOCKER_REGISTRY || 'not set');

  // Create job directory using enhanced storage service
  const { jobId, jobDir } = await storageService.createJobDirectory();
  console.log('Job Directory:', jobDir);

  const codePath = path.join(jobDir, "code.cpp");
  const inputPath = path.join(jobDir, "input.txt");
  const outputPath = path.join(jobDir, "output.txt");

  try {
    // Write code and input to files
    await fs.writeFile(codePath, code);
    await fs.writeFile(inputPath, input || '');
    console.log('Files written successfully');

    // Copy run.sh to the job directory
    const runScriptPath = path.join(__dirname, '../judge/cpp-runner/run.sh');
    const jobRunScriptPath = path.join(jobDir, 'run.sh');
    await fs.copyFile(runScriptPath, jobRunScriptPath);
    await fs.chmod(jobRunScriptPath, '755'); // Make it executable

    // First, try to pull the Docker image
    const imageName = `${process.env.DOCKER_REGISTRY || ''}cpp-runner:latest`;
    console.log('Pulling Docker image:', imageName);
    
    try {
      await new Promise((resolve, reject) => {
        exec(`docker pull ${imageName}`, (err, stdout, stderr) => {
          if (err) {
            console.error('Docker pull error:', err);
            console.error('Docker pull stderr:', stderr);
            console.error('Docker pull stdout:', stdout);
            reject(new Error(`Failed to pull Docker image: ${err.message}\nStderr: ${stderr}\nStdout: ${stdout}`));
          } else {
            console.log('Docker image pulled successfully:', stdout);
            resolve();
          }
        });
      });
    } catch (pullError) {
      console.error('Error pulling Docker image:', pullError);
      throw { 
        error: `Docker image pull failed: ${pullError.message}`,
        details: {
          image: imageName,
          registry: process.env.DOCKER_REGISTRY || 'not set',
          error: pullError.message
        }
      };
    }

    return new Promise((resolve, reject) => {
      // Create absolute paths for Docker volume mounting
      const absoluteJobDir = path.resolve(jobDir);
      console.log('Absolute job directory:', absoluteJobDir);
      
      // Use Docker Hub image
      const command = `docker run --rm -v "${absoluteJobDir}:/app" -e CODE="${code.replace(/"/g, '\\"')}" ${imageName} bash /app/run.sh`;

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
              return reject({ 
                error: "Time Limit Exceeded",
                details: { stdout, stderr }
              });
            }
            // Check if it's a Docker error
            if (err.message.includes('docker')) {
              console.error('Docker error:', err);
              return reject({ 
                error: "Docker execution failed. Please try again.",
                details: {
                  stdout,
                  stderr,
                  error: err.message
                }
              });
            }
            // Return the error message from stderr if available
            const errorMessage = stderr || err.message;
            console.log('Error message:', errorMessage);
            return reject({ 
              error: errorMessage,
              details: {
                stdout,
                stderr,
                error: err.message
              }
            });
          }

          // Update job access time
          await storageService.updateJobAccess(jobId);

          // Read the output file
          const output = await fs.readFile(outputPath, 'utf8');
          console.log('Execution successful, output:', output);
          resolve(output);
        } catch (error) {
          console.error('Error in execution handler:', error);
          reject({ 
            error: "Failed to execute code: " + error.message,
            details: {
              stdout,
              stderr,
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
