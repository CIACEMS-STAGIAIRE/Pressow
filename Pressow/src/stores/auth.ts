import { defineStore } from 'pinia'
import api, { setupApiInterceptors } from '@/services/api'
import type {
  AuthUser,
  LoginResponse,
  PendingTokenResponse,
  RegisterClientPayload,
  RegisterProviderPayload,
} from '@/types/types'

interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  pendingToken: string | null
  authReady: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    user: null,
    pendingToken: null,
    authReady: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken),
  },
  actions: {
    ensureInterceptors() {
      setupApiInterceptors(
        () => this.accessToken,
        () => this.refreshAccessToken(),
        () => this.clearSession()
      )
    },
    setAccessToken(token: string | null) {
      this.accessToken = token
    },
    setUser(user: AuthUser | null) {
      this.user = user
    },
    setPendingToken(token: string | null) {
      this.pendingToken = token
    },
    clearSession() {
      this.accessToken = null
      this.user = null
      this.pendingToken = null
    },
    async initAuth() {
      if (this.authReady) {
        return
      }
      this.ensureInterceptors()
      const timeoutMs = 1500
      let timeoutId: ReturnType<typeof setTimeout> | undefined
      const timeoutPromise = new Promise<void>((resolve) => {
        timeoutId = setTimeout(resolve, timeoutMs)
      })

      try {
        await Promise.race([
          this.refreshAccessToken().then(() => undefined).catch(() => undefined),
          timeoutPromise,
        ])
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        this.authReady = true
      }
    },
    async login(identifier: string, password: string) {
      this.ensureInterceptors()
      const { data } = await api.post<LoginResponse>('/auth/login/', {
        identifier,
        password,
      })
      this.setAccessToken(data.access)
      this.setUser(data.user)
      return data
    },
    async registerProvider(payload: RegisterProviderPayload) {
      this.ensureInterceptors()
      const { data } = await api.post<PendingTokenResponse>('/auth/register/provider/', payload)
      this.setPendingToken(data.pending_token || null)
      return data
    },
    async registerClient(payload: RegisterClientPayload) {
      this.ensureInterceptors()
      const { data } = await api.post<PendingTokenResponse>('/auth/register/client/', payload)
      this.setPendingToken(data.pending_token || null)
      return data
    },
    async requestOtp() {
      this.ensureInterceptors()
      if (!this.pendingToken) {
        throw new Error('Aucun token d’inscription en cours.')
      }
      const { data } = await api.post<PendingTokenResponse>('/auth/otp/request/', {
        pending_token: this.pendingToken,
      })
      if (data.pending_token) {
        this.setPendingToken(data.pending_token)
      }
      return data
    },
    async verifyOtp(code: string, otpId?: string) {
      this.ensureInterceptors()
      if (!this.pendingToken) {
        throw new Error('Aucun token d’inscription en cours.')
      }
      const { data } = await api.post<LoginResponse>('/auth/otp/verify/', {
        pending_token: this.pendingToken,
        code,
        otp_id: otpId || '',
      })
      this.setAccessToken(data.access)
      this.setUser(data.user)
      this.setPendingToken(null)
      return data
    },
    async refreshAccessToken() {
      this.ensureInterceptors()
      const { data } = await api.post<{ access: string }>('/auth/refresh/')
      this.setAccessToken(data.access)
      return data.access
    },
    async logout() {
      this.ensureInterceptors()
      try {
        await api.post('/auth/logout/')
      } finally {
        this.clearSession()
      }
    },
    async fetchProfile() {
      this.ensureInterceptors()
      const { data } = await api.get<AuthUser>('/auth/profile/')
      this.setUser(data)
      return data
    },
  },
})
