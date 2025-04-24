import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import logger from '@/lib/logger'

export const Route = createFileRoute('/auth-error')({
  component: AuthErrorPage,
})

function AuthErrorPage() {
  const navigate = useNavigate()
  const [errorReason, setErrorReason] = useState<string>(
    'Unknown authentication error',
  )

  useEffect(() => {
    // Get error reason from URL parameter
    const searchParams = new URLSearchParams(window.location.search)
    const reason = searchParams.get('reason')

    if (reason) {
      setErrorReason(reason)
      logger.error('Auth error page loaded', { reason })
    }
  }, [])

  const handleRetry = () => {
    logger.info('User attempting to retry authentication')
    navigate({ to: '/' })
  }

  const handleContactSupport = () => {
    logger.info('User clicked contact support')
    // In a real app, you might open a support chat or redirect to a contact page
    window.open('mailto:support@example.com', '_blank')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Authentication Error
          </h1>
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {errorReason}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            There was a problem with the authentication system. This might be
            due to a configuration issue or a temporary service outage.
          </p>

          <div className="flex flex-col space-y-3">
            <Button onClick={handleRetry} className="w-full">
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={handleContactSupport}
              className="w-full"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
