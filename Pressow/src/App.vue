<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { setSessionCallback } from '@/stores/auth'

const router = useRouter()
const route = useRoute()

// Toast pour la session expirée
const showSessionToast = ref(false)
const sessionToastMessage = ref('')
const sessionToastType = ref<'info' | 'warning' | 'error'>('warning')

let toastTimeout: ReturnType<typeof setTimeout> | null = null

const showToast = (message: string, type: 'info' | 'warning' | 'error' = 'warning', duration = 5000) => {
  sessionToastMessage.value = message
  sessionToastType.value = type
  showSessionToast.value = true
  
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    showSessionToast.value = false
  }, duration)
}

// Pages publiques où on ne redirige pas après expiration
const publicRoutes = ['/Connexion', '/Inscription', '/mot-de-passe-oublie', '/']

onMounted(() => {
  // Écouter les événements de session
  setSessionCallback((event) => {
    if (event === 'expired') {
      // Session expirée - rediriger vers la connexion avec message
      const currentPath = route.fullPath
      const isPublicRoute = publicRoutes.some(r => currentPath.startsWith(r) || currentPath === r)
      
      if (!isPublicRoute) {
        showToast('Votre session a expiré. Veuillez vous reconnecter.', 'warning', 6000)
        
        // Rediriger vers la connexion après un petit délai
        setTimeout(() => {
          router.push({
            path: '/Connexion',
            query: { redirect: currentPath, reason: 'session_expired' }
          })
        }, 500)
      }
    }
  })
})

onUnmounted(() => {
  setSessionCallback(null)
  if (toastTimeout) clearTimeout(toastTimeout)
})
</script>

<template>
  <router-view />
  
  <!-- Toast de notification de session -->
  <Teleport to="body">
    <Transition name="toast">
      <div 
        v-if="showSessionToast" 
        class="session-toast"
        :class="`session-toast--${sessionToastType}`"
      >
        <div class="session-toast__icon">
          <!-- Icon warning -->
          <svg v-if="sessionToastType === 'warning'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <!-- Icon error -->
          <svg v-else-if="sessionToastType === 'error'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <!-- Icon info -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <p class="session-toast__message">{{ sessionToastMessage }}</p>
        <button class="session-toast__close" @click="showSessionToast = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* Toast de session */
.session-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  max-width: 90vw;
  min-width: 320px;
}

.session-toast--warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
}

.session-toast--error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 1px solid #ef4444;
}

.session-toast--info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #3b82f6;
}

.session-toast__icon {
  flex-shrink: 0;
}

.session-toast--warning .session-toast__icon {
  color: #d97706;
}

.session-toast--error .session-toast__icon {
  color: #dc2626;
}

.session-toast--info .session-toast__icon {
  color: #2563eb;
}

.session-toast__message {
  flex: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
}

.session-toast__close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #6b7280;
  border-radius: 6px;
  transition: all 0.2s;
}

.session-toast__close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

/* Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
