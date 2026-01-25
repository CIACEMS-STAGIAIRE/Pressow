/**
 * Configuration Firebase Cloud Messaging (FCM)
 * Pour les notifications push dans Pressow
 */
import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'

// Configuration Firebase Pressow
const firebaseConfig = {
  apiKey: 'AIzaSyDP4KDSkN23jzBNqZfy537Z400WSuNSfw8',
  authDomain: 'pressow-42706.firebaseapp.com',
  projectId: 'pressow-42706',
  storageBucket: 'pressow-42706.firebasestorage.app',
  messagingSenderId: '803839731409',
  appId: '1:803839731409:web:cfeef23b397bcaae8607f0',
  measurementId: 'G-EEZZ55XWH9',
}

// Clé VAPID pour les notifications Web Push
const VAPID_KEY =
  'BIjqfwstFwVV4WvienVdTM-1RoByeMGro8AJD8Sq932KfFqRR4CL3VeKmXxdsYGet8Ng9Ig_8iAmmMzaJ5JN0Y4'

// Variables globales
let app: FirebaseApp | null = null
let messaging: Messaging | null = null
let isInitialized = false

/**
 * Initialise Firebase si ce n'est pas déjà fait
 */
export function initializeFirebase(): boolean {
  if (isInitialized) return true

  // Vérifier si le navigateur supporte les notifications
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[Firebase] Notifications non supportées par ce navigateur')
    return false
  }

  // Vérifier si les Service Workers sont supportés
  if (!('serviceWorker' in navigator)) {
    console.warn('[Firebase] Service Workers non supportés')
    return false
  }

  try {
    app = initializeApp(firebaseConfig)
    messaging = getMessaging(app)
    isInitialized = true
    console.log('[Firebase] Initialisé avec succès')
    return true
  } catch (error) {
    console.error('[Firebase] Erreur d\'initialisation:', error)
    return false
  }
}

/**
 * Demande la permission de notification et retourne le token FCM
 */
export async function requestNotificationPermission(): Promise<string | null> {
  // Initialiser Firebase si nécessaire
  if (!initializeFirebase() || !messaging) {
    return null
  }

  try {
    // Vérifier l'état actuel de la permission
    const currentPermission = Notification.permission

    if (currentPermission === 'denied') {
      console.warn('[Firebase] L\'utilisateur a bloqué les notifications')
      return null
    }

    // Demander la permission si pas encore accordée
    if (currentPermission !== 'granted') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.log('[Firebase] Permission de notification refusée')
        return null
      }
    }

    // Enregistrer le Service Worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    })
    console.log('[Firebase] Service Worker enregistré:', registration.scope)

    // Attendre que le Service Worker soit actif
    await navigator.serviceWorker.ready

    // Obtenir le token FCM
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    if (token) {
      console.log('[Firebase] Token FCM obtenu:', token.substring(0, 20) + '...')
      return token
    } else {
      console.warn('[Firebase] Aucun token FCM obtenu')
      return null
    }
  } catch (error) {
    console.error('[Firebase] Erreur lors de la demande de permission:', error)
    return null
  }
}

/**
 * Écoute les messages reçus quand l'app est au premier plan
 */
export function onForegroundMessage(
  callback: (payload: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => void
): void {
  if (!messaging) {
    console.warn('[Firebase] Messaging non initialisé')
    return
  }

  onMessage(messaging, (payload) => {
    console.log('[Firebase] Message reçu (foreground):', payload)
    callback(payload as any)
  })
}

/**
 * Vérifie si les notifications sont supportées et activées
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
}

/**
 * Vérifie si les notifications sont actuellement autorisées
 */
export function isNotificationPermissionGranted(): boolean {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted'
}

/**
 * Retourne l'état de la permission de notification
 */
export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export { app, messaging, VAPID_KEY }
