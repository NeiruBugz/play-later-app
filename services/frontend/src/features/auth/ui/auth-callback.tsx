import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAuth } from '../hooks/use-auth'
import logger from '@/lib/logger'
import { CognitoError } from '../lib/cognito'

export function AuthCallback() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const search = useSearch({ from: '/auth/callback' })
  const [processedCode, setProcessedCode] = useState(false)
  const error = search.error
    ? { error: search.error, error_description: search.error_description }
    : undefined
  const { code } = search

  useEffect(() => {
    logger.debug('Auth callback search params', {
      hasCode: !!code,
      codeLength: code?.length ?? 0,
      hasError: !!error,
      errorDescription: error?.error_description,
      allParams: { ...search },
    })
  }, [code, error, search])

  const handleCallback = useCallback(async () => {
    logger.info('Auth callback handling started')

    if (processedCode) {
      logger.debug('Code already processed, skipping')
      return
    }

    if (!code) {
      logger.error('Auth callback error: No code found in URL', {
        searchParams: { ...search },
      })
      return
    }

    logger.debug('Auth code received, proceeding with login', {
      codePresent: !!code,
      codeLength: code?.length,
      codeStart: code?.substring(0, 6) + '...',
    })

    try {
      logger.time('auth-callback-process')
      setProcessedCode(true)
      await login(code)
      logger.info('Auth login successful, redirecting to home')
      navigate({ to: decodeURIComponent('/'), replace: true })
      logger.timeEnd('auth-callback-process')
    } catch (error: any) {
      // Display detailed error information to help debugging
      logger.group('Auth Callback Error')

      if (error instanceof CognitoError) {
        logger.error('Auth callback failed with Cognito error', {
          message: error.message,
          status: error.status,
          responseBody: error.responseBody,
        })
      } else {
        logger.error('Auth callback failed with unexpected error', {
          error: error?.message || 'Unknown error',
          name: error?.name,
          stack: error?.stack,
          isCognitoError: error instanceof CognitoError,
        })
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
    }
  }, [login, navigate, code, search, processedCode])

  useEffect(() => {
    logger.debug('Auth callback component mounted')
    handleCallback()
  }, [handleCallback])

  if (error) {
    logger.error('Auth callback received error params', error)
    return (
      <div>
        <h3>Authentication Error</h3>
        <p>Error: {error.error}</p>
        {error.error_description && (
          <p>Description: {error.error_description}</p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white" />
      </div>
    </>
  )
}
