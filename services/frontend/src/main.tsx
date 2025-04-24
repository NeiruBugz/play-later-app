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

reportWebVitals()

logger.info('Application rendered successfully')
