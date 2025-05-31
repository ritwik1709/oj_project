import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class EnhancedStorageService {
  constructor() {
    this.baseDir = path.join(__dirname, '..', 'temp');
    this.maxFileAge = 1 * 60 * 60 * 1000; // 1 hour in milliseconds (reduced from 24h for better cleanup)
    this.activeJobs = new Map(); // Track active jobs
  }

  async initialize() {
    try {
      // Create base temp directory if it doesn't exist
      await fs.mkdir(this.baseDir, { recursive: true });
      
      // Start periodic cleanup
      this.startPeriodicCleanup();
      console.log('Enhanced storage service initialized');
    } catch (error) {
      console.error('Error initializing enhanced storage service:', error);
    }
  }

  async createJobDirectory() {
    const jobId = uuid();
    const jobDir = path.join(this.baseDir, jobId);
    await fs.mkdir(jobDir, { recursive: true });
    
    // Track the job
    this.activeJobs.set(jobId, {
      createdAt: Date.now(),
      lastAccessed: Date.now()
    });
    
    return { jobId, jobDir };
  }

  async updateJobAccess(jobId) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.lastAccessed = Date.now();
      this.activeJobs.set(jobId, job);
    }
  }

  async cleanupJob(jobId) {
    try {
      const jobDir = path.join(this.baseDir, jobId);
      await fs.rm(jobDir, { recursive: true, force: true });
      this.activeJobs.delete(jobId);
      console.log(`Cleaned up job directory: ${jobId}`);
    } catch (error) {
      console.error(`Error cleaning up job ${jobId}:`, error);
    }
  }

  async startPeriodicCleanup() {
    // Run cleanup every 15 minutes
    setInterval(async () => {
      try {
        const now = Date.now();
        
        // Clean up based on active jobs tracking
        for (const [jobId, job] of this.activeJobs.entries()) {
          const age = now - job.lastAccessed;
          if (age > this.maxFileAge) {
            await this.cleanupJob(jobId);
          }
        }
        
        // Also check for any untracked directories
        const entries = await fs.readdir(this.baseDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && !this.activeJobs.has(entry.name)) {
            const jobDir = path.join(this.baseDir, entry.name);
            const stats = await fs.stat(jobDir);
            const age = now - stats.mtimeMs;
            
            if (age > this.maxFileAge) {
              await this.cleanupJob(entry.name);
            }
          }
        }
        
        console.log('Periodic cleanup completed');
      } catch (error) {
        console.error('Error in periodic cleanup:', error);
      }
    }, 15 * 60 * 1000); // Run every 15 minutes
  }

  async getJobStats() {
    return {
      activeJobs: this.activeJobs.size,
      totalSpace: await this.calculateTotalSpace(),
      lastCleanup: new Date().toISOString()
    };
  }

  async calculateTotalSpace() {
    try {
      let totalSize = 0;
      for (const [jobId] of this.activeJobs) {
        const jobDir = path.join(this.baseDir, jobId);
        const stats = await fs.stat(jobDir);
        totalSize += stats.size;
      }
      return totalSize;
    } catch (error) {
      console.error('Error calculating total space:', error);
      return 0;
    }
  }
} 