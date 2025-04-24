import { AUTH_COGNITO_ENDPOINTS } from '@/features/auth/constants'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    const {
      VITE_COGNITO_CLIENT_ID: clientId,
      VITE_COGNITO_REDIRECT_URI: redirectUri,
      VITE_COGNITO_SCOPES: scopes,
    } = import.meta.env

    if (!context.auth.isAuthenticated) {
      const authParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scopes: scopes.split(','),
        response_type: 'code',
      })

      throw (window.location.href = `${AUTH_COGNITO_ENDPOINTS.AUTH_ENDPOINT}?${authParams.toString()}`)
    }
  },
  component: () => <Outlet />,
})
