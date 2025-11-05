<template>
  <div class="auth-page">
    <div class="auth-container">
      <router-link to="/">
        <button class="back-button" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          <span>Retour à l'accueil</span>
        </button>
      </router-link>

      <!-- Notifications -->
      <div v-for="(notification, index) in notifications" :key="index" class="notification" :class="notification.type">
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

      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-title">
            <span class="title-text">Inscription</span>
          </div>
          <p class="auth-description">
            Créez votre compte prestataire
          </p>
        </div>
        <div class="auth-content">
          <form @submit.prevent="handleSubmit" class="auth-form">
            <div class="form-section">
              <div class="form-group fade-in">
                <label for="name" class="form-label">Nom complet</label>
                <div class="input-wrapper">
                  <i class="fas fa-user input-icon"></i>
                  <input id="name" name="name" v-model="formData.name" placeholder="Jean Dupont" required
                    class="form-input" />
                </div>
              </div>

              <div class="form-group fade-in">
                <label for="companyName" class="form-label">Nom de l'entreprise</label>
                <div class="input-wrapper">
                  <i class="fas fa-building input-icon"></i>
                  <input id="companyName" name="companyName" v-model="formData.companyName"
                    placeholder="Ex: Pressing Jean" required class="form-input" />
                </div>
              </div>

              <div class="form-group fade-in">
                <label for="serviceType" class="form-label">Type de service</label>
                <div class="select-wrapper">
                  <i class="fas fa-concierge-bell input-icon"></i>
                  <select id="serviceType" v-model="formData.serviceType" required class="form-select">
                    <option value="" disabled>Sélectionnez votre type de service</option>
                    <option v-for="service in serviceTypes" :key="service.value" :value="service.value">
                      {{ service.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-group fade-in">
              <label for="email" class="form-label">
                Adresse email <span class="optional-label">(facultatif)</span>
              </label>
              <div class="input-wrapper">
                <i class="fas fa-envelope input-icon"></i>
                <input id="email" name="email" type="email" v-model="formData.email"
                  placeholder="jean.dupont@example.com" class="form-input" />
              </div>
            </div>

            <div class="form-group slide-in">
              <label for="phone" class="form-label">Numéro de téléphone</label>
              <div class="input-wrapper">
                <i class="fas fa-phone input-icon"></i>
                <input id="phone" name="phone" type="tel" v-model="formData.phone" placeholder="+33612345678" required
                  class="form-input" />
              </div>
            </div>

            <div class="form-group slide-in">
              <label for="password" class="form-label">Mot de passe</label>
              <div class="input-wrapper">
                <i class="fas fa-lock input-icon"></i>
                <input id="password" name="password" :type="showPassword ? 'text' : 'password'"
                  v-model="formData.password" placeholder="••••••••" required class="form-input password-input" />
                <button type="button" @click="togglePasswordVisibility" class="password-toggle">
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-group fade-in">
              <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
              <div class="input-wrapper">
                <i class="fas fa-lock input-icon"></i>
                <input id="confirmPassword" name="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="formData.confirmPassword" placeholder="••••••••" required class="form-input password-input"
                  :class="{ error: formData.confirmPassword && !passwordsMatch }" />
                <button type="button" @click="toggleConfirmPasswordVisibility" class="password-toggle">
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div v-if="formData.confirmPassword && !passwordsMatch" class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                Les mots de passe ne correspondent pas
              </div>
            </div>

            <div class="form-group fade-in">
              <label for="city" class="form-label">Ville</label>
              <div class="select-wrapper">
                <i class="fas fa-map-marker-alt input-icon"></i>
                <select id="city" v-model="formData.city" required class="form-select">
                  <option value="" disabled>Sélectionnez votre ville</option>
                  <option v-for="city in cities" :key="city.name" :value="city.name">
                    {{ city.name }}
                  </option>
                </select>
              </div>
            </div>

            <button type="submit" class="submit-button" :class="{ pulse: !formValid, glow: formValid }"
              :disabled="!formValid || isLoading">
              <span class="button-content">
                <template v-if="isLoading">
                  <i class="fas fa-spinner fa-spin"></i>
                  Chargement...
                </template>
                <template v-else>
                  S'inscrire
                  <i class="fas fa-arrow-right button-icon"></i>
                </template>
              </span>
              <div class="button-shine"></div>
            </button>
          </form>

          <div class="toggle-mode">
            <button @click="$router.push('/connexion')" class="toggle-button">
              <span class="toggle-text">
                Déjà un compte ? Se connecter
              </span>
              <i class="fas fa-arrow-right toggle-icon"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

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
          <!-- Section simulation SMS -->
          <div class="simulation-info">
            <div class="simulation-badge">
              <i class="fas fa-mobile-alt"></i>
              <span>SIMULATION SMS</span>
            </div>
            <p class="simulation-text">
              En production, un SMS serait envoyé au :
            </p>
            <div class="phone-number">
              <i class="fas fa-phone"></i>
              <strong>{{ formData.phone }}</strong>
            </div>
          </div>

          <!-- Code OTP affiché clairement -->
          <div class="otp-display-section">
            <h4>Code OTP de test :</h4>
            <div class="otp-code-display" @click="copyOtpToClipboard">
              <span class="otp-code">{{ generatedOtp }}</span>
              <button class="copy-btn" title="Copier le code">
                <i class="fas fa-copy"></i>
                Copier
              </button>
            </div>
            <small class="otp-hint">
              <i class="fas fa-info-circle"></i>
              Cliquez sur le code pour le copier
            </small>
          </div>

          <!-- Champ de saisie -->
          <form @submit.prevent="verifyOtp" class="otp-form">
            <div class="form-group">
              <label for="otpCode" class="form-label">Entrez le code OTP</label>
              <div class="input-wrapper">
                <i class="fas fa-shield-alt input-icon"></i>
                <input id="otpCode" name="otpCode" v-model="otpCode" placeholder="123456" maxlength="6" required
                  class="form-input otp-input" @input="onOtpInput" />
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
          </form>
        </div>

        <!-- Actions -->
        <div class="otp-actions">
          <button type="button" @click="cancelOtp" class="btn-secondary">
            <i class="fas fa-arrow-left"></i>
            Annuler
          </button>
          <button type="submit" class="btn-primary" :class="{ glow: otpCode.length === 6 }"
            :disabled="otpCode.length !== 6 || isLoading">
            <template v-if="isLoading">
              <i class="fas fa-spinner fa-spin"></i>
              Vérification...
            </template>
            <template v-else>
              <i class="fas fa-check"></i>
              Vérifier le code
            </template>
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced Background Animation -->
    <div class="auth-background">
      <div class="floating-bubble bubble-1"></div>
      <div class="floating-bubble bubble-2"></div>
      <div class="floating-bubble bubble-3"></div>

      <div class="floating-icon auth-icon-1">
        <i class="fas fa-tshirt"></i>
      </div>
      <div class="floating-icon auth-icon-2">
        <i class="fas fa-soap"></i>
      </div>
      <div class="floating-icon auth-icon-3">
        <i class="fas fa-spray-can"></i>
      </div>
      <div class="floating-icon auth-icon-4">
        <i class="fas fa-wind"></i>
      </div>
      <div class="floating-icon auth-icon-5">
        <i class="fas fa-temperature-high"></i>
      </div>
      <div class="floating-icon auth-icon-6">
        <i class="fas fa-water"></i>
      </div>
    </div>

    <!-- Particles Background -->
    <div class="particles-container">
      <div v-for="i in 15" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// ====================================================================
// TYPES ET INTERFACES
// ====================================================================

interface User {
  id: string
  name: string
  displayName: string
  first_name: string
  last_name: string
  companyName: string
  phone: string
  email: string
  password: string
  serviceType: string
  type: string
  city: string
  adresse: string
  quartier: string
  role: string
  isVerified: boolean
  statut_kyc: string
  phone_verified_at: string
  date_inscription: string
  currentShopId: string
  shops: any[]
  bankAccounts: any[]
  joinDate: string
}

interface Notification {
  type: 'success' | 'error'
  title: string
  message: string
}

interface City {
  name: string
}

interface ServiceType {
  value: string
  label: string
}

interface AuthFormData {
  name: string
  companyName: string
  phone: string
  email: string
  login: string
  password: string
  confirmPassword: string
  city: string
  serviceType: string
}

// ====================================================================
// DONNÉES STATIQUES
// ====================================================================

const cities: City[] = [
  { name: 'Abidjan' },
  { name: 'Bouaké' },
  { name: 'Daloa' },
  { name: 'Korhogo' },
  { name: 'San-Pédro' },
  { name: 'Yamoussoukro' },
  { name: 'Divo' },
  { name: 'Gagnoa' },
  { name: 'Abengourou' },
  { name: 'Anyama' },
  { name: 'Grand-Bassam' },
  { name: 'Bingerville' },
  { name: 'Agboville' },
  { name: 'Dabou' },
  { name: 'Adzopé' },
]

const serviceTypes: ServiceType[] = [
  { value: 'pressing-linge', label: 'Pressing Linge' },
  { value: 'pressing-chaussures', label: 'Pressing Chaussures' },
  { value: 'blanchisserie', label: 'Blanchisserie' },
  { value: 'laverie', label: 'Laverie' },
  { value: 'fanico', label: 'Fanico (nettoyage à domicile)' },
  { value: 'nettoyage', label: 'Nettoyage général' },
]

// ====================================================================
// ÉTATS RÉACTIFS
// ====================================================================

const router = useRouter()

// États du formulaire
const formData = ref<AuthFormData>({
  name: '',
  companyName: '',
  phone: '',
  email: '',
  login: '',
  password: '',
  confirmPassword: '',
  city: '',
  serviceType: '',
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const showOtpModal = ref(false)
const showReopenOtpButton = ref(false)

// États OTP
const otpCode = ref('')
const otpTimer = ref(60)
const generatedOtp = ref('')
const isOtpGenerated = ref(false)
let otpInterval: number | null = null

// Notifications
const notifications = ref<Notification[]>([])

// ====================================================================
// COMPUTED PROPERTIES
// ====================================================================

const formValid = computed(() => {
  const data = formData.value
  const hasRequiredFields = !!(
    data.name &&
    data.companyName &&
    data.phone &&
    data.password &&
    data.confirmPassword &&
    data.city &&
    data.serviceType
  )

  const passwordsMatch = data.password === data.confirmPassword
  const passwordValid = data.password.length >= 6

  return hasRequiredFields && passwordsMatch && passwordValid
})

const passwordsMatch = computed(() => {
  return formData.value.password === formData.value.confirmPassword
})

// ====================================================================
// FONCTIONS D'AUTHENTIFICATION
// ====================================================================

const login = (user: User): void => {
  // Sauvegarder l'utilisateur dans localStorage
  localStorage.setItem('currentUser', JSON.stringify(user))
  localStorage.setItem('authToken', 'mock-jwt-token')
  
  // Mettre à jour les données partagées pour le DashboardLayout
  updateSharedUserData(user)
}

const updateSharedUserData = (user: User): void => {
  // Créer un événement personnalisé pour notifier le DashboardLayout
  const userUpdateEvent = new CustomEvent('userDataUpdated', {
    detail: { user }
  })
  window.dispatchEvent(userUpdateEvent)
  
  // Stocker aussi dans sessionStorage pour un accès immédiat
  sessionStorage.setItem('currentUserData', JSON.stringify(user))
}

const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('currentUser')
  return user ? JSON.parse(user) : null
}

// ====================================================================
// GESTION DES NOTIFICATIONS
// ====================================================================

const showNotification = (type: 'success' | 'error', title: string, message: string): void => {
  const notification: Notification = { type, title, message }
  notifications.value.push(notification)

  setTimeout(() => {
    removeNotification(notification)
  }, 5000)
}

const removeNotification = (notification: Notification): void => {
  const index = notifications.value.indexOf(notification)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// ====================================================================
// GESTION OTP
// ====================================================================

const generateOtp = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  generatedOtp.value = otp
  isOtpGenerated.value = true
  console.log('🔐 Code OTP généré:', otp)
  return otp
}

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
  if (otpCode.value !== generatedOtp.value) {
    showNotification('error', 'Code invalide', 'Le code OTP saisi est incorrect. Veuillez réessayer.')
    otpCode.value = ''
    return
  }

  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))

  try {
    const newUser = createUser()
    saveUser(newUser)
    login(newUser)

    showNotification('success', 'Inscription réussie', 'Bienvenue parmi nous ! Redirection vers votre Dashboard...')

    showOtpModal.value = false
    showReopenOtpButton.value = false
    resetOtp()
    
    setTimeout(() => {
      router.push('/Dashboard')
    }, 1500)
  } catch (error) {
    showNotification('error', 'Erreur', 'Une erreur est survenue lors de l\'inscription.')
  } finally {
    isLoading.value = false
    cleanupOtp()
  }
}

const resendOtp = (): void => {
  const otp = generateOtp()
  startOtpTimer()
  showNotification('success', 'Code renvoyé', `Un nouveau code OTP a été généré: ${otp}`)
}

const cancelOtp = (): void => {
  showOtpModal.value = false
  if (isOtpGenerated.value) {
    showReopenOtpButton.value = true
  }
}

const reopenOtpModal = (): void => {
  showOtpModal.value = true
  showReopenOtpButton.value = false
  
  if (otpTimer.value <= 0) {
    showNotification(
      'success',
      'Code disponible', 
      'Le code OTP précédent est toujours valable. Vous pouvez le renvoyer si besoin.'
    )
  }
}

const resetOtp = (): void => {
  otpCode.value = ''
  generatedOtp.value = ''
  otpTimer.value = 60
  isOtpGenerated.value = false
  if (otpInterval) {
    clearInterval(otpInterval)
    otpInterval = null
  }
}

const cleanupOtp = (): void => {
  if (otpInterval) {
    clearInterval(otpInterval)
  }
}

// ====================================================================
// GESTION DES UTILISATEURS
// ====================================================================

const createUser = (): User => {
  const data = formData.value
  const shopId = 'shop_' + Date.now()
  const userId = 'user_' + Date.now()

  const nameParts = data.name.trim().split(' ')
  const displayName = nameParts.slice(0, 2).join(' ')

  const defaultCompanyName = data.companyName || `${data.name} - ${getServiceLabel(data.serviceType)}`

  return {
    id: userId,
    name: data.name,
    displayName: displayName,
    first_name: nameParts[0] || '',
    last_name: nameParts.slice(1).join(' ') || '',
    companyName: defaultCompanyName,
    phone: data.phone,
    email: data.email || '', // Email laissé vide si non fourni
    password: data.password,
    serviceType: data.serviceType,
    type: data.serviceType,
    city: data.city,
    adresse: '',
    quartier: '',
    role: 'owner',
    isVerified: false,
    statut_kyc: 'non_verifie',
    phone_verified_at: new Date().toISOString(),
    date_inscription: new Date().toISOString(),
    currentShopId: shopId,
    shops: [
      {
        id: shopId,
        ownerId: userId,
        name: defaultCompanyName,
        category: data.serviceType,
        city: data.city,
        commune: '',
        adresse: '',
        prestations: [data.serviceType],
        mainPrestation: data.serviceType,
        managers: [],
        documents: {
          photos: [],
          identityPhoto: null,
          commercePermit: null,
        },
        locations: [
          {
            id: 'loc_' + Date.now(),
            latitude: 0,
            longitude: 0,
            address: data.city,
            isMain: true,
          }
        ],
        isVerified: false,
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
    ],
    bankAccounts: [],
    joinDate: new Date().toISOString(),
  }
}

const getServiceLabel = (serviceType: string): string => {
  const service = serviceTypes.find(s => s.value === serviceType)
  return service ? service.label : 'Service'
}

const saveUser = (user: User): void => {
  const existingUsers = JSON.parse(localStorage.getItem('presso_users') || '[]')
  existingUsers.push(user)
  localStorage.setItem('presso_users', JSON.stringify(existingUsers))
}

const userExists = (): boolean => {
  const existingUsers = JSON.parse(localStorage.getItem('presso_users') || '[]')
  const data = formData.value
  return existingUsers.some((user: User) =>
    user.phone === data.phone || (data.email && user.email === data.email)
  )
}

// ====================================================================
// GESTION DU FORMULAIRE
// ====================================================================

const handleSubmit = async (): Promise<void> => {
  if (!formValid.value) {
    showNotification(
      'error',
      'Formulaire invalide',
      'Veuillez remplir tous les champs requis et vérifier que les mots de passe correspondent'
    )
    return
  }

  if (formData.value.password.length < 6) {
    showNotification('error', 'Mot de passe invalide', 'Le mot de passe doit contenir au moins 6 caractères')
    return
  }

  if (userExists()) {
    showNotification('error', 'Compte existant', 'Ce numéro de téléphone ou email est déjà utilisé')
    return
  }

  isLoading.value = true

  await new Promise(resolve => setTimeout(resolve, 1500))

  try {
    if (!isOtpGenerated.value) {
      const otp = generateOtp()
      startOtpTimer()
    }
    
    showOtpModal.value = true
    showReopenOtpButton.value = false
  } catch (error) {
    showNotification('error', 'Erreur', 'Une erreur est survenue. Veuillez réessayer.')
  } finally {
    if (!showOtpModal.value) {
      isLoading.value = false
    }
  }
}

// ====================================================================
// FONCTIONS UTILITAIRES
// ====================================================================

const togglePasswordVisibility = (): void => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = (): void => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const goBack = (): void => {
  router.push('/')
}

const handleOverlayClick = (event: MouseEvent): void => {
  event.stopPropagation()
}

const copyOtpToClipboard = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(generatedOtp.value)
    showCopySuccess()
  } catch (err) {
    const textArea = document.createElement('textarea')
    textArea.value = generatedOtp.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showCopySuccess()
  }
}

const showCopySuccess = (): void => {
  const notification = document.createElement('div')
  notification.className = 'copy-success-notification'
  notification.innerHTML = `
    <div class="copy-success-content">
      <i class="fas fa-check-circle"></i>
      <span>Code OTP copié !</span>
    </div>
  `
  document.body.appendChild(notification)
  
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification)
    }
  }, 2000)
}

const onOtpInput = (): void => {
  if (otpCode.value.length === 6) {
    verifyOtp()
  }
}

const particleStyle = (index: number) => {
  const size = Math.random() * 6 + 2
  const duration = Math.random() * 20 + 10
  const delay = Math.random() * 5
  const opacity = Math.random() * 0.3 + 0.1

  return {
    width: `${size}px`,
    height: `${size}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    opacity: opacity.toString(),
    left: `${Math.random() * 100}%`,
  }
}

// ====================================================================
// LIFECYCLE HOOKS
// ====================================================================

onMounted(() => {
  console.log('Inscription.vue mounted')
})

onUnmounted(() => {
  cleanupOtp()
})
</script>

<style scoped src="@/DashboardGeneral/Assets/Styles/Authentification.css"></style>