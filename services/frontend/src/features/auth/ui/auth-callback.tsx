import { useCallback, useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAuth } from '../hooks/use-auth'

export function AuthCallback() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const search = useSearch({ from: '/auth/callback' })
  const error = search.error
    ? { error: search.error, error_description: search.error_description }
    : undefined
  const { code } = search

  const handleCallback = useCallback(async () => {
    if (!code) {
      console.error('No code found in URL')
      return
    }

    try {
      await login(code)
      navigate({ to: decodeURIComponent('/'), replace: true })
    } catch (error) {
      console.error('Failed to log in:', error)
    }
  }, [login, navigate, code])

  useEffect(() => {
    handleCallback()
  }, [handleCallback])

  if (error) {
    return <div>Error</div>
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white" />
      </div>
    </>
  )
}
