import type { CognitoUserInfo } from './cognito'
import { create, type StateCreator } from 'zustand'

type AuthStoreState = {
  isAuthenticated: boolean
  token: string | null
  refreshToken: string | null
  userInfo: CognitoUserInfo | null
}

type AuthStoreActions = {
  setTokens: (token: string | null, refreshToken: string | null) => void
  setUserInfo: (userInfo: CognitoUserInfo | null) => void
  logout: () => void
}

const authStoreCreator: StateCreator<AuthStoreState & AuthStoreActions> = (
  set,
) => ({
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  userInfo: null,
  setTokens: (token, refreshToken) => set({ token, refreshToken }),
  setUserInfo: (userInfo) => set({ userInfo }),
  logout: () =>
    set({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      userInfo: null,
    }),
})

export const useAuthStore = create<AuthStoreState & AuthStoreActions>(
  authStoreCreator,
)
