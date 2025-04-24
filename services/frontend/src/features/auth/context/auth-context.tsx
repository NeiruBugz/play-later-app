import { createContext, type ReactNode, useCallback, useState } from 'react'
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

  const login = useCallback(
    async (code: string) => {
      logger.info('Authentication process started')
      logger.debug('Processing login with auth code', {
        codeLength: code.length,
        codeStart: code.substring(0, 6) + '...',
      })
      setIsLoading(true)
      setError(null)

      try {
        logger.time('auth-flow')
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
        logger.timeEnd('auth-flow')
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

        setError(errorToSet)
        throw errorToSet
      } finally {
        setIsLoading(false)
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
