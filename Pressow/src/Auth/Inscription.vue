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
            <div class="form-group-Section">
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

              <!-- CHAMP VILLE MODIFIÉ : Input text avec suggestions -->
              <div class="form-group fade-in">
                <label for="city" class="form-label">Ville</label>
                <div class="input-wrapper">
                  <i class="fas fa-map-marker-alt input-icon"></i>
                  <input 
                    id="city" 
                    name="city" 
                    v-model="formData.city" 
                    @input="onCityInput"
                    @focus="showCitySuggestions = true"
                    @blur="onCityBlur"
                    placeholder="Commencez à taper le nom de votre ville..."
                    required 
                    class="form-input" 
                    list="citySuggestions"
                    autocomplete="off"
                  />
                  <!-- Liste des suggestions -->
                  <div v-if="showCitySuggestions && filteredCities.length > 0" class="city-suggestions">
                    <div 
                      v-for="city in filteredCities" 
                      :key="city.name"
                      @mousedown="selectCity(city.name)"
                      class="suggestion-item"
                    >
                      <i class="fas fa-map-marker-alt suggestion-icon"></i>
                      <span class="suggestion-text">{{ city.name }}</span>
                    </div>
                  </div>
                </div>
                <div class="input-hint">
                  <i class="fas fa-info-circle"></i>
                  Sélectionnez une ville dans la liste ou tapez le nom de votre ville
                </div>
              </div>
            </div>

            <div class="submit-button-container">
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
            </div>
          </form>

          <div class="toggle-mode">
            <button @click="navigateToLogin" class="toggle-button">
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
  { name: 'Bondoukou' },
  { name: 'Man' },
  { name: 'Oumé' },
  { name: 'Sinfra' },
  { name: 'Katiola' },
  { name: 'Ferkessédougou' },
  { name: 'Odienné' },
  { name: 'Séguéla' },
  { name: 'Toumodi' },
  { name: 'Tiassalé' },
  { name: 'Akoupé' },
  { name: 'Alépé' },
  { name: 'Issia' },
  { name: 'Duékoué' },
  { name: 'Guiglo' },
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

// États pour les suggestions de ville
const showCitySuggestions = ref(false)
const citySearchTerm = ref('')

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

// NOUVEAU : Filtrage des villes basé sur la recherche
const filteredCities = computed(() => {
  if (!citySearchTerm.value) {
    return cities.slice(0, 8) // Afficher les 8 premières villes par défaut
  }
  
  const searchTerm = citySearchTerm.value.toLowerCase()
  return cities
    .filter(city => city.name.toLowerCase().includes(searchTerm))
    .slice(0, 10) // Limiter à 10 résultats
})

// ====================================================================
// FONCTIONS D'AUTHENTIFICATION
// ====================================================================

const redirectBasedOnService = (serviceType: string): void => {
  // Services qui doivent aller vers DashboardOthers
  const otherServices = ['fanico', 'nettoyage']
  
  if (otherServices.includes(serviceType)) {
    setTimeout(() => {
      router.push('/DashboardOthers')
    }, 1500)
  } else {
    setTimeout(() => {
      router.push('/Dashboard')
    }, 1500)
  }
}

const login = (user: User): void => {
  // Sauvegarder l'utilisateur dans localStorage
  localStorage.setItem('currentUser', JSON.stringify(user))
  localStorage.setItem('authToken', 'mock-jwt-token')

  // Mettre à jour les données partagées pour le DashboardLayout
  updateSharedUserData(user)
  
  // Redirection basée sur le type de service
  redirectBasedOnService(user.serviceType)
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

// NOUVELLE FONCTION : Initialiser toutes les données par défaut
const initializeDefaultData = (): void => {
  // Initialiser les services par défaut
  const defaultServices = getDefaultServices()
  localStorage.setItem('presso_services', JSON.stringify(defaultServices))

  // Initialiser les commandes par défaut
  const defaultOrders = getDefaultOrders()
  localStorage.setItem('presso_orders', JSON.stringify(defaultOrders))

  console.log('✅ Données initialisées :', {
    services: defaultServices.length,
    orders: defaultOrders.length
  })
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
    
    // NOUVEAU : Initialiser toutes les données par défaut AVANT la connexion
    initializeDefaultData()
    
    login(newUser)

    showNotification('success', 'Inscription réussie', 'Bienvenue parmi nous ! Redirection vers votre Dashboard...')

    showOtpModal.value = false
    showReopenOtpButton.value = false
    resetOtp()
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
// FONCTIONS POUR LES DONNÉES PAR DÉFAUT (COPIÉES DE COMMANDES.VUE)
// ====================================================================

const getDefaultServices = () => {
  return [
    {
      id: 'SRV001',
      name: 'Nettoyage à sec',
      category: 'pressing',
      price: 12.0,
      duration: '48h',
      description: 'Nettoyage professionnel à sec pour tous types de vêtements',
      active: true,
    },
    {
      id: 'SRV002',
      name: 'Repassage',
      category: 'pressing',
      price: 8.0,
      duration: '24h',
      description: 'Repassage soigné et professionnel',
      active: true,
    },
    {
      id: 'SRV003',
      name: 'Lavage et repassage',
      category: 'laverie',
      price: 15.0,
      duration: '48h',
      description: 'Service complet de lavage et repassage',
      active: true,
    },
  ]
}

const getDefaultOrders = () => {
  const getTodayDate = (): string => {
    const today = new Date()
    return today.toISOString().split('T')[0]!
  }

  const getFutureDate = (daysToAdd: number): string => {
    const date = new Date()
    date.setDate(date.getDate() + daysToAdd)
    return date.toISOString().split('T')[0]!
  }

  const today = getTodayDate()
  
  return [
    {
      id: 'CMD001',
      serviceType: 'SRV001',
      items: ['Chemise blanche', 'Pantalon costume', 'Robe de soirée'],
      itemsWithQuantities: [
        { name: 'Chemise blanche', quantity: 2, price: 8.0 },
        { name: 'Pantalon costume', quantity: 1, price: 12.0 },
        { name: 'Robe de soirée', quantity: 1, price: 25.0 },
      ],
      totalItems: 4,
      address: '25 Avenue des Champs, Paris 75008',
      deliveryDate: getFutureDate(2),
      deliveryTime: '14:00-16:00',
      price: 45.0,
      status: 'pending',
      createdAt: `${today}T10:30:00`,
      specialInstructions: 'Urgent - Évènement important',
      customer: {
        name: 'Jean Dupont',
        phone: '+33 6 12 34 56 78'
      }
    },
    {
      id: 'CMD002',
      serviceType: 'SRV002',
      items: ['Costume 2 pièces', 'Cravate'],
      itemsWithQuantities: [
        { name: 'Costume 2 pièces', quantity: 1, price: 30.0 },
        { name: 'Cravate', quantity: 2, price: 5.0 }
      ],
      totalItems: 3,
      address: '10 Boulevard Saint-Germain, Paris 75005',
      deliveryDate: getFutureDate(1),
      deliveryTime: '16:00-18:00',
      price: 40.0,
      status: 'accepted',
      createdAt: `${today}T14:20:00`,
      specialInstructions: 'Repassage soigné',
      customer: {
        name: 'Marie Martin',
        phone: '+33 6 98 76 54 32'
      },
      statusHistory: [
        { status: 'accepted', label: 'Commande acceptée', timestamp: `${today}T15:00:00` }
      ]
    },
    {
      id: 'CMD003',
      serviceType: 'SRV003',
      items: ['Linge de maison'],
      itemsWithQuantities: [
        { name: 'Linge de maison', quantity: 8, price: 7.5 }
      ],
      totalItems: 8,
      address: '5 Rue Victor Hugo, Paris 75016',
      deliveryDate: getFutureDate(3),
      price: 60.0,
      status: 'completed',
      createdAt: `${today}T09:15:00`,
      customer: {
        name: 'Pierre Lambert',
        phone: '+33 6 45 67 89 01'
      },
      statusHistory: [
        { status: 'accepted', label: 'Commande acceptée', timestamp: `${today}T10:00:00` },
        { status: 'completed', label: 'Commande terminée', timestamp: `${today}T16:00:00` }
      ]
    },
    {
      id: 'CMD004',
      serviceType: 'SRV001',
      items: ['Veste en cuir', 'Pull en laine'],
      itemsWithQuantities: [
        { name: 'Veste en cuir', quantity: 1, price: 25.0 },
        { name: 'Pull en laine', quantity: 3, price: 15.0 }
      ],
      totalItems: 4,
      address: '15 Rue de Rivoli, Paris 75004',
      deliveryDate: getFutureDate(4),
      requestedDate: getFutureDate(1),
      requestedTime: '11:00-13:00',
      price: 70.0,
      status: 'refused',
      createdAt: `${today}T11:00:00`,
      refusalReason: 'Service non disponible pour les articles en cuir',
      refusedAt: `${today}T14:30:00`,
      customer: {
        name: 'Sophie Bernard',
        phone: '+33 6 23 45 67 89'
      }
    },
    {
      id: 'CMD005',
      serviceType: 'SRV002',
      items: ['Chemisier soie', 'Jupe lin'],
      itemsWithQuantities: [
        { name: 'Chemisier soie', quantity: 2, price: 18.0 },
        { name: 'Jupe lin', quantity: 1, price: 22.0 }
      ],
      totalItems: 3,
      address: '8 Avenue Montaigne, Paris 75008',
      deliveryDate: getFutureDate(2),
      deliveryTime: '09:00-11:00',
      price: 58.0,
      status: 'pending',
      createdAt: `${today}T16:45:00`,
      specialInstructions: 'Attention aux tissus délicats',
      customer: {
        name: 'Claire Dubois',
        phone: '+33 6 34 56 78 90'
      }
    },
    {
      id: 'CMD006',
      serviceType: 'SRV003',
      items: ['Couettes', 'Draps', 'Taies d\'oreiller'],
      itemsWithQuantities: [
        { name: 'Couettes', quantity: 2, price: 35.0 },
        { name: 'Draps', quantity: 4, price: 12.0 },
        { name: 'Taies d\'oreiller', quantity: 8, price: 6.0 }
      ],
      totalItems: 14,
      address: '22 Rue du Faubourg Saint-Honoré, Paris 75008',
      deliveryDate: getFutureDate(5),
      price: 150.0,
      status: 'accepted',
      createdAt: `${today}T13:20:00`,
      customer: {
        name: 'Hôtel Plaza',
        phone: '+33 1 42 68 90 12'
      },
      statusHistory: [
        { status: 'accepted', label: 'Commande acceptée', timestamp: `${today}T14:00:00` }
      ]
    },
    {
      id: 'CMD007',
      serviceType: 'SRV001',
      items: ['Costume trois pièces', 'Chemise blanche'],
      itemsWithQuantities: [
        { name: 'Costume trois pièces', quantity: 1, price: 45.0 },
        { name: 'Chemise blanche', quantity: 3, price: 9.0 }
      ],
      totalItems: 4,
      address: '3 Place de la Concorde, Paris 75008',
      deliveryDate: getFutureDate(3),
      deliveryTime: '17:00-19:00',
      price: 72.0,
      status: 'completed',
      createdAt: `${today}T08:30:00`,
      customer: {
        name: 'Thomas Moreau',
        phone: '+33 6 78 90 12 34'
      },
      statusHistory: [
        { status: 'accepted', label: 'Commande acceptée', timestamp: `${today}T09:15:00` },
        { status: 'completed', label: 'Commande terminée', timestamp: `${today}T16:45:00` }
      ]
    },
    {
      id: 'CMD008',
      serviceType: 'SRV002',
      items: ['Robe de mariée'],
      itemsWithQuantities: [
        { name: 'Robe de mariée', quantity: 1, price: 120.0 }
      ],
      totalItems: 1,
      address: '45 Avenue George V, Paris 75008',
      deliveryDate: getFutureDate(7),
      price: 120.0,
      status: 'pending',
      createdAt: `${today}T15:10:00`,
      specialInstructions: 'TRÈS URGENT - Mariée samedi prochain',
      customer: {
        name: 'Élodie Petit',
        phone: '+33 6 91 23 45 67'
      }
    },
    {
      id: 'CMD009',
      serviceType: 'SRV003',
      items: ['Serviettes de bain', 'Nappes'],
      itemsWithQuantities: [
        { name: 'Serviettes de bain', quantity: 12, price: 8.0 },
        { name: 'Nappes', quantity: 6, price: 15.0 }
      ],
      totalItems: 18,
      address: '18 Rue de la Paix, Paris 75002',
      deliveryDate: getFutureDate(4),
      price: 186.0,
      status: 'accepted',
      createdAt: `${today}T11:45:00`,
      customer: {
        name: 'Restaurant Le Gourmet',
        phone: '+33 1 40 20 30 40'
      },
      statusHistory: [
        { status: 'accepted', label: 'Commande acceptée', timestamp: `${today}T12:30:00` }
      ]
    }
  ]
}

// ====================================================================
// GESTION DU CHAMP VILLE AVEC SUGGESTIONS
// ====================================================================

const onCityInput = (event: Event): void => {
  const target = event.target as HTMLInputElement
  citySearchTerm.value = target.value
  showCitySuggestions.value = true
}

const onCityBlur = (): void => {
  // Utiliser setTimeout pour permettre le clic sur les suggestions
  setTimeout(() => {
    showCitySuggestions.value = false
  }, 200)
}

const selectCity = (cityName: string): void => {
  formData.value.city = cityName
  citySearchTerm.value = cityName
  showCitySuggestions.value = false
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

// NOUVELLE FONCTION : Navigation vers login avec stockage du mode
const navigateToLogin = (): void => {
  localStorage.setItem('authMode', 'login')
  router.push('/connexion')
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

<style scoped src="@/Auth/Authentification.css"></style>