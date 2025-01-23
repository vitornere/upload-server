import { fastifyCors } from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { uploadImageRoute } from './routes/upload-image'
import { transformSwaggerSchema } from './transform-swagger-schema'

const server = fastify()

server.setSerializerCompiler(serializerCompiler)
server.setValidatorCompiler(validatorCompiler)

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.code(400).send({
      message: 'Validation error.',
      errors: error.validation,
    })
  }

  console.error(error)

  return reply.code(500).send({
    message: 'Internal server error.',
  })
})

server.register(fastifyCors, {
  origin: '*',
})
server.register(fastifyMultipart)
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Upload Image API',
      version: '1.0.0',
    },
  },
  transform: transformSwaggerSchema,
})

server.register(uploadImageRoute)

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})
server
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('Server is running on port 3333')
  })
