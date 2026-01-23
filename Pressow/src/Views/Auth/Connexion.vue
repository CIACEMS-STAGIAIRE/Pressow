<template>
  <div class="presso-auth-page">
    <!-- Notifications -->
    <div v-for="(notification, index) in notifications" :key="index" class="presso-notification" :class="notification.type">
      <div class="notification-content">
        <i :class="notification.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        <div>
          <strong>{{ notification.title }}</strong>
          <p>{{ notification.message }}</p>
        </div>
      </div>
      <button @click="removeNotification(notification)" class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Header avec logo (style Upwork) -->
    <header class="presso-header">
      <router-link to="/" class="logo-link">
        <img src="/logo_v2_r.png" alt="Pressow" class="logo" />
      </router-link>
    </header>

    <!-- Contenu principal -->
    <main class="presso-main">
      <div class="form-container">
        <!-- Formulaire de connexion avec Vueform -->
        <Vueform
          ref="loginForm$"
          :display-errors="false"
          :endpoint="false"
          @submit="handleSubmit"
          class="presso-vueform"
        >
          <StaticElement
            name="title"
            content="Connexion"
            tag="h1"
            :attrs="{ class: 'form-title' }"
          />
          
          <StaticElement
            name="subtitle"
            content="Connectez-vous à votre espace prestataire ou client"
            tag="p"
            :attrs="{ class: 'form-subtitle' }"
          />
          
          <StaticElement name="divider1" tag="hr" :attrs="{ class: 'form-divider' }" />

          <!-- Identifiant -->
          <TextElement
            name="login"
            placeholder="Email ou numéro de téléphone"
            field-name="Identifiant"
            :rules="['required']"
          />
          <StaticElement
            name="login_desc"
            content="Utilisez votre email ou numéro de téléphone"
            tag="p"
            :attrs="{ class: 'field-description' }"
          />

          <!-- Mot de passe -->
          <TextElement
            name="password"
            input-type="password"
            placeholder="Mot de passe"
            field-name="Mot de passe"
            :rules="['required']"
          />

          <!-- Lien mot de passe oublié -->
          <StaticElement name="forgot_password" :attrs="{ class: 'forgot-password-container' }">
            <template #default>
              <router-link to="/mot-de-passe-oublie" class="forgot-link">
                Mot de passe oublié ?
              </router-link>
            </template>
          </StaticElement>

          <StaticElement name="divider2" tag="hr" :attrs="{ class: 'form-divider' }" />

          <!-- Submit -->
          <ButtonElement
            name="submit"
            :submits="true"
            :button-label="isLoading ? 'Connexion en cours...' : 'Se connecter'"
            :full="true"
            size="lg"
            :loading="isLoading"
            :disabled="isLoading"
          />
        </Vueform>

        <!-- Lien vers inscription -->
        <p class="register-text">
          Pas encore de compte ? 
          <router-link to="/Inscription" class="register-link">Créer un compte</router-link>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { AuthUser, NotificationType } from '@/types/types'

// ====================================================================
// TYPES
// ====================================================================

interface Notification {
  type: NotificationType
  title: string
  message: string
}

// ====================================================================
// ÉTATS
// ====================================================================

const router = useRouter()
const authStore = useAuthStore()

const loginForm$ = ref<any>(null)
const isLoading = ref(false)
const notifications = ref<Notification[]>([])

// ====================================================================
// FONCTIONS
// ====================================================================

const showNotification = (type: NotificationType, title: string, message: string): void => {
  const notification: Notification = { type, title, message }
  notifications.value.push(notification)
  setTimeout(() => removeNotification(notification), 5000)
}

const removeNotification = (notification: Notification): void => {
  const index = notifications.value.indexOf(notification)
  if (index > -1) notifications.value.splice(index, 1)
}

const getRedirectPath = (user: AuthUser): string => {
  if (user.provider) {
    return '/Dashboard'
  }
  return '/'
}

const handleSubmit = async (form$: any): Promise<void> => {
  const data = form$.data

  if (!data.login || !data.password) {
    showNotification('error', 'Formulaire invalide', 'Veuillez remplir tous les champs requis.')
    return
  }

  isLoading.value = true
  
  try {
    const response = await authStore.login(data.login, data.password)
    showNotification('success', 'Connexion réussie', 'Redirection en cours...')
    setTimeout(() => {
      router.push(getRedirectPath(response.user))
    }, 1000)
  } catch (error: any) {
    const detail = error?.response?.data?.detail || 'Email/téléphone ou mot de passe incorrect'
    showNotification('error', 'Échec de connexion', detail)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  console.log('Connexion.vue mounted')
})
</script>

<style>
/* ============================================
   THÈME VUEFORM - COULEURS PRESSO (BLEU)
   ============================================ */

@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Variables CSS Vueform - BLEU Presso */
:root {
  --vf-primary: #039AE3;
  --vf-primary-darker: #0B61B0;
  --vf-danger: #EF4444;
  --vf-danger-lighter: #FEE2E2;
  --vf-success: #039AE3;
  --vf-success-lighter: rgba(3, 154, 227, 0.1);
  --vf-bg-input: #FFFFFF;
  --vf-bg-input-hover: #FFFFFF;
  --vf-bg-input-focus: #FFFFFF;
  --vf-bg-disabled: #F4F7FB;
  --vf-bg-selected: rgba(3, 154, 227, 0.08);
  --vf-border-color-input: #E5E7EB;
  --vf-border-color-input-hover: #039AE3;
  --vf-border-color-input-focus: #039AE3;
  --vf-color-input: #1F2937;
  --vf-color-placeholder: #9CA3AF;
  --vf-ring-width: 3px;
  --vf-ring-color: rgba(3, 154, 227, 0.15);
  --vf-radius-input: 8px;
  --vf-radius-btn: 24px;
  --vf-min-height-input: 48px;
  --vf-bg-btn: #039AE3;
  --vf-bg-btn-hover: #0B61B0;
  --vf-color-btn: #FFFFFF;
}

/* Override des boutons Vueform */
.vf-btn {
  background: var(--vf-bg-btn) !important;
  border: none !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
  border-radius: var(--vf-radius-btn) !important;
}

.vf-btn:hover:not(:disabled) {
  background: var(--vf-bg-btn-hover) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(3, 154, 227, 0.3);
}

.vf-input-group:focus-within {
  box-shadow: 0 0 0 var(--vf-ring-width) var(--vf-ring-color);
}

.vf-multiselect-option.is-selected {
  background: var(--vf-primary) !important;
  color: white !important;
}

.vf-checkbox-check.is-checked {
  background: var(--vf-primary) !important;
  border-color: var(--vf-primary) !important;
}

.vf-element-description {
  color: #6B7280 !important;
  font-size: 13px !important;
  margin-top: 6px !important;
}

/* Wrapper pour champ mot de passe avec bouton œil */
.password-field-wrapper {
  position: relative;
  width: 100%;
}

/* Bouton toggle visibilité mot de passe */
.password-toggle-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #6B7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  z-index: 10;
}

.password-toggle-btn:hover {
  color: #039AE3;
}

.password-toggle-btn i {
  font-size: 16px;
}
</style>

<style scoped>
/* ============================================
   STYLES PAGE CONNEXION - STYLE UPWORK
   ============================================ */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.presso-auth-page {
  min-height: 100vh;
  background: #E3F2FB;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header avec logo */
.presso-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: transparent;
  display: flex;
  align-items: center;
  padding: 0 32px;
  z-index: 100;
}

.logo-link {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  width: auto;
}

/* Contenu principal */
.presso-main {
  min-height: 100vh;
  padding-top: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 40px;
}

/* Formulaire */
.form-container {
  width: 100%;
  max-width: 440px;
  padding: 40px 20px;
}

.presso-vueform {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 40px 32px;
}

.form-title {
  font-size: 28px !important;
  font-weight: 600 !important;
  color: #1F2937 !important;
  margin: 0 !important;
  text-align: center;
}

.form-subtitle {
  font-size: 14px !important;
  color: #6B7280 !important;
  margin: 8px 0 0 0 !important;
  text-align: center;
}

.form-divider {
  border: none !important;
  height: 1px !important;
  background: #E5E7EB !important;
  margin: 24px 0 !important;
}

.field-description {
  font-size: 13px !important;
  color: #6B7280 !important;
  margin: -8px 0 16px 0 !important;
}

/* Mot de passe oublié */
.forgot-password-container {
  text-align: right !important;
  margin: -8px 0 16px 0 !important;
}

.forgot-link {
  color: #039AE3;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* Lien inscription */
.register-text {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #6B7280;
}

.register-link {
  color: #039AE3;
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}

.register-link:hover {
  text-decoration: underline;
}

/* ============================================
   NOTIFICATIONS
   ============================================ */

.presso-notification {
  position: fixed;
  top: 80px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease;
  max-width: 400px;
}

.presso-notification.success {
  background: #D1FAE5;
  border: 1px solid #86EFAC;
  color: #065F46;
}

.presso-notification.error {
  background: #FEE2E2;
  border: 1px solid #FECACA;
  color: #991B1B;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.notification-content p {
  margin: 0;
  font-size: 14px;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  opacity: 0.7;
}

.notification-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media (max-width: 500px) {
  .presso-header {
    padding: 0 16px;
  }

  .logo {
    height: 32px;
  }

  .form-container {
    padding: 24px 16px;
  }

  .presso-vueform {
    padding: 32px 24px;
  }

  .form-title {
    font-size: 24px !important;
  }

  .presso-notification {
    left: 16px;
    right: 16px;
    max-width: none;
    top: 80px;
  }
}
</style>
