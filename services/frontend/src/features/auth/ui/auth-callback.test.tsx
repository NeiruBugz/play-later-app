import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AuthCallback } from './auth-callback'
import { useAuth } from '../hooks/use-auth'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CognitoError } from '../lib/cognito'

vi.mock('../hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
  useSearch: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    time: vi.fn(),
    timeEnd: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
  },
}))

describe('AuthCallback', () => {
  const mockLogin = vi.fn()
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // @ts-expect-error - mocked function
    useAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      token: null,
      userInfo: null,
      isLoading: false,
      error: null,
    })

    // @ts-expect-error - mocked function
    useNavigate.mockReturnValue(mockNavigate)
    // @ts-expect-error - mocked function
    useSearch.mockReturnValue({})
  })

  it('should handle successful authentication', async () => {
    // @ts-expect-error - mocked function
    useSearch.mockReturnValue({ code: 'test-auth-code' })
    mockLogin.mockResolvedValueOnce(undefined)

    render(<AuthCallback />)

    expect(mockLogin).toHaveBeenCalledWith('test-auth-code')

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/',
        replace: true,
      })
    })
  })

  it('should display error when no code is provided', async () => {
    // @ts-expect-error - mocked function
    useSearch.mockReturnValue({})

    render(<AuthCallback />)

    await waitFor(() => {
      expect(screen.getByText('Authentication Failed')).toBeInTheDocument()
      expect(
        screen.getByText(/No authorization code was provided/),
      ).toBeInTheDocument()
    })

    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should handle authentication error', async () => {
    // @ts-expect-error - mocked function
    useSearch.mockReturnValue({ code: 'test-auth-code' })
    const cognitoError = new Error('Authentication failed') as CognitoError
    cognitoError.name = 'CognitoError'
    cognitoError.status = 400
    mockLogin.mockRejectedValueOnce(cognitoError)

    render(<AuthCallback />)

    await waitFor(() => {
      expect(screen.getByText('Authentication Error')).toBeInTheDocument()
      expect(screen.getByText('Authentication failed')).toBeInTheDocument()
    })

    expect(mockLogin).toHaveBeenCalledWith('test-auth-code')

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should handle retry attempt', async () => {
    // @ts-expect-error - mocked function
    useSearch.mockReturnValue({ code: 'test-auth-code' })
    const cognitoError = new Error('Authentication failed') as CognitoError
    cognitoError.name = 'CognitoError'
    mockLogin.mockRejectedValueOnce(cognitoError)

    render(<AuthCallback />)

    await waitFor(() => {
      expect(screen.getByText('Authentication Error')).toBeInTheDocument()
    })

    mockLogin.mockClear()
    mockLogin.mockResolvedValueOnce(undefined)

    const user = userEvent.setup()

    const retryButton = screen.getByText(/Try Again/i)
    await user.click(retryButton)

    expect(mockLogin).toHaveBeenCalledWith('test-auth-code')

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/',
        replace: true,
      })
    })
  })

  it('should handle URL error parameters', () => {
    // @ts-expect-error - mocked function
    useSearch.mockReturnValue({
      error: 'invalid_request',
      error_description: 'Invalid request parameter',
    })

    render(<AuthCallback />)

    expect(screen.getByText('Authentication Error')).toBeInTheDocument()
    expect(screen.getByText(/Error: invalid_request/)).toBeInTheDocument()
    expect(
      screen.getByText(/Description: Invalid request parameter/),
    ).toBeInTheDocument()

    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should navigate home when Go Home button is clicked', async () => {
    // @ts-expect-error - mocked function
    useSearch.mockReturnValue({})

    render(<AuthCallback />)

    const user = userEvent.setup()

    const goHomeButton = screen.getByText(/Go to Home/i)
    await user.click(goHomeButton)

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/',
      replace: true,
    })
  })
})
