import { defineStore } from 'pinia'
import api, { setupApiInterceptors } from '@/services/api'
import type {
  AuthUser,
  LoginResponse,
  PendingTokenResponse,
  RegisterClientPayload,
  RegisterProviderPayload,
} from '@/types/types'

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITAIRES JWT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Décode un JWT et retourne le payload
 */
function decodeJwt(token: string): { exp?: number; iat?: number; user_id?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64Payload = parts[1]
    if (!base64Payload) return null
    const payload = JSON.parse(atob(base64Payload))
    return payload
  } catch {
    return null
  }
}

/**
 * Retourne le timestamp d'expiration du token (en secondes)
 */
function getTokenExpiration(token: string): number | null {
  const payload = decodeJwt(token)
  return payload?.exp ?? null
}

/**
 * Vérifie si le token expire dans les X secondes à venir
 */
function tokenExpiresIn(token: string, seconds: number): boolean {
  const exp = getTokenExpiration(token)
  if (!exp) return true // Token invalide, considéré comme expiré
  const now = Math.floor(Date.now() / 1000)
  return exp - now <= seconds
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

// Rafraîchir le token 2 minutes avant son expiration
const REFRESH_BEFORE_EXPIRY_SECONDS = 120

// Vérifier le token toutes les 30 secondes
const TOKEN_CHECK_INTERVAL_MS = 30_000

// Callback global pour les notifications de session
type SessionCallback = (event: 'expired' | 'refreshed' | 'logout') => void
let sessionCallback: SessionCallback | null = null

export function setSessionCallback(callback: SessionCallback | null) {
  sessionCallback = callback
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════════

interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  pendingToken: string | null
  authReady: boolean
  isRefreshing: boolean
  lastRefreshAttempt: number
}

// Timer global pour le refresh proactif
let refreshTimer: ReturnType<typeof setInterval> | null = null

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    user: null,
    pendingToken: null,
    authReady: false,
    isRefreshing: false,
    lastRefreshAttempt: 0,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken),
    
    /**
     * Retourne le temps restant avant expiration du token (en secondes)
     */
    tokenTimeRemaining: (state): number | null => {
      if (!state.accessToken) return null
      const exp = getTokenExpiration(state.accessToken)
      if (!exp) return null
      const now = Math.floor(Date.now() / 1000)
      return Math.max(0, exp - now)
    },
    
    /**
     * Vérifie si le token doit être rafraîchi
     */
    shouldRefreshToken: (state): boolean => {
      if (!state.accessToken) return false
      return tokenExpiresIn(state.accessToken, REFRESH_BEFORE_EXPIRY_SECONDS)
    },
  },

  actions: {
    ensureInterceptors() {
      setupApiInterceptors(
        () => this.accessToken,
        () => this.refreshAccessToken(),
        () => this.handleSessionExpired()
      )
    },

    setAccessToken(token: string | null) {
      this.accessToken = token
      if (token) {
        this.startRefreshTimer()
      } else {
        this.stopRefreshTimer()
      }
    },

    setUser(user: AuthUser | null) {
      this.user = user
    },

    setPendingToken(token: string | null) {
      this.pendingToken = token
    },

    /**
     * Gère l'expiration de session (refresh token expiré)
     */
    handleSessionExpired() {
      console.warn('[Auth] Session expirée - déconnexion')
      this.clearSession()
      sessionCallback?.('expired')
    },

    /**
     * Nettoie la session
     */
    clearSession() {
      this.stopRefreshTimer()
      this.accessToken = null
      this.user = null
      this.pendingToken = null
      this.isRefreshing = false
    },

    /**
     * Démarre le timer de refresh proactif
     */
    startRefreshTimer() {
      this.stopRefreshTimer()
      
      refreshTimer = setInterval(() => {
        this.checkAndRefreshToken()
      }, TOKEN_CHECK_INTERVAL_MS)
      
      // Vérifier immédiatement
      this.checkAndRefreshToken()
    },

    /**
     * Arrête le timer de refresh
     */
    stopRefreshTimer() {
      if (refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = null
      }
    },

    /**
     * Vérifie si le token doit être rafraîchi et le fait si nécessaire
     */
    async checkAndRefreshToken() {
      if (!this.accessToken || this.isRefreshing) return
      
      // Éviter les refresh trop fréquents (minimum 10 secondes entre chaque tentative)
      const now = Date.now()
      if (now - this.lastRefreshAttempt < 10_000) return
      
      if (this.shouldRefreshToken) {
        console.log('[Auth] Token proche de l\'expiration, refresh proactif...')
        await this.refreshAccessToken().catch(() => {
          // Le refresh a échoué, l'intercepteur 401 ou handleSessionExpired gèrera
        })
      }
    },

    /**
     * Initialise l'authentification au démarrage de l'app
     */
    async initAuth() {
      if (this.authReady) {
        return
      }
      this.ensureInterceptors()
      
      const timeoutMs = 2000
      let timeoutId: ReturnType<typeof setTimeout> | undefined
      const timeoutPromise = new Promise<void>((resolve) => {
        timeoutId = setTimeout(resolve, timeoutMs)
      })

      try {
        await Promise.race([
          this.refreshAccessToken()
            .then(() => {
              console.log('[Auth] Session restaurée avec succès')
            })
            .catch(() => {
              // Si le refresh échoue (401, etc.), nettoyer la session silencieusement
              this.clearSession()
            }),
          timeoutPromise,
        ])
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        this.authReady = true
      }
    },

    /**
     * Connexion utilisateur
     */
    async login(identifier: string, password: string) {
      this.ensureInterceptors()
      const { data } = await api.post<LoginResponse>('/auth/login/', {
        identifier,
        password,
      })
      this.setAccessToken(data.access)
      this.setUser(data.user)
      this.authReady = true
      sessionCallback?.('refreshed')
      return data
    },

    /**
     * Inscription prestataire
     */
    async registerProvider(payload: RegisterProviderPayload) {
      this.ensureInterceptors()
      const { data } = await api.post<PendingTokenResponse>('/auth/register/provider/', payload)
      this.setPendingToken(data.pending_token || null)
      return data
    },

    /**
     * Inscription client
     */
    async registerClient(payload: RegisterClientPayload) {
      this.ensureInterceptors()
      const { data } = await api.post<PendingTokenResponse>('/auth/register/client/', payload)
      this.setPendingToken(data.pending_token || null)
      return data
    },

    /**
     * Demande OTP
     */
    async requestOtp() {
      this.ensureInterceptors()
      if (!this.pendingToken) {
        throw new Error('Aucun token d\'inscription en cours.')
      }
      const { data } = await api.post<PendingTokenResponse>('/auth/otp/request/', {
        pending_token: this.pendingToken,
      })
      if (data.pending_token) {
        this.setPendingToken(data.pending_token)
      }
      return data
    },

    /**
     * Vérification OTP
     */
    async verifyOtp(code: string, otpId?: string) {
      this.ensureInterceptors()
      if (!this.pendingToken) {
        throw new Error('Aucun token d\'inscription en cours.')
      }
      const { data } = await api.post<LoginResponse>('/auth/otp/verify/', {
        pending_token: this.pendingToken,
        code,
        otp_id: otpId || '',
      })
      this.setAccessToken(data.access)
      this.setUser(data.user)
      this.setPendingToken(null)
      this.authReady = true
      sessionCallback?.('refreshed')
      return data
    },

    /**
     * Rafraîchit le token d'accès
     */
    async refreshAccessToken() {
      // Éviter les refresh concurrents
      if (this.isRefreshing) {
        // Attendre que le refresh en cours se termine
        return new Promise<string>((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if (!this.isRefreshing) {
              clearInterval(checkInterval)
              if (this.accessToken) {
                resolve(this.accessToken)
              } else {
                reject(new Error('Refresh failed'))
              }
            }
          }, 100)
          // Timeout après 10 secondes
          setTimeout(() => {
            clearInterval(checkInterval)
            reject(new Error('Refresh timeout'))
          }, 10_000)
        })
      }

      this.isRefreshing = true
      this.lastRefreshAttempt = Date.now()
      
      try {
        this.ensureInterceptors()
        const { data } = await api.post<{ access: string }>('/auth/refresh/')
        this.accessToken = data.access
        this.startRefreshTimer() // Redémarrer le timer avec le nouveau token
        sessionCallback?.('refreshed')
        console.log('[Auth] Token rafraîchi avec succès')
        return data.access
      } catch (error) {
        console.error('[Auth] Échec du refresh token:', error)
        throw error
      } finally {
        this.isRefreshing = false
      }
    },

    /**
     * Déconnexion
     */
    async logout() {
      this.ensureInterceptors()
      try {
        await api.post('/auth/logout/')
      } finally {
        this.clearSession()
        sessionCallback?.('logout')
      }
    },

    /**
     * Récupère le profil utilisateur
     */
    async fetchProfile() {
      this.ensureInterceptors()
      const { data } = await api.get<AuthUser>('/auth/profile/')
      this.setUser(data)
      return data
    },
  },
})
