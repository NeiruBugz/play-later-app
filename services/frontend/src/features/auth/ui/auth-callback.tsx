import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAuth } from '../hooks/use-auth'
import logger from '@/lib/logger'
import { CognitoError } from '../lib/cognito'
import { Button } from '@/components/ui/button'

export function AuthCallback() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const search = useSearch({ from: '/auth/callback' })
  const processedRef = useRef(false)
  const timerStartedRef = useRef(false)
  const [authError, setAuthError] = useState<{
    message: string
    details?: string
  } | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const error = search.error
    ? { error: search.error, error_description: search.error_description }
    : undefined
  const { code } = search

  useEffect(() => {
    // Only log this once
    if (!processedRef.current) {
      logger.debug('Auth callback search params', {
        hasCode: !!code,
        codeLength: code?.length ?? 0,
        hasError: !!error,
        errorDescription: error?.error_description,
        allParams: { ...search },
      })
    }
  }, [code, error, search])

  const handleCallback = useCallback(async () => {
    // Prevent multiple executions of the callback handler
    if (processedRef.current) {
      logger.debug('Auth callback already processed, skipping')
      return
    }

    if (!code) {
      const errorMsg = 'Auth callback error: No code found in URL'
      logger.error(errorMsg, {
        searchParams: { ...search },
      })
      setAuthError({
        message: 'Authentication Failed',
        details: 'No authorization code was provided. Please try again.',
      })
      return
    }

    // Set processed flag immediately to prevent concurrent executions
    processedRef.current = true

    logger.debug('Auth code received, proceeding with login', {
      codePresent: !!code,
      codeLength: code?.length,
      codeStart: code?.substring(0, 6) + '...',
    })

    try {
      // Only start the timer once
      if (!timerStartedRef.current) {
        logger.time('auth-callback-process')
        timerStartedRef.current = true
      }

      setIsRetrying(false)
      await login(code)
      logger.info('Auth login successful, redirecting to home')
      navigate({ to: decodeURIComponent('/'), replace: true })

      // Only end the timer if we started it
      if (timerStartedRef.current) {
        logger.timeEnd('auth-callback-process')
      }
    } catch (error: any) {
      // Display detailed error information to help debugging
      logger.group('Auth Callback Error')

      let errorMessage = 'Authentication failed'
      let errorDetails =
        'An unexpected error occurred during authentication. Please try again.'

      if (error instanceof CognitoError) {
        logger.error('Auth callback failed with Cognito error', {
          message: error.message,
          status: error.status,
          responseBody: error.responseBody,
        })

        errorMessage = 'Authentication Failed'

        // Provide more user-friendly error details based on status code
        const status = error.status || 0
        if (status === 400) {
          errorDetails =
            'Invalid request. The authentication code may have expired.'
        } else if (status === 401) {
          errorDetails =
            'Unauthorized. Please check your credentials and try again.'
        } else if (status === 403) {
          errorDetails =
            'Access denied. You may not have permission to access this application.'
        } else if (status >= 500) {
          errorDetails = 'A server error occurred. Please try again later.'
        } else {
          errorDetails =
            error.message || 'An error occurred during authentication'
        }
      } else {
        logger.error('Auth callback failed with unexpected error', {
          error: error?.message || 'Unknown error',
          name: error?.name,
          stack: error?.stack,
          isCognitoError: error instanceof CognitoError,
        })

        errorMessage = 'Authentication Error'
        errorDetails =
          error?.message || 'An unexpected error occurred. Please try again.'
      }

      // Log specific error properties that might be present
      if (error && typeof error === 'object') {
        try {
          const errorProps = Object.getOwnPropertyNames(error).reduce(
            (acc, prop) => {
              if (prop !== 'stack') {
                // Stack is already logged above
                acc[prop] = (error as any)[prop]
              }
              return acc
            },
            {} as Record<string, any>,
          )

          logger.debug('Error properties:', errorProps)
        } catch (e) {
          logger.debug('Could not extract error properties', { parseError: e })
        }
      }

      logger.groupEnd()

      // Set the error state for display to the user
      setAuthError({ message: errorMessage, details: errorDetails })

      // End timer if there was an error
      if (timerStartedRef.current) {
        logger.timeEnd('auth-callback-process')
      }
    }
  }, [login, navigate, code, search])

  const handleRetry = () => {
    logger.info('User attempting to retry authentication')
    // Reset the processed flag so we can try again
    processedRef.current = false
    timerStartedRef.current = false
    setIsRetrying(true)

    // Retry the authentication
    handleCallback()
  }

  const handleGoHome = () => {
    logger.info('User chose to return to home page')
    navigate({ to: '/', replace: true })
  }

  useEffect(() => {
    logger.debug('Auth callback component mounted')
    // Only run this effect once
    if (!processedRef.current) {
      handleCallback()
    }
  }, [handleCallback])

  // If there's an error in the URL parameters
  if (error) {
    logger.error('Auth callback received error params', error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
            Authentication Error
          </h3>
          <p className="mb-2 text-gray-700 dark:text-gray-300">
            Error: {error.error}
          </p>
          {error.error_description && (
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Description: {error.error_description}
            </p>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={handleGoHome}>
              Go to Home
            </Button>
            <Button onClick={handleRetry}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  // If there's an error during login process
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
            {authError.message}
          </h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            {authError.details}
          </p>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={handleGoHome}>
              Go to Home
            </Button>
            <Button onClick={handleRetry} disabled={isRetrying}>
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white mx-auto mb-4" />
        <p className="text-gray-700 dark:text-gray-300">
          Authenticating, please wait...
        </p>
      </div>
    </div>
  )
}
