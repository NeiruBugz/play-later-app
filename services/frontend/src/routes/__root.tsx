import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from '../components/Header'

import TanstackQueryLayout from '../integrations/tanstack-query/layout'

import type { QueryClient } from '@tanstack/react-query'

export interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  userInfo: any | null
  login: (code: string) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export type AuthCallbackSearchParams = {
  code?: string
  error?: string
  error_description?: string
}

interface MyRouterContext {
  queryClient: QueryClient
  auth: AuthContextType
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Header />

      <Outlet />
      <TanStackRouterDevtools />

      <TanstackQueryLayout />
    </>
  ),
})
