import { z } from 'zod'
import type { CognitoUserInfo } from '../lib/cognito'

export interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  userInfo: CognitoUserInfo | null
  login: (code: string) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export type AuthCallbackSearchParams = {
  code?: string
  error?: string
  error_description?: string
}

export const tokenPayloadSchema = z.object({
  sub: z.string(),
  email: z.string(),
  employee: z.object({
    id: z.number(),
    employeeNumber: z.number(),
    email: z.string(),
    name: z.string(),
    hireDate: z.string(),
    terminationDate: z.string().nullable(),
    role: z.string(),
    photoUrl: z.string(),
    department: z.string(),
    reportingToId: z.number(),
    peopleBusinessPartnerId: z.number(),
    level: z.string(),
    division: z.string(),
    practice: z.string(),
    active: z.boolean(),
    reporters: z.array(z.number()),
  }),
  role: z.enum(['employee', 'manager']),
  subordinateIds: z.array(z.number()),
  iat: z.number(),
  exp: z.number(),
})

export type TokenPayload = z.infer<typeof tokenPayloadSchema>
