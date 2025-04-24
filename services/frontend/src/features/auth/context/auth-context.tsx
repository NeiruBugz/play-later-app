import { createContext, type ReactNode, useCallback, useState } from 'react'
import type { AuthContextType } from '../types'
import { getUserInfo, exchangeCodeForToken, CognitoError } from '../lib/cognito'
import { useAuthStore } from '../lib/auth-store'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { token, userInfo, setTokens, setUserInfo } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const isAuthenticated = !!token

  const login = useCallback(
    async (code: string) => {
      console.log('login', code)
      setIsLoading(true)
      setError(null)

      try {
        const tokens = await exchangeCodeForToken(code)
        console.log('tokens', tokens)
        const userInfo = await getUserInfo(tokens.access_token)
        console.log('userInfo', userInfo)
        setTokens(tokens.id_token, tokens.refresh_token)
        setUserInfo(userInfo)
        setError(null)
      } catch (err) {
        const error =
          err instanceof CognitoError ? err : new Error('Authentication failed')
        console.error(error)
        setError(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [setTokens, setUserInfo],
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
