import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

type AccessTokenGetter = () => string | null
type RefreshHandler = () => Promise<string>
type LogoutHandler = () => void

let interceptorsReady = false
let refreshPromise: Promise<string | null> | null = null

export const setupApiInterceptors = (
  getAccessToken: AccessTokenGetter,
  refreshAccessToken: RefreshHandler,
  handleLogout: LogoutHandler
) => {
  // Idempotent : évite de réinstaller les interceptors.
  if (interceptorsReady) {
    return
  }
  interceptorsReady = true

  api.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) {
      const headers = (config.headers as Record<string, string> | undefined) ?? {}
      headers.Authorization = `Bearer ${token}`
      config.headers = headers as any
    }
    return config
  })

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined
      if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error)
      }

      const requestUrl = String(originalRequest.url || '')
      if (requestUrl.includes('/auth/refresh/')) {
        handleLogout()
        return Promise.reject(error)
      }

      originalRequest._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken()
            .then((token) => token)
            .finally(() => {
              refreshPromise = null
            })
        }

        const newToken = await refreshPromise
        if (newToken) {
          const retryHeaders = (originalRequest.headers as Record<string, string> | undefined) ?? {}
          retryHeaders.Authorization = `Bearer ${newToken}`
          originalRequest.headers = retryHeaders as any
          return api(originalRequest)
        }
      } catch (refreshError) {
        handleLogout()
        return Promise.reject(refreshError)
      }

      return Promise.reject(error)
    }
  )
}

export default api
