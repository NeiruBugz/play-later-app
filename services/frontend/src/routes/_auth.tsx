import { AUTH_COGNITO_ENDPOINTS } from '@/features/auth/constants'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import logger from '@/lib/logger'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    try {
      const {
        VITE_COGNITO_CLIENT_ID: clientId,
        VITE_COGNITO_REDIRECT_URI: redirectUri,
        VITE_COGNITO_SCOPES: scopes,
      } = import.meta.env

      // Validate required environment variables
      if (!clientId) {
        throw new Error('Missing VITE_COGNITO_CLIENT_ID environment variable')
      }
      if (!redirectUri) {
        throw new Error(
          'Missing VITE_COGNITO_REDIRECT_URI environment variable',
        )
      }
      if (!scopes) {
        throw new Error('Missing VITE_COGNITO_SCOPES environment variable')
      }

      if (!context.auth.isAuthenticated) {
        logger.info('User not authenticated, redirecting to login')

        try {
          const authParams = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
          })

          // Add scopes if available
          if (scopes) {
            authParams.set('scope', scopes.split(',').join(' '))
          }

          const authUrl = `${AUTH_COGNITO_ENDPOINTS.AUTH_ENDPOINT}?${authParams.toString()}`
          logger.debug('Redirecting to auth URL', { authUrl })

          throw (window.location.href = authUrl)
        } catch (error) {
          // This catch will handle errors during URL construction, not the redirect itself
          logger.error('Failed to redirect to authentication', {
            error: error instanceof Error ? error.message : String(error),
          })
          throw new Error(
            'Authentication redirect failed. Please try again later.',
          )
        }
      }

      logger.debug('User is authenticated, continuing to protected route')
    } catch (error) {
      // Handle environment configuration errors
      if (
        error instanceof Error &&
        (error.message.includes('environment variable') ||
          error.message.includes('Authentication redirect failed'))
      ) {
        logger.error('Authentication configuration error', {
          message: error.message,
          stack: error.stack,
        })

        // Redirect to a custom error page instead of just throwing
        throw (window.location.href =
          '/auth-error?reason=' + encodeURIComponent(error.message))
      }

      // Re-throw other errors (including the redirect)
      throw error
    }
  },
  component: () => <Outlet />,
})
