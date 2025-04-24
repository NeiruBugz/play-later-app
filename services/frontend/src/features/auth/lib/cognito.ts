import { AUTH_COGNITO_ENDPOINTS } from '../constants'

type CognitoTokenResponse = {
  access_token: string
  id_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

type CognitoUserInfo = {
  email_verified: boolean
  phone_number?: string
  phone_number_verified?: boolean
  email?: string
  family_name?: string
  given_name?: string
  username?: string
}

class CognitoError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = 'CognitoError'
  }
}

async function exchangeCodeForToken(
  code: string,
): Promise<CognitoTokenResponse> {
  const url = new URL(AUTH_COGNITO_ENDPOINTS.TOKEN_ENDPOINT)
  url.searchParams.set('grant_type', 'authorization_code')
  url.searchParams.set('code', code)
  url.searchParams.set('redirect_uri', import.meta.env.VITE_AUTH_REDIRECT_URI)
  url.searchParams.set('client_id', import.meta.env.VITE_AUTH_CLIENT_ID)
  url.searchParams.set('scope', import.meta.env.VITE_AUTH_SCOPES.split(','))

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    throw new CognitoError(
      `Failed to exchange code for token: ${response.statusText}`,
      response.status,
    )
  }

  const data = await response.json()

  if (!data.access_token || !data.id_token || !data.refresh_token) {
    throw new CognitoError('Invalid token response: missing required fields')
  }

  return data as CognitoTokenResponse
}

async function getUserInfo(token: string): Promise<CognitoUserInfo> {
  const url = new URL(AUTH_COGNITO_ENDPOINTS.USERINFO_ENDPOINT)
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new CognitoError(
      `Failed to get user info: ${response.statusText}`,
      response.status,
    )
  }

  const data = await response.json()
  return data as CognitoUserInfo
}

export {
  getUserInfo,
  exchangeCodeForToken,
  type CognitoTokenResponse,
  type CognitoUserInfo,
  CognitoError,
}
