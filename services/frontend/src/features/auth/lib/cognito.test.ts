import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exchangeCodeForToken, getUserInfo, CognitoError } from './cognito'

vi.mock('@/lib/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

vi.mock('../../../lib/env', () => {
  return {
    env: {
      VITE_COGNITO_CLIENT_ID: 'test-client-id',
      VITE_COGNITO_REDIRECT_URI: 'http://localhost:3000',
      VITE_COGNITO_SCOPES: 'openid,email,profile',
    },
  }
})

describe('Cognito Utilities', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.resetAllMocks()
    global.fetch = originalFetch
  })

  describe('exchangeCodeForToken', () => {
    it('should exchange auth code for tokens', async () => {
      const mockTokenResponse = {
        access_token: 'test-access-token',
        id_token: 'test-id-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockTokenResponse),
        headers: new Headers(),
      })

      const result = await exchangeCodeForToken('test-auth-code')

      expect(result).toEqual(mockTokenResponse)

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should throw CognitoError when the response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () =>
          JSON.stringify({
            error: 'invalid_grant',
            error_description: 'Invalid authorization code',
          }),
        headers: new Headers(),
      })

      try {
        await exchangeCodeForToken('invalid-code')

        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(CognitoError)
        expect(error.message).toMatch(/Failed to exchange code for token/)
      }
    })

    it('should throw CognitoError when the response is missing required fields', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            access_token: 'test-access-token',
          }),
        headers: new Headers(),
      })

      try {
        await exchangeCodeForToken('test-code')

        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(CognitoError)
        expect(error.message).toMatch(
          /Invalid token response: missing required fields/,
        )
      }
    })
  })

  describe('getUserInfo', () => {
    it('should fetch user info with valid token', async () => {
      const mockUserInfo = {
        email: 'test@example.com',
        username: 'testuser',
        email_verified: true,
        given_name: 'Test',
        family_name: 'User',
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockUserInfo),
        headers: new Headers(),
      })

      const token = 'valid-access-token'
      const result = await getUserInfo(token)

      expect(result).toEqual(mockUserInfo)

      expect(global.fetch).toHaveBeenCalledTimes(1)

      const [url, options] = (global.fetch as any).mock.calls[0]
      expect(options.headers.Authorization).toBe(`Bearer ${token}`)
    })

    it('should throw CognitoError when the user info response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () =>
          JSON.stringify({
            error: 'invalid_token',
            error_description: 'The access token is invalid',
          }),
        headers: new Headers(),
      })

      try {
        await getUserInfo('invalid-token')

        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(CognitoError)
        expect(error.message).toMatch(/Failed to get user info/)
      }
    })

    it('should throw CognitoError when the user info response is empty', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '',
        headers: new Headers(),
      })

      try {
        await getUserInfo('valid-token')

        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(CognitoError)
        expect(error.message).toMatch(/User info returned empty response/)
      }
    })
  })

  describe('CognitoError', () => {
    it('should create error with correct properties', () => {
      const message = 'Test error'
      const status = 400
      const responseBody = { error: 'test_error' }

      const error = new CognitoError(message, status, responseBody)

      expect(error.message).toBe(message)
      expect(error.name).toBe('CognitoError')
      expect(error.status).toBe(status)
      expect(error.responseBody).toBe(responseBody)
    })
  })
})
