import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(5174),
  CORS_ORIGIN: z.string().optional()
});

const env = envSchema.parse({
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN
});

const allowedOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:5173'];

export { env, allowedOrigins };
