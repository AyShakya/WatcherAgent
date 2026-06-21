import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  JWT_SECRET: z.string().default('watcher-super-secret-key-12345'),
  INTERNAL_CALLBACK_SECRET: z.string().default('orchestration-callback-key-9999'),
  ALLOWED_ORIGINS: z.string().optional(),
  ENCRYPTION_KEY: z.string().default('watcher-default-encryption-key-32-chars-long'),
});

const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Environment configuration validation failed:', parsedEnv.error.format());
  process.exit(1);
}

export const config = parsedEnv.data;
