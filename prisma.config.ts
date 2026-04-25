import { existsSync } from 'node:fs'
import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

const root = process.cwd()
const envPath = (name: string) => path.join(root, name)
if (existsSync(envPath('.env'))) {
  loadEnv({ path: envPath('.env') })
}
if (existsSync(envPath('.env.local'))) {
  loadEnv({ path: envPath('.env.local'), override: true })
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
})