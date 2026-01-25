/**
 * Firebase Messaging Service Worker
 * Gère les notifications push en arrière-plan
 * 
 * Ce fichier DOIT être à la racine du dossier public/
 */

// Importer les scripts Firebase (version compat pour Service Worker)
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

// Configuration Firebase (identique à l'app principale)
firebase.initializeApp({
  apiKey: 'AIzaSyDP4KDSkN23jzBNqZfy537Z400WSuNSfw8',
  authDomain: 'pressow-42706.firebaseapp.com',
  projectId: 'pressow-42706',
  storageBucket: 'pressow-42706.firebasestorage.app',
  messagingSenderId: '803839731409',
  appId: '1:803839731409:web:cfeef23b397bcaae8607f0',
})

const messaging = firebase.messaging()

/**
 * Gestion des messages reçus en arrière-plan
 * Appelé quand l'app n'est pas au premier plan
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[SW Pressow] Message reçu en arrière-plan:', payload)

  // Extraire les informations de notification
  const notificationTitle = payload.notification?.title || 'Pressow'
  const notificationBody = payload.notification?.body || 'Vous avez une nouvelle notification'
  
  // Options de la notification
  const notificationOptions = {
    body: notificationBody,
    icon: '/logo_v2_r.png',
    badge: '/logo_v2_r.png',
    tag: payload.data?.type || 'pressow-notification',
    data: {
      ...payload.data,
      url: payload.data?.url || '/',
    },
    // Vibration pattern (mobile)
    vibrate: [200, 100, 200],
    // Actions possibles
    actions: [
      {
        action: 'open',
        title: 'Ouvrir',
      },
      {
        action: 'close',
        title: 'Fermer',
      },
    ],
    // Garder la notification jusqu'à interaction
    requireInteraction: payload.data?.priority === 'high',
  }

  // Afficher la notification
  self.registration.showNotification(notificationTitle, notificationOptions)
})

/**
 * Gestion du clic sur une notification
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW Pressow] Notification cliquée:', event)

  // Fermer la notification
  event.notification.close()

  // Récupérer l'action et l'URL
  const action = event.action
  const notificationData = event.notification.data || {}
  
  // Si l'utilisateur a cliqué sur "Fermer", ne rien faire
  if (action === 'close') {
    return
  }

  // Déterminer l'URL à ouvrir
  let targetUrl = notificationData.url || '/'
  
  // URLs spécifiques selon le type de notification
  const notificationType = notificationData.type
  if (notificationType) {
    switch (notificationType) {
      case 'order_created':
      case 'order_status_changed':
        targetUrl = notificationData.order_id 
          ? `/commandes/${notificationData.order_id}` 
          : '/commandes'
        break
      case 'payment_received':
        targetUrl = '/portefeuille'
        break
      case 'order_ready':
      case 'order_delivered':
        targetUrl = notificationData.order_id 
          ? `/commandes/${notificationData.order_id}` 
          : '/commandes'
        break
      default:
        targetUrl = notificationData.url || '/'
    }
  }

  // Ouvrir ou focus sur l'app
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Chercher si l'app est déjà ouverte
        for (const client of clientList) {
          // Vérifier si c'est notre app
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Naviguer vers l'URL cible
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: targetUrl,
              data: notificationData,
            })
            return client.focus()
          }
        }
        
        // L'app n'est pas ouverte, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      })
  )
})

/**
 * Installation du Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[SW Pressow] Service Worker installé')
  // Activer immédiatement sans attendre
  self.skipWaiting()
})

/**
 * Activation du Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[SW Pressow] Service Worker activé')
  // Prendre le contrôle immédiatement
  event.waitUntil(clients.claim())
})
