/**
 * Service de gestion des notifications push
 * Gère l'enregistrement des tokens FCM et les préférences utilisateur
 */
import api from './api'
import {
  requestNotificationPermission,
  onForegroundMessage,
  isNotificationSupported,
  isNotificationPermissionGranted,
  getNotificationPermissionState,
  initializeFirebase,
} from '@/config/firebase'

// Types
interface FCMRegisterResponse {
  success: boolean
  message: string
  device?: {
    id: string
    type: string
    name: string
  }
}

interface FCMDevice {
  id: string
  device_type: string
  device_type_display: string
  device_name: string
  is_active: boolean
  last_used_at: string | null
  created: string
}

interface FCMDevicesResponse {
  count: number
  devices: FCMDevice[]
}

// État local
let currentToken: string | null = null
let isInitialized = false
let foregroundListenerSet = false

/**
 * Initialise les notifications push pour l'utilisateur connecté
 * Doit être appelé après la connexion
 */
export async function initializeNotifications(): Promise<boolean> {
  if (isInitialized) {
    console.log('[Notifications] Déjà initialisé')
    return true
  }

  // Vérifier le support
  if (!isNotificationSupported()) {
    console.warn('[Notifications] Non supportées par ce navigateur')
    return false
  }

  try {
    // 1. Demander la permission et obtenir le token
    const token = await requestNotificationPermission()

    if (!token) {
      console.log('[Notifications] Pas de token FCM obtenu')
      return false
    }

    currentToken = token

    // 2. Détecter le type de device
    const deviceType = detectDeviceType()
    const deviceName = getDeviceName()

    // 3. Enregistrer le token sur le serveur
    const response = await api.post<FCMRegisterResponse>('/notifications/fcm/register/', {
      token,
      device_type: deviceType,
      device_name: deviceName,
      device_info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
      },
    })

    if (response.data.success) {
      console.log('[Notifications] Token FCM enregistré avec succès')
      isInitialized = true

      // 4. Configurer le listener pour les messages au premier plan
      setupForegroundListener()

      return true
    }

    console.warn('[Notifications] Échec de l\'enregistrement:', response.data.message)
    return false
  } catch (error: any) {
    console.error('[Notifications] Erreur lors de l\'initialisation:', error?.response?.data || error)
    return false
  }
}

/**
 * Désactive les notifications pour ce device
 */
export async function disableNotifications(): Promise<boolean> {
  if (!currentToken) {
    console.warn('[Notifications] Pas de token à désactiver')
    return true
  }

  try {
    await api.post('/notifications/fcm/unregister/', { token: currentToken })
    currentToken = null
    isInitialized = false
    console.log('[Notifications] Désactivées avec succès')
    return true
  } catch (error: any) {
    console.error('[Notifications] Erreur lors de la désactivation:', error?.response?.data || error)
    return false
  }
}

/**
 * Récupère la liste des devices enregistrés
 */
export async function getRegisteredDevices(): Promise<FCMDevice[]> {
  try {
    const response = await api.get<FCMDevicesResponse>('/notifications/devices/')
    return response.data.devices
  } catch (error) {
    console.error('[Notifications] Erreur lors de la récupération des devices:', error)
    return []
  }
}

/**
 * Supprime un device spécifique
 */
export async function removeDevice(deviceId: string): Promise<boolean> {
  try {
    await api.delete(`/notifications/devices/${deviceId}/`)
    return true
  } catch (error) {
    console.error('[Notifications] Erreur lors de la suppression du device:', error)
    return false
  }
}

/**
 * Envoie une notification de test
 */
export async function sendTestNotification(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.post<{ success: boolean; message: string; details?: any }>(
      '/notifications/test/'
    )
    return response.data
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Erreur lors de l\'envoi du test'
    return { success: false, message }
  }
}

/**
 * Configure le listener pour les messages au premier plan
 */
function setupForegroundListener(): void {
  if (foregroundListenerSet) return
  foregroundListenerSet = true

  onForegroundMessage((payload) => {
    const { title, body } = payload.notification || {}

    // Afficher une notification native si l'app est visible
    if (isNotificationPermissionGranted() && title) {
      // Créer une notification native
      const notification = new Notification(title, {
        body: body || '',
        icon: '/logo_v2_r.png',
        tag: payload.data?.type || 'pressow-foreground',
      })

      // Gérer le clic sur la notification
      notification.onclick = () => {
        window.focus()
        notification.close()

        // Naviguer si une URL est spécifiée
        if (payload.data?.url) {
          window.location.href = payload.data.url
        }
      }
    }

    // Émettre un événement personnalisé pour que l'app puisse réagir
    window.dispatchEvent(
      new CustomEvent('pressow:notification', {
        detail: payload,
      })
    )
  })
}

/**
 * Écoute les notifications reçues (pour afficher des toasts, etc.)
 */
export function onNotificationReceived(
  callback: (payload: { title?: string; body?: string; data?: Record<string, string> }) => void
): () => void {
  const handler = (event: CustomEvent) => {
    const { notification, data } = event.detail
    callback({
      title: notification?.title,
      body: notification?.body,
      data,
    })
  }

  window.addEventListener('pressow:notification', handler as EventListener)

  // Retourner une fonction pour se désabonner
  return () => {
    window.removeEventListener('pressow:notification', handler as EventListener)
  }
}

/**
 * Écoute les clics sur les notifications (depuis le Service Worker)
 */
export function onNotificationClick(
  callback: (data: { url: string; data: Record<string, any> }) => void
): () => void {
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'NOTIFICATION_CLICK') {
      callback({
        url: event.data.url,
        data: event.data.data,
      })
    }
  }

  navigator.serviceWorker?.addEventListener('message', handler)

  return () => {
    navigator.serviceWorker?.removeEventListener('message', handler)
  }
}

/**
 * Détecte le type de device
 */
function detectDeviceType(): 'web' | 'android' | 'ios' {
  const ua = navigator.userAgent.toLowerCase()
  if (/android/.test(ua)) return 'android'
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  return 'web'
}

/**
 * Génère un nom descriptif pour le device
 */
function getDeviceName(): string {
  const ua = navigator.userAgent

  // Navigateur
  let browser = 'Navigateur'
  if (ua.includes('Edg/')) browser = 'Edge'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera'

  // OS
  let os = ''
  if (ua.includes('Windows NT 10')) os = 'Windows 10/11'
  else if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS X')) os = 'Mac'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  return os ? `${browser} sur ${os}` : browser
}

// Exports utilitaires
export {
  isNotificationSupported,
  isNotificationPermissionGranted,
  getNotificationPermissionState,
  initializeFirebase,
}

// Export du token actuel (pour debug)
export function getCurrentToken(): string | null {
  return currentToken
}

// Export de l'état d'initialisation
export function isNotificationsInitialized(): boolean {
  return isInitialized
}
