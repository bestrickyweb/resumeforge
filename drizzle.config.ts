import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Use the unpooled connection for migrations: Neon's pooler can hang or reject
// schema-affecting statements, whereas the direct (unpooled) connection is reliable.
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || ''

export default defineConfig({
  out: './lib/db/migrations',
  schema: './lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url,
  },
})
