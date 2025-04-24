import { AUTH_COGNITO_ENDPOINTS } from '../constants'
import logger from '@/lib/logger'

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
    public responseBody?: any,
  ) {
    super(message)
    this.name = 'CognitoError'
    logger.error(`CognitoError: ${message}`, { status, responseBody })
  }
}

async function exchangeCodeForToken(
  code: string,
): Promise<CognitoTokenResponse> {
  logger.debug('Exchanging auth code for token')

  try {
    const url = new URL(AUTH_COGNITO_ENDPOINTS.TOKEN_ENDPOINT)
    url.searchParams.set('grant_type', 'authorization_code')
    url.searchParams.set('code', code)
    url.searchParams.set(
      'redirect_uri',
      import.meta.env.VITE_COGNITO_REDIRECT_URI,
    )
    url.searchParams.set('client_id', import.meta.env.VITE_COGNITO_CLIENT_ID)
    url.searchParams.set(
      'scope',
      import.meta.env.VITE_COGNITO_SCOPES.split(','),
    )

    logger.debug('Token request details:', {
      endpoint: url.toString(),
      clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
      scope: import.meta.env.VITE_COGNITO_SCOPES,
    })

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const responseBody = await response.text()
    let parsedBody

    try {
      parsedBody = responseBody ? JSON.parse(responseBody) : null
    } catch (e) {
      logger.warn('Failed to parse response as JSON', { responseBody })
    }

    if (!response.ok) {
      logger.error('Token exchange failed', {
        status: response.status,
        statusText: response.statusText,
        responseBody: parsedBody || responseBody,
        headers: Object.fromEntries([...response.headers.entries()]),
      })
      throw new CognitoError(
        `Failed to exchange code for token: ${response.statusText}`,
        response.status,
        parsedBody || responseBody,
      )
    }

    if (!parsedBody) {
      logger.error('Token exchange returned empty response')
      throw new CognitoError('Token exchange returned empty response')
    }

    if (
      !parsedBody.access_token ||
      !parsedBody.id_token ||
      !parsedBody.refresh_token
    ) {
      logger.error('Invalid token response', {
        responseBody: parsedBody,
        hasAccessToken: !!parsedBody.access_token,
        hasIdToken: !!parsedBody.id_token,
        hasRefreshToken: !!parsedBody.refresh_token,
      })
      throw new CognitoError(
        'Invalid token response: missing required fields',
        response.status,
        parsedBody,
      )
    }

    logger.info('Token exchange successful')
    logger.debug('Received tokens', {
      expiresIn: parsedBody.expires_in,
      tokenType: parsedBody.token_type,
    })

    return parsedBody as CognitoTokenResponse
  } catch (error) {
    if (error instanceof CognitoError) {
      throw error
    }

    logger.error('Unexpected error during token exchange', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    throw new CognitoError(
      `Unexpected error during token exchange: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

async function getUserInfo(token: string): Promise<CognitoUserInfo> {
  logger.debug('Fetching user info from Cognito')

  try {
    const url = new URL(AUTH_COGNITO_ENDPOINTS.USERINFO_ENDPOINT)
    logger.debug('User info request', { endpoint: url.toString() })

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const responseBody = await response.text()
    let parsedBody

    try {
      parsedBody = responseBody ? JSON.parse(responseBody) : null
    } catch (e) {
      logger.warn('Failed to parse user info response as JSON', {
        responseBody,
      })
    }

    if (!response.ok) {
      logger.error('Failed to get user info', {
        status: response.status,
        statusText: response.statusText,
        responseBody: parsedBody || responseBody,
        headers: Object.fromEntries([...response.headers.entries()]),
      })
      throw new CognitoError(
        `Failed to get user info: ${response.statusText}`,
        response.status,
        parsedBody || responseBody,
      )
    }

    if (!parsedBody) {
      logger.error('User info returned empty response')
      throw new CognitoError('User info returned empty response')
    }

    logger.info('User info fetched successfully')
    logger.debug('User info', {
      email: parsedBody.email,
      emailVerified: parsedBody.email_verified,
      username: parsedBody.username,
    })

    return parsedBody as CognitoUserInfo
  } catch (error) {
    if (error instanceof CognitoError) {
      throw error
    }

    logger.error('Unexpected error fetching user info', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    throw new CognitoError(
      `Unexpected error fetching user info: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export {
  getUserInfo,
  exchangeCodeForToken,
  type CognitoTokenResponse,
  type CognitoUserInfo,
  CognitoError,
}
