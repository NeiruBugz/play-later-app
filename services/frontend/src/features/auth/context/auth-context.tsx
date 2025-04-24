import {
  createContext,
  type ReactNode,
  useCallback,
  useState,
  useRef,
} from 'react'
import type { AuthContextType } from '../types'
import { getUserInfo, exchangeCodeForToken, CognitoError } from '../lib/cognito'
import { useAuthStore } from '../lib/auth-store'
import logger from '@/lib/logger'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { token, userInfo, setTokens, setUserInfo } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const isAuthenticated = !!token
  // Track if authentication is in progress to prevent concurrent calls
  const authInProgressRef = useRef(false)
  // Track if timer has been started to prevent duplicate timers
  const timerStartedRef = useRef(false)

  const login = useCallback(
    async (code: string) => {
      // Prevent concurrent authentication attempts
      if (authInProgressRef.current) {
        logger.warn(
          'Authentication already in progress, skipping duplicate request',
        )
        return
      }

      authInProgressRef.current = true
      logger.info('Authentication process started')
      logger.debug('Processing login with auth code', {
        codeLength: code.length,
        codeStart: code.substring(0, 6) + '...',
      })
      setIsLoading(true)
      setError(null)

      try {
        // Only start the timer if it hasn't been started
        if (!timerStartedRef.current) {
          logger.time('auth-flow')
          timerStartedRef.current = true
        }

        logger.group('Authentication Flow')

        // Log environment info to help with debugging
        logger.debug('Auth environment', {
          authUrl: import.meta.env.VITE_AUTH_URL,
          clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
          redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
        })

        logger.debug('Exchanging code for tokens')
        const tokens = await exchangeCodeForToken(code)

        logger.debug('Token exchange successful, tokens received', {
          hasAccessToken: !!tokens.access_token,
          hasIdToken: !!tokens.id_token,
          hasRefreshToken: !!tokens.refresh_token,
          expiresIn: tokens.expires_in,
        })

        logger.debug('Fetching user info')
        const userInfo = await getUserInfo(tokens.access_token)

        logger.debug('Storing authentication data')
        setTokens(tokens.id_token, tokens.refresh_token)
        setUserInfo(userInfo)

        logger.info('User authenticated successfully', {
          email: userInfo.email,
          username: userInfo.username,
        })
        setError(null)
        logger.groupEnd()

        // Only end the timer if we started it
        if (timerStartedRef.current) {
          logger.timeEnd('auth-flow')
          timerStartedRef.current = false
        }
      } catch (err) {
        logger.group('Authentication Error Details')

        let errorToSet: Error

        if (err instanceof CognitoError) {
          errorToSet = err
          logger.error('Cognito authentication error', {
            name: err.name,
            message: err.message,
            status: err.status,
            responseBody: err.responseBody,
          })
        } else {
          errorToSet = new Error('Authentication failed')

          // Log the original error with as much detail as possible
          logger.error('Non-Cognito authentication error', {
            originalError: err,
            name: err instanceof Error ? err.name : typeof err,
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          })
        }

        logger.groupEnd()

        // End the timer if there was an error
        if (timerStartedRef.current) {
          logger.timeEnd('auth-flow')
          timerStartedRef.current = false
        }

        setError(errorToSet)
        throw errorToSet
      } finally {
        setIsLoading(false)
        // Reset the auth in progress flag regardless of success or failure
        authInProgressRef.current = false
        logger.debug('Authentication process completed', {
          success: error === null,
          hasError: !!error,
          errorMessage: error?.message,
        })
      }
    },
    [setTokens, setUserInfo, error],
  )

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        login,
        userInfo,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
