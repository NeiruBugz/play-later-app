import { StrictMode } from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import * as TanstackQuery from './integrations/tanstack-query/root-provider'
import logger from './lib/logger'

import { routeTree } from './routeTree.gen'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'
import { AuthProvider } from '@/features/auth/context/auth-context.tsx'
import { useAuth } from '@/features/auth/hooks/use-auth.ts'

// Log application startup - will only show in development
logger.info('Application starting...')

const router = createRouter({
  routeTree,
  context: {
    ...TanstackQuery.getContext(),
    auth: undefined!,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const auth = useAuth()
  logger.debug('Auth context:', auth)
  return <RouterProvider router={router} context={{ auth }} />
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <AuthProvider>
      <TanstackQuery.Provider>
        <InnerApp />
      </TanstackQuery.Provider>
    </AuthProvider>
  </StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

logger.info('Application rendered successfully')
