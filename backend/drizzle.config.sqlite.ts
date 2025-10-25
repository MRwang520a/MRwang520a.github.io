import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.sqlite.ts',
  out: './drizzle-sqlite',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/ai_platform.db',
  },
} satisfies Config;

