import { execSync } from 'node:child_process'
import { Client } from 'pg'
import { env } from '@/env'

export async function setup() {
  // Obtem URL do banco de testes
  const testDbUrl = env.TEST_DATABASE_URL
  if (!testDbUrl) throw 'Could not get test database URL'
  env.DATABASE_URL = testDbUrl

  // Executa container com banco de testes
  execSync('docker compose -f docker-compose.test.yml up -d', {
    stdio: 'inherit',
  })

  await waitForPostgres(testDbUrl || '')

  // Executa migrations para o DB de teste
  execSync(
    `DATABASE_URL="${testDbUrl}" GOOGLE_GENERATIVE_AI_API_KEY="test" pnpm drizzle-kit migrate`,
    {
      stdio: 'inherit',
    },
  )
}

// Verifica se o postgres conecta
async function waitForPostgres(url: string, maxRetries = 30): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    const client = new Client({ connectionString: url })
    try {
      await client.connect()
      await client.end()
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  throw new Error('Postgres did not become ready in time')
}
