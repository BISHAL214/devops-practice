import 'dotenv/config';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (process.env.NODE_ENV === 'development') {
  neonConfig.fetchEndpoint = "http://neon-local:5432/sql";
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DB_URL);

const db = drizzle(sql, { logger: true });

export { db, sql };
