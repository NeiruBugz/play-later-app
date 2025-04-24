import type { AuthCallbackSearchParams } from '@/features/auth/types'
import { AuthCallback } from '@/features/auth/ui/auth-callback'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
  validateSearch: (
    search: Record<string, unknown>,
  ): AuthCallbackSearchParams => {
    return {
      ...search,
      error: search.error ? search.error.toString() : undefined,
      error_description: search.error_description
        ? search.error_description.toString()
        : undefined,
      code: search.code ? search.code.toString() : undefined,
    }
  },
})
