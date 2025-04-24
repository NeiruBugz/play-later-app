import { describe, it, expect, vi } from 'vitest'
import { useAuth } from './use-auth'
import { AuthContext } from '../context/auth-context'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { AuthContextType } from '../types'

describe('useAuth', () => {
  const mockAuthContext: AuthContextType = {
    isAuthenticated: true,
    token: 'mock-token',
    userInfo: {
      email: 'test@example.com',
      username: 'testuser',
      email_verified: true,
    },
    login: vi.fn(),
    isLoading: false,
    error: null,
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  )

  it('should return the auth context when used within AuthProvider', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toEqual(mockAuthContext)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('mock-token')
    expect(result.current.userInfo?.email).toBe('test@example.com')
  })

  it('should throw an error when used outside of AuthProvider', () => {
    
    const originalConsoleError = console.error
    console.error = vi.fn()

    try {
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')
    } finally {
      
      console.error = originalConsoleError
    }
  })
})
