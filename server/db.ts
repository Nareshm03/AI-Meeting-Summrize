// Load environment variables
import { readFileSync } from 'fs';
import { join } from 'path';

// Simple .env loader
try {
  const envFile = readFileSync(join(process.cwd(), '.env'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !value.startsWith('#')) {
        process.env[key.trim()] = value;
      }
    }
  });
} catch (error) {
  console.log('No .env file found or error reading it');
}

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required. Please configure your database connection.",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });