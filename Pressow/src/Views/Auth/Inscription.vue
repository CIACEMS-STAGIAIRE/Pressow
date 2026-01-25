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

    <!-- Bouton pour rouvrir le modal OTP -->
    <div v-if="showReopenOtpButton" class="reopen-otp-container">
      <button class="reopen-otp-btn" @click="reopenOtpModal">
        <i class="fas fa-key"></i>
        <span>Réouvrir la vérification OTP</span>
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
      <!-- Étape 1: Sélection du type de compte (style Upwork) -->
      <div v-if="!accountType" class="account-selection">
        <h1 class="selection-title">Rejoindre en tant que prestataire ou client</h1>
        
        <div class="account-cards">
          <!-- Card Prestataire -->
          <div 
            class="account-card" 
            :class="{ selected: selectedType === 'provider' }"
            @click="selectedType = 'provider'"
          >
            <div class="card-icon">
              <i class="fas fa-store"></i>
            </div>
            <div class="card-radio">
              <span class="radio-circle" :class="{ checked: selectedType === 'provider' }"></span>
            </div>
            <div class="card-content">
              <span class="card-title">Je suis un prestataire,</span>
              <span class="card-subtitle">j'offre des services de pressing</span>
            </div>
          </div>

          <!-- Card Client -->
          <div 
            class="account-card" 
            :class="{ selected: selectedType === 'client' }"
            @click="selectedType = 'client'"
          >
            <div class="card-icon">
              <i class="fas fa-user"></i>
            </div>
            <div class="card-radio">
              <span class="radio-circle" :class="{ checked: selectedType === 'client' }"></span>
            </div>
            <div class="card-content">
              <span class="card-title">Je suis un client,</span>
              <span class="card-subtitle">je recherche un service</span>
            </div>
          </div>
        </div>

        <!-- Bouton Créer un compte -->
        <button 
          class="create-account-btn" 
          :class="{ active: selectedType }"
          :disabled="!selectedType"
          @click="setAccountType(selectedType)"
        >
          Créer un compte
        </button>

        <!-- Lien vers connexion -->
        <p class="login-text">
          Vous avez déjà un compte ? 
          <router-link to="/Connexion" class="login-link">Se connecter</router-link>
        </p>
      </div>

      <!-- Étape 2: Formulaire d'inscription -->
      <div v-else class="form-container">
        <!-- Bouton retour -->
        <button class="back-btn" @click="setAccountType('')">
          <i class="fas fa-arrow-left"></i>
          Retour
        </button>

        <!-- Formulaire Prestataire avec Vueform -->
        <Vueform
          v-if="accountType === 'provider'"
          ref="providerForm$"
          :display-errors="false"
          :endpoint="false"
          @submit="handleProviderSubmit"
          class="presso-vueform"
        >
          <StaticElement
            name="title"
            content="Inscription Prestataire"
            tag="h1"
            :attrs="{ class: 'form-title' }"
          />
          <StaticElement name="divider1" tag="hr" :attrs="{ class: 'form-divider' }" />

          <!-- Nom complet + Entreprise -->
          <GroupElement name="identity" description="Assurez-vous que les informations correspondent à votre identité légale">
            <TextElement
              name="name"
              placeholder="Nom complet"
              field-name="Nom complet"
              :columns="{ container: 6, label: 12, wrapper: 12 }"
              :rules="['required', 'max:255']"
            />
            <TextElement
              name="company_name"
              placeholder="Nom de l'entreprise"
              field-name="Entreprise"
              :columns="{ container: 6, label: 12, wrapper: 12 }"
              :rules="['required', 'max:255']"
            />
          </GroupElement>

          <!-- Type de service + Ville -->
          <GroupElement name="location" description="Pressow est actuellement disponible uniquement à Abidjan. D'autres villes seront bientôt ajoutées.">
            <SelectElement
              name="service_type"
              placeholder="Type de service"
              field-name="Type de service"
              :native="false"
              :search="true"
              :items="serviceTypeItems"
              :columns="{ container: 6, label: 12, wrapper: 12 }"
              :rules="['required']"
            />
            <SelectElement
              name="city"
              placeholder="Ville"
              field-name="Ville"
              :native="false"
              :items="cityItems"
              :columns="{ container: 6, label: 12, wrapper: 12 }"
              :rules="['required']"
              :default="'Abidjan'"
            />
          </GroupElement>

          <!-- Téléphone + Email -->
          <GroupElement name="contact" description="Le numéro de téléphone sera utilisé pour la connexion et les notifications clients. Il pourra être modifié ultérieurement avec vérification OTP.">
            <TextElement
              name="phone"
              input-type="tel"
              placeholder="Téléphone (ex: 0712345678)"
              field-name="Téléphone"
              :columns="{ container: 6, label: 12, wrapper: 12 }"
              :rules="['required', 'min:8', 'max:15']"
              :addons="{ before: '+225' }"
            />
            <TextElement
              name="email"
              input-type="email"
              placeholder="Email (facultatif mais recommandé)"
              field-name="Email"
              :columns="{ container: 6, label: 12, wrapper: 12 }"
              :rules="['nullable', 'email', 'max:255']"
              description="Permet de recevoir des notifications de sécurité"
            />
          </GroupElement>

          <!-- Mot de passe -->
          <TextElement
            name="password"
            :input-type="showProviderPassword ? 'text' : 'password'"
            placeholder="Mot de passe"
            field-name="Mot de passe"
            description="Minimum 8 caractères"
            :rules="['required', 'min:8']"
          >
            <template #addon-after>
              <button type="button" class="password-eye-btn" @click.prevent="showProviderPassword = !showProviderPassword" tabindex="-1">
                <svg v-if="!showProviderPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </template>
          </TextElement>
          
          <!-- Confirmation mot de passe -->
          <TextElement
            name="password_confirm"
            :input-type="showProviderPasswordConfirm ? 'text' : 'password'"
            placeholder="Confirmer le mot de passe"
            field-name="Confirmation"
            :rules="['required', 'same:password']"
          >
            <template #addon-after>
              <button type="button" class="password-eye-btn" @click.prevent="showProviderPasswordConfirm = !showProviderPasswordConfirm" tabindex="-1">
                <svg v-if="!showProviderPasswordConfirm" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </template>
          </TextElement>

          <StaticElement name="divider2" tag="hr" :attrs="{ class: 'form-divider' }" />

          <!-- CGU -->
          <CheckboxElement name="terms" :rules="['accepted']">
            <template #default>
              J'accepte les <a href="#" class="link">Conditions d'utilisation</a> et la <a href="#" class="link">Politique de confidentialité</a>
            </template>
          </CheckboxElement>

          <CheckboxElement name="marketing">
            <template #default>
              Je souhaite recevoir des offres et actualités par email
            </template>
          </CheckboxElement>

          <StaticElement name="divider3" tag="hr" :attrs="{ class: 'form-divider' }" />

          <!-- Submit -->
          <ButtonElement
            name="submit"
            :submits="true"
            :button-label="isLoading ? 'Création en cours...' : 'Créer mon compte'"
            :full="true"
            size="lg"
            :loading="isLoading"
            :disabled="isLoading"
          />
        </Vueform>

        <!-- Formulaire Client avec Vueform -->
        <Vueform
          v-else-if="accountType === 'client'"
          ref="clientForm$"
          :display-errors="false"
          :endpoint="false"
          @submit="handleClientSubmit"
          class="presso-vueform"
        >
          <StaticElement
            name="title"
            content="Inscription Client"
            tag="h1"
            :attrs="{ class: 'form-title' }"
          />
          <StaticElement name="divider1" tag="hr" :attrs="{ class: 'form-divider' }" />

          <!-- Prénom & Nom -->
          <GroupElement name="names" description="Assurez-vous qu'il correspond à votre nom légal">
            <TextElement
              name="first_name"
              placeholder="Prénom"
              field-name="Prénom"
              :columns="{ container: 6, label: 12, wrapper: 12 }"
              :rules="['required', 'max:255']"
            />
            <TextElement
              name="last_name"
              placeholder="Nom"
              field-name="Nom"
              :columns="{ container: 6, label: 12, wrapper: 12 }"
              :rules="['required', 'max:255']"
            />
          </GroupElement>

          <!-- Téléphone + Email -->
          <GroupElement name="contact" description="L'email est facultatif mais recommandé">
            <TextElement
              name="phone"
              input-type="tel"
              placeholder="Téléphone (ex: 0712345678)"
              field-name="Téléphone"
              :columns="{ container: 6, label: 12, wrapper: 12 }"
              :rules="['required', 'min:8', 'max:15']"
              :addons="{ before: '+225' }"
            />
            <TextElement
              name="email"
              input-type="email"
              placeholder="Email (facultatif)"
              field-name="Email"
              :columns="{ container: 6, label: 12, wrapper: 12 }"
              :rules="['nullable', 'email', 'max:255']"
            />
          </GroupElement>

          <!-- Mot de passe -->
          <TextElement
            name="password"
            :input-type="showClientPassword ? 'text' : 'password'"
            placeholder="Mot de passe"
            field-name="Mot de passe"
            description="Minimum 8 caractères"
            :rules="['required', 'min:8']"
          >
            <template #addon-after>
              <button type="button" class="password-eye-btn" @click.prevent="showClientPassword = !showClientPassword" tabindex="-1">
                <svg v-if="!showClientPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </template>
          </TextElement>
          
          <!-- Confirmation mot de passe -->
          <TextElement
            name="password_confirm"
            :input-type="showClientPasswordConfirm ? 'text' : 'password'"
            placeholder="Confirmer le mot de passe"
            field-name="Confirmation"
            :rules="['required', 'same:password']"
          >
            <template #addon-after>
              <button type="button" class="password-eye-btn" @click.prevent="showClientPasswordConfirm = !showClientPasswordConfirm" tabindex="-1">
                <svg v-if="!showClientPasswordConfirm" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </template>
          </TextElement>

          <StaticElement name="divider2" tag="hr" :attrs="{ class: 'form-divider' }" />

          <!-- CGU -->
          <CheckboxElement name="terms" :rules="['accepted']">
            <template #default>
              J'accepte les <a href="#" class="link">Conditions d'utilisation</a> et la <a href="#" class="link">Politique de confidentialité</a>
            </template>
          </CheckboxElement>

          <CheckboxElement name="marketing">
            <template #default>
              Je souhaite recevoir des offres et actualités par email
            </template>
          </CheckboxElement>

          <StaticElement name="divider3" tag="hr" :attrs="{ class: 'form-divider' }" />

          <!-- Submit -->
          <ButtonElement
            name="submit"
            :submits="true"
            :button-label="isLoading ? 'Création en cours...' : 'Créer mon compte'"
            :full="true"
            size="lg"
            :loading="isLoading"
            :disabled="isLoading"
          />
        </Vueform>

        <!-- Lien vers connexion -->
        <p class="login-text form-login">
          Vous avez déjà un compte ? 
          <router-link to="/Connexion" class="login-link">Se connecter</router-link>
        </p>
      </div>
    </main>

    <!-- Modal OTP -->
    <div v-if="showOtpModal" class="otp-modal-overlay" @click.self="handleOverlayClick">
      <div class="otp-modal">
        <div class="otp-modal-header">
          <h3>Vérification du numéro</h3>
          <button class="close-modal" @click="cancelOtp">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="otp-modal-content">
          <div class="otp-info">
            <div class="otp-badge">
              <i class="fas fa-mobile-alt"></i>
              <span>VÉRIFICATION SMS</span>
            </div>
            <p class="otp-text">Un code de vérification a été envoyé au :</p>
            <div class="phone-display">
              <i class="fas fa-phone"></i>
              <strong>{{ submittedPhone }}</strong>
            </div>
          </div>

          <div class="otp-input-wrapper">
            <label class="otp-label">Entrez le code à 6 chiffres</label>
            <input
              type="text"
              v-model="otpCode"
              class="otp-input"
              placeholder="000000"
              maxlength="6"
              inputmode="numeric"
              pattern="[0-9]*"
              @input="onOtpInput"
            />
          </div>
          
          <div class="otp-timer">
            <span v-if="otpTimer > 0">
              <i class="fas fa-clock"></i>
              Renvoyer le code dans {{ otpTimer }}s
            </span>
            <button v-else type="button" @click="resendOtp" class="resend-link">
              <i class="fas fa-redo"></i> Renvoyer le code
            </button>
          </div>
        </div>

        <div class="otp-actions">
          <button type="button" @click="cancelOtp" class="btn-secondary">
            <i class="fas fa-arrow-left"></i>
            Annuler
          </button>
          <button
            type="button"
            class="btn-primary"
            :disabled="otpCode.length !== 6 || isLoading"
            @click="verifyOtp"
          >
            <template v-if="isLoading">
              <i class="fas fa-spinner fa-spin"></i>
              Vérification...
            </template>
            <template v-else>
              <i class="fas fa-check"></i>
              Vérifier
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { NotificationType } from '@/types/types'

// ====================================================================
// TYPES
// ====================================================================

interface Notification {
  type: NotificationType
  title: string
  message: string
}

// ====================================================================
// DONNÉES STATIQUES
// ====================================================================

// Pour le lancement MVP, Pressow est disponible uniquement à Abidjan
// D'autres villes seront ajoutées progressivement
const cityItems = [
  { value: 'Abidjan', label: 'Abidjan' },
]

const serviceTypeItems = [
  { value: 'pressing-linge', label: 'Pressing Linge' },
  { value: 'pressing-chaussures', label: 'Pressing Chaussures' },
  { value: 'blanchisserie', label: 'Blanchisserie' },
  { value: 'laverie', label: 'Laverie' },
  { value: 'fanico', label: 'Fanico (nettoyage à domicile)' },
  { value: 'nettoyage', label: 'Nettoyage général' },
]

// ====================================================================
// ÉTATS
// ====================================================================

const router = useRouter()
const authStore = useAuthStore()

const providerForm$ = ref<any>(null)
const clientForm$ = ref<any>(null)

const isLoading = ref(false)
const showOtpModal = ref(false)
const showReopenOtpButton = ref(false)
const selectedType = ref<'provider' | 'client' | ''>('')
const accountType = ref<'provider' | 'client' | ''>('')
const submittedPhone = ref('')

const otpCode = ref('')
const otpTimer = ref(60)
let otpInterval: number | null = null

// Visibilité des mots de passe - Formulaire Prestataire
const showProviderPassword = ref(false)
const showProviderPasswordConfirm = ref(false)

// Visibilité des mots de passe - Formulaire Client
const showClientPassword = ref(false)
const showClientPasswordConfirm = ref(false)

const notifications = ref<Notification[]>([])

// ====================================================================
// FONCTIONS
// ====================================================================

const setAccountType = (value: 'provider' | 'client' | ''): void => {
  accountType.value = value
  if (!value) selectedType.value = ''
  authStore.setPendingToken(null)
  showReopenOtpButton.value = false
  showOtpModal.value = false
}

const redirectToDashboard = (): void => {
  setTimeout(() => {
    router.push(accountType.value === 'provider' ? '/Dashboard' : '/')
  }, 1200)
}

// Notifications
const showNotification = (type: NotificationType, title: string, message: string): void => {
  const notification: Notification = { type, title, message }
  notifications.value.push(notification)
  setTimeout(() => removeNotification(notification), 5000)
}

const removeNotification = (notification: Notification): void => {
  const index = notifications.value.indexOf(notification)
  if (index > -1) notifications.value.splice(index, 1)
}

// OTP
const startOtpTimer = (): void => {
  otpTimer.value = 60
  if (otpInterval) clearInterval(otpInterval)
  otpInterval = window.setInterval(() => {
    otpTimer.value--
    if (otpTimer.value <= 0 && otpInterval) {
      clearInterval(otpInterval)
      otpInterval = null
    }
  }, 1000)
}

const verifyOtp = async (): Promise<void> => {
  if (otpCode.value.length !== 6) {
    showNotification('error', 'Code invalide', 'Veuillez saisir un code OTP valide.')
    return
  }

  isLoading.value = true
  try {
    await authStore.verifyOtp(otpCode.value)
    showNotification('success', 'Inscription réussie', 'Bienvenue ! Redirection en cours...')
    showOtpModal.value = false
    showReopenOtpButton.value = false
    resetOtp()
    redirectToDashboard()
  } catch (error) {
    const detail = (error as any)?.response?.data?.detail || 'Une erreur est survenue.'
    showNotification('error', 'Erreur', detail)
  } finally {
    isLoading.value = false
  }
}

const resendOtp = async (): Promise<void> => {
  try {
    await authStore.requestOtp()
    startOtpTimer()
    showNotification('success', 'Code renvoyé', 'Un nouveau code OTP a été envoyé.')
  } catch (error) {
    showNotification('error', 'Erreur', 'Impossible de renvoyer le code OTP.')
  }
}

const cancelOtp = (): void => {
  showOtpModal.value = false
  if (authStore.pendingToken) showReopenOtpButton.value = true
}

const reopenOtpModal = (): void => {
  showOtpModal.value = true
  showReopenOtpButton.value = false
}

const resetOtp = (): void => {
  otpCode.value = ''
  otpTimer.value = 60
  if (otpInterval) {
    clearInterval(otpInterval)
    otpInterval = null
  }
}

const onOtpInput = (): void => {
  if (otpCode.value.length === 6) verifyOtp()
}

const handleOverlayClick = (e: MouseEvent): void => {
  e.stopPropagation()
}

// Normaliser le téléphone avec le préfixe +225
const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('225')) {
    return `+${digits}`
  }
  return `+225${digits}`
}

// Submit Provider
const handleProviderSubmit = async (form$: any): Promise<void> => {
  const data = form$.data
  const phoneNormalized = normalizePhone(data.phone)

  isLoading.value = true
  submittedPhone.value = phoneNormalized

  try {
    const response = await authStore.registerProvider({
      name: data.name,
      company_name: data.company_name,
      service_type: data.service_type,
      city: data.city,
      phone: phoneNormalized,
      email: data.email || undefined,
      login: phoneNormalized,
      password: data.password,
      password_confirm: data.password_confirm,
    })

    if (response.requires_otp && authStore.pendingToken) {
      showOtpModal.value = true
      startOtpTimer()
    } else {
      showNotification('success', 'Vérification en cours', response.detail || 'Si éligible, un OTP a été envoyé.')
    }
  } catch (error) {
    const detail = (error as any)?.response?.data?.detail || 'Une erreur est survenue.'
    showNotification('error', 'Erreur', detail)
  } finally {
    isLoading.value = false
  }
}

// Submit Client
const handleClientSubmit = async (form$: any): Promise<void> => {
  const data = form$.data
  const phoneNormalized = normalizePhone(data.phone)

  isLoading.value = true
  submittedPhone.value = phoneNormalized

  try {
    const response = await authStore.registerClient({
      phone: phoneNormalized,
      first_name: data.first_name || undefined,
      last_name: data.last_name || undefined,
      email: data.email || undefined,
      password: data.password || undefined,
      password_confirm: data.password_confirm || undefined,
    })

    if (response.requires_otp && authStore.pendingToken) {
      showOtpModal.value = true
      startOtpTimer()
    } else {
      showNotification('success', 'Vérification en cours', response.detail || 'Si éligible, un OTP a été envoyé.')
    }
  } catch (error) {
    const detail = (error as any)?.response?.data?.detail || 'Une erreur est survenue.'
    showNotification('error', 'Erreur', detail)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  console.log('Inscription.vue mounted')
})

onUnmounted(() => {
  if (otpInterval) clearInterval(otpInterval)
})
</script>

<style>
/* ============================================
   THÈME VUEFORM - COULEURS PRESSO (BLEU)
   ============================================ */

@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Variables CSS Vueform - Remplacer VERT par BLEU */
:root {
  /* Couleurs principales - BLEU au lieu de VERT */
  --vf-primary: #039AE3;
  --vf-primary-darker: #0B61B0;
  
  /* Couleurs de danger/succès */
  --vf-danger: #EF4444;
  --vf-danger-lighter: #FEE2E2;
  --vf-success: #039AE3;
  --vf-success-lighter: rgba(3, 154, 227, 0.1);
  
  /* Couleurs de fond et bordures */
  --vf-bg-input: #FFFFFF;
  --vf-bg-input-hover: #FFFFFF;
  --vf-bg-input-focus: #FFFFFF;
  --vf-bg-disabled: #F4F7FB;
  --vf-bg-selected: rgba(3, 154, 227, 0.08);
  
  --vf-border-color-input: #E5E7EB;
  --vf-border-color-input-hover: #039AE3;
  --vf-border-color-input-focus: #039AE3;
  
  /* Couleurs de texte */
  --vf-color-input: #1F2937;
  --vf-color-placeholder: #9CA3AF;
  --vf-color-floating: #6B7280;
  --vf-color-disabled: #9CA3AF;
  
  /* Ring (focus) - BLEU */
  --vf-ring-width: 3px;
  --vf-ring-color: rgba(3, 154, 227, 0.15);
  
  /* Radius */
  --vf-radius-input: 8px;
  --vf-radius-btn: 24px;
  --vf-radius-small: 6px;
  --vf-radius-large: 16px;
  
  /* Tailles */
  --vf-min-height-input: 48px;
  --vf-py-input: 12px;
  --vf-px-input: 16px;
  
  /* Boutons - BLEU */
  --vf-bg-btn: #039AE3;
  --vf-bg-btn-hover: #0B61B0;
  --vf-color-btn: #FFFFFF;
  --vf-bg-btn-secondary: #FFFFFF;
  --vf-color-btn-secondary: #1F2937;
  --vf-border-color-btn-secondary: #E5E7EB;
  
  /* Checkbox/Radio - BLEU */
  --vf-bg-checkbox: #FFFFFF;
  --vf-border-color-checkbox: #D1D5DB;
  --vf-bg-checked: #039AE3;
  --vf-border-color-checked: #039AE3;
  
  /* Font */
  --vf-font-size: 15px;
  --vf-font-size-small: 13px;
  --vf-font-size-h1: 24px;
  --vf-line-height: 1.5;
  
  /* Espacements */
  --vf-gutter: 16px;
  --vf-gap-y-group: 12px;
}

/* Override des boutons Vueform - style BLEU arrondi */
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

.vf-btn-secondary {
  background: var(--vf-bg-btn-secondary) !important;
  color: var(--vf-color-btn-secondary) !important;
  border: 1px solid var(--vf-border-color-btn-secondary) !important;
}

.vf-btn-secondary:hover {
  background: #F4F7FB !important;
}

/* Inputs */
.vf-input-group {
  transition: all 0.2s ease;
}

.vf-input-group:focus-within {
  box-shadow: 0 0 0 var(--vf-ring-width) var(--vf-ring-color);
}

/* Select dropdown */
.vf-multiselect-dropdown {
  border-radius: var(--vf-radius-input) !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
}

.vf-multiselect-option.is-pointed {
  background: var(--vf-bg-selected) !important;
}

.vf-multiselect-option.is-selected {
  background: var(--vf-primary) !important;
  color: white !important;
}

/* Checkboxes - BLEU */
.vf-checkbox-check {
  border-color: var(--vf-border-color-checkbox) !important;
}

.vf-checkbox-check.is-checked {
  background: var(--vf-bg-checked) !important;
  border-color: var(--vf-border-color-checked) !important;
}

.vf-checkbox-check::after {
  border-color: white !important;
}

/* Addons (préfixe téléphone) */
.vf-addon {
  background: #F4F7FB !important;
  border-right: 1px solid var(--vf-border-color-input) !important;
  color: #6B7280 !important;
  font-weight: 500 !important;
}

/* Descriptions */
.vf-element-description {
  color: #6B7280 !important;
  font-size: 13px !important;
  margin-top: 6px !important;
}

/* Bouton œil dans l'addon Vueform */
.password-eye-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-right: 8px;
  color: #9CA3AF;
  transition: all 0.2s ease;
  height: 100%;
  border-radius: 6px;
}

.password-eye-btn:hover {
  color: #039AE3;
  background: rgba(3, 154, 227, 0.08);
}

.password-eye-btn svg {
  width: 20px;
  height: 20px;
}

/* Style de l'addon Vueform */
.vf-addon-after {
  background: transparent !important;
  border-left: none !important;
  padding-right: 4px !important;
}
</style>

<style scoped>
/* ============================================
   STYLES PAGE INSCRIPTION - STYLE UPWORK
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

/* ============================================
   ÉTAPE 1: SÉLECTION DU TYPE DE COMPTE
   ============================================ */

.account-selection {
  text-align: center;
  padding: 60px 20px;
  max-width: 680px;
  width: 100%;
}

.selection-title {
  font-size: 32px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 48px;
}

/* Cards de sélection (style Upwork) */
.account-cards {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
}

.account-card {
  width: 220px;
  padding: 24px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  text-align: left;
  background: #FFFFFF;
}

.account-card:hover {
  border-color: #039AE3;
}

.account-card.selected {
  border-color: #039AE3;
  background: rgba(3, 154, 227, 0.02);
}

.card-icon {
  font-size: 24px;
  color: #6B7280;
  margin-bottom: 12px;
}

.account-card.selected .card-icon {
  color: #039AE3;
}

.card-radio {
  position: absolute;
  top: 16px;
  right: 16px;
}

.radio-circle {
  width: 24px;
  height: 24px;
  border: 2px solid #D1D5DB;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.radio-circle.checked {
  border-color: #039AE3;
  background: #039AE3;
}

.radio-circle.checked::after {
  content: '';
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
}

.card-subtitle {
  font-size: 14px;
  color: #6B7280;
}

/* Bouton Créer un compte */
.create-account-btn {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  color: #9CA3AF;
  background: #F3F4F6;
  border: none;
  border-radius: 24px;
  cursor: not-allowed;
  transition: all 0.2s ease;
  margin-bottom: 24px;
}

.create-account-btn.active {
  background: #039AE3;
  color: white;
  cursor: pointer;
}

.create-account-btn.active:hover {
  background: #0B61B0;
}

/* Lien connexion */
.login-text {
  font-size: 14px;
  color: #6B7280;
}

.login-link {
  color: #039AE3;
  text-decoration: none;
  font-weight: 500;
}

.login-link:hover {
  text-decoration: underline;
}

/* ============================================
   ÉTAPE 2: FORMULAIRE
   ============================================ */

.form-container {
  width: 100%;
  max-width: 680px;
  padding: 40px 20px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6B7280;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 24px;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #039AE3;
}

.presso-vueform {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 32px;
}

.form-title {
  font-size: 24px !important;
  font-weight: 600 !important;
  color: #1F2937 !important;
  margin: 0 0 8px 0 !important;
}

.form-divider {
  border: none !important;
  height: 1px !important;
  background: #E5E7EB !important;
  margin: 20px 0 !important;
}

.form-login {
  text-align: center;
  margin-top: 24px;
}

/* Liens dans le formulaire */
.link {
  color: #039AE3;
  text-decoration: none;
}

.link:hover {
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

/* Bouton réouverture OTP */
.reopen-otp-container {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
}

.reopen-otp-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #039AE3;
  color: white;
  border: none;
  border-radius: 24px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(3, 154, 227, 0.3);
  transition: all 0.2s;
}

.reopen-otp-btn:hover {
  background: #0B61B0;
  transform: translateY(-2px);
}

/* ============================================
   MODAL OTP
   ============================================ */

.otp-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.otp-modal {
  background: #FFFFFF;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease;
}

.otp-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #039AE3, #0B61B0);
  color: white;
}

.otp-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-modal {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-modal:hover {
  background: rgba(255, 255, 255, 0.3);
}

.otp-modal-content {
  padding: 24px;
}

.otp-info {
  text-align: center;
  margin-bottom: 24px;
}

.otp-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #039AE3;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
}

.otp-text {
  color: #6B7280;
  margin-bottom: 8px;
  font-size: 14px;
}

.phone-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  color: #1F2937;
}

.otp-input-wrapper {
  margin-bottom: 16px;
}

.otp-label {
  display: block;
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
}

.otp-input {
  width: 100%;
  padding: 16px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 8px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s;
}

.otp-input:focus {
  border-color: #039AE3;
}

.otp-input::placeholder {
  color: #D1D5DB;
  letter-spacing: 8px;
}

.otp-timer {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #6B7280;
}

.resend-link {
  background: none;
  border: none;
  color: #039AE3;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}

.resend-link:hover {
  background: rgba(3, 154, 227, 0.08);
}

.otp-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  background: #F4F7FB;
  border-top: 1px solid #E5E7EB;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 12px 20px;
  border-radius: 24px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-secondary {
  background: #FFFFFF;
  color: #1F2937;
  border: 1px solid #E5E7EB;
}

.btn-secondary:hover {
  background: #F4F7FB;
}

.btn-primary {
  background: #039AE3;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: #0B61B0;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media (max-width: 600px) {
  .presso-header {
    padding: 0 16px;
  }

  .logo {
    height: 32px;
  }

  .selection-title {
    font-size: 24px;
    margin-bottom: 32px;
  }

  .account-cards {
    flex-direction: column;
    align-items: center;
  }

  .account-card {
    width: 100%;
    max-width: 320px;
  }

  .form-container {
    padding: 24px 16px;
  }

  .presso-vueform {
    padding: 24px 20px;
  }

  .otp-modal {
    width: 95%;
  }

  .presso-notification {
    left: 16px;
    right: 16px;
    max-width: none;
    top: 80px;
  }
}
</style>
