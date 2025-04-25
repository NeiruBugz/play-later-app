import { z } from 'zod'
import logger from './lib/logger'

const requiredString = z.string().min(1)

type Environment = {
  VITE_AUTH_DOMAIN: string
  VITE_AUTH_CLIENT_ID: string
  VITE_AUTH_REDIRECT_URI: string
  VITE_API_URI: string
}

const envSchema = z.object({
  VITE_AUTH_DOMAIN: requiredString,
  VITE_AUTH_CLIENT_ID: requiredString,
  VITE_AUTH_REDIRECT_URI: requiredString,
  VITE_API_URI: requiredString,
})

const env: Environment = {
  VITE_AUTH_DOMAIN: import.meta.env.VITE_AUTH_DOMAIN,
  VITE_AUTH_CLIENT_ID: import.meta.env.VITE_AUTH_CLIENT_ID,
  VITE_AUTH_REDIRECT_URI: import.meta.env.VITE_AUTH_REDIRECT_URI,
  VITE_API_URI: import.meta.env.VITE_API_URI,
}

function validateEnv(): Environment {
  try {
    return envSchema.parse(env)
  } catch (error) {
    logger.error('Invalid environment variables:', error)
    throw new Error('Invalid environment configuration')
  }
}

export default validateEnv()
