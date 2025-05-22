import fs from "fs/promises";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const executePython = async (code, input) => {
  const jobId = uuid();
  const jobDir = path.join(__dirname, "..", "temp", jobId);

  await fs.mkdir(jobDir, { recursive: true });

  const codePath = path.join(jobDir, "code.py");
  const inputPath = path.join(jobDir, "input.txt");
  const outputPath = path.join(jobDir, "output.txt");

  await fs.writeFile(codePath, code);
  await fs.writeFile(inputPath, input);

  return new Promise((resolve, reject) => {
    // Create absolute paths for Docker volume mounting
    const absoluteJobDir = path.resolve(jobDir);
    
    const command = `docker run --rm -v "${absoluteJobDir}:/app" python-runner bash -c "echo '${input}' > /app/input.txt && python3 /app/code.py < /app/input.txt > /app/output.txt && cat /app/output.txt"`;

    exec(command, { maxBuffer: 1024 * 500 }, async (err, stdout, stderr) => {
      try {
        if (err) {
          return reject({ error: stderr || "Execution error" });
        }

        // Read the output file directly
        const output = await fs.readFile(outputPath, 'utf8');
        resolve(output);
      } catch (error) {
        reject({ error: "Failed to read output" });
      } finally {
        // Clean up: Remove the temporary directory
        fs.rm(jobDir, { recursive: true, force: true });
      }
    });
  });
};
