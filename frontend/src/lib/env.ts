/**
 * Environment Configuration Validation
 * Validates all environment variables at build time
 */

import { z } from 'zod';

// Define environment variable schema
const envSchema = z.object({
  // Public variables (available on client)
  NEXT_PUBLIC_ODOO_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  
  // Private variables (server-only)
  ODOO_DATABASE: z.string().min(1),
  ODOO_USERNAME: z.string().optional(),
  ODOO_PASSWORD: z.string().optional(),
  ODOO_API_KEY: z.string().min(20).optional(),
  
  // Optional services
  REDIS_URL: z.string().url().optional(),
  REDIS_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  VERCEL_URL: z.string().optional(),
});

// Validate environment variables
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return env;
  } catch (error) {
    console.error('❌ Environment variable validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid environment configuration');
  }
}

// Export validated env
export const env = validateEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
