import { describe, it, expect } from 'vitest'
import { useAuthStore } from './auth-store'
import type { CognitoUserInfo } from './cognito'

describe('useAuthStore', () => {
  
  

  it('should initialize with default values', () => {
    const state = useAuthStore.getState()

    expect(state.isAuthenticated).toBe(false)
    expect(state.token).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.userInfo).toBeNull()
  })

  it('should set tokens correctly', () => {
    const token = 'test-token'
    const refreshToken = 'test-refresh-token'

    useAuthStore.getState().setTokens(token, refreshToken)

    const state = useAuthStore.getState()
    expect(state.token).toBe(token)
    expect(state.refreshToken).toBe(refreshToken)
  })

  it('should set user info correctly', () => {
    const userInfo: CognitoUserInfo = {
      email: 'test@example.com',
      username: 'testuser',
      email_verified: true,
    }

    useAuthStore.getState().setUserInfo(userInfo)

    const state = useAuthStore.getState()
    expect(state.userInfo).toEqual(userInfo)
  })

  it('should clear all auth data on logout', () => {
    
    const state = useAuthStore.getState()
    state.setTokens('test-token', 'test-refresh-token')
    state.setUserInfo({
      email: 'test@example.com',
      username: 'testuser',
      email_verified: true,
    })

    
    useAuthStore.getState().logout()

    
    const newState = useAuthStore.getState()
    expect(newState.isAuthenticated).toBe(false)
    expect(newState.token).toBeNull()
    expect(newState.refreshToken).toBeNull()
    expect(newState.userInfo).toBeNull()
  })
})
