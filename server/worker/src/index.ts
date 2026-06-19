import { Worker } from 'bullmq';
import dotenv from 'dotenv';
// Example library import (relative to server/worker/src/):
// import { runPhase1, runPhase2 } from '../../watcherai/index.js';

dotenv.config();

console.log('🚀 Watcher Queue Worker starting...');

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

const worker = new Worker(
  'incident-queue',
  async (job) => {
    console.log(`[Worker] Processing job ${job.id} of type ${job.name}`);
    return { status: 'processed', jobId: job.id };
  },
  {
    connection: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  }
);

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});
