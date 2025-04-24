export const AUTH_COGNITO_ENDPOINTS = {
  AUTH_ENDPOINT: `${import.meta.env.VITE_AUTH_URL}/oauth2/authorize`,
  TOKEN_ENDPOINT: `${import.meta.env.VITE_AUTH_URL}/oauth2/token`,
  USERINFO_ENDPOINT: `${import.meta.env.VITE_AUTH_URL}/oauth2/userInfo`,
  LOGOUT_ENDPOINT: `${import.meta.env.VITE_AUTH_URL}/logout`,
} as const
