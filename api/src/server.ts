import { fastifyCors } from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './env'
import { listWebhooks } from './routes/list-webhooks'
import { getWebhook } from './routes/get-webhook'
import { deleteWebhook } from './routes/delete-webhook'
import { captureWebhook } from './routes/capture-webhook'
import { generateHandler } from './routes/generate-handler'

// Create Fastify instance with Zod type provider for end-to-end type safety
const app = fastify().withTypeProvider<ZodTypeProvider>()

// Set up validator compiler to validate request data against Zod schemas
app.setValidatorCompiler(validatorCompiler)
// Set up serializer compiler to serialize response data according to Zod schemas
app.setSerializerCompiler(serializerCompiler)

// Register CORS plugin to allow requests from any origin
app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // credentials: true,
})

// Register Swagger plugin to generate OpenAPI documentation
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Webhook Inspect API',
      description: 'API for capturing and inspecting webhook requests',
      version: '1.0.0',
    },
  },
  // Transform Zod schemas to JSON Schema for OpenAPI compatibility
  transform: jsonSchemaTransform,
})

// Register Scalar UI to serve interactive API documentation at /docs
app.register(ScalarApiReference, {
  routePrefix: '/docs',
})

// Register the routes
app.register(listWebhooks)
app.register(getWebhook)
app.register(deleteWebhook)
app.register(captureWebhook)
app.register(generateHandler)

// Start the HTTP server, listening on all network interfaces
app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log('HTTP Server Running on http://localhost:3333')
  console.log('Docs available at http://localhost:3333/docs')
})
