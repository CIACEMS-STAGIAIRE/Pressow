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

      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-title">
            <span class="title-text">Connexion</span>
          </div>
          <p class="auth-description">
            Connectez-vous à votre espace prestataire
          </p>
        </div>
        <div class="auth-content">
          <form @submit.prevent="handleSubmit" class="auth-form">
            <div class="form-group-Section">
              <div class="form-group slide-in">
                <label for="login" class="form-label">Email ou numéro de téléphone</label>
                <div class="input-wrapper">
                  <i class="fas fa-user input-icon"></i>
                  <input id="login" name="login" v-model="formData.login"
                    placeholder="jean.dupont@example.com ou +33612345678" required class="form-input" />
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
            </div>

            <div class="submit-button-container">
              <button type="submit" class="submit-button" :class="{ glow: formValid }"
                :disabled="!formValid || isLoading">
                <span class="button-content">
                  <template v-if="isLoading">
                    <i class="fas fa-spinner fa-spin"></i>
                    Chargement...
                  </template>
                  <template v-else>
                    Se connecter
                    <i class="fas fa-arrow-right button-icon"></i>
                  </template>
                </span>
                <div class="button-shine"></div>
              </button>
            </div>
          </form>

          <div class="toggle-mode">
            <button @click="navigateToRegister" class="toggle-button">
              <span class="toggle-text">
                Pas encore de compte ? S'inscrire
              </span>
              <i class="fas fa-arrow-right toggle-icon"></i>
            </button>
          </div>
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
import { ref, computed, onMounted } from 'vue'
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

interface AuthFormData {
  login: string
  password: string
}

// ====================================================================
// ÉTATS RÉACTIFS
// ====================================================================

const router = useRouter()

// États du formulaire
const formData = ref<AuthFormData>({
  login: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)

// Notifications
const notifications = ref<Notification[]>([])

// ====================================================================
// COMPUTED PROPERTIES
// ====================================================================

const formValid = computed(() => {
  const data = formData.value
  const isValid = !!(data.login && data.password)
  return isValid
})

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

const findUserByLogin = (login: string, password: string): User | null => {
  const users = JSON.parse(localStorage.getItem('presso_users') || '[]')
  const mockUsers = getMockUsers()
  const allUsers = users.length ? users : mockUsers

  return allUsers.find((user: User) =>
    (user.phone === login || user.email === login) &&
    user.password === password
  ) || null
}

const getMockUsers = (): User[] => {
  return [
    {
      id: 'user_1',
      name: 'Jean Dupont',
      displayName: 'Jean Dupont',
      first_name: 'Jean',
      last_name: 'Dupont',
      companyName: 'Pressing Jean',
      phone: '+33612345678',
      email: 'jean.dupont@example.com',
      password: 'password123',
      serviceType: 'pressing-linge',
      type: 'pressing-linge',
      city: 'Abidjan',
      adresse: '',
      quartier: '',
      role: 'owner',
      isVerified: false,
      statut_kyc: 'non_verifie',
      phone_verified_at: new Date().toISOString(),
      date_inscription: new Date().toISOString(),
      currentShopId: 'shop_1',
      shops: [
        {
          id: 'shop_1',
          name: 'Pressing Jean',
          prestations: ['pressing-linge', 'blanchisserie']
        }
      ],
      bankAccounts: [],
      joinDate: new Date().toISOString(),
    },
  ]
}

// ====================================================================
// GESTION DU FORMULAIRE
// ====================================================================

const handleSubmit = async (): Promise<void> => {
  if (!formValid.value) {
    showNotification('error', 'Formulaire invalide', 'Veuillez remplir tous les champs requis')
    return
  }

  isLoading.value = true

  await new Promise(resolve => setTimeout(resolve, 1500))

  try {
    const user = findUserByLogin(formData.value.login, formData.value.password)

    if (user) {
      login(user)
      showNotification('success', 'Connexion réussie', 'Vous allez être redirigé vers votre Dashboard...')
    } else {
      showNotification('error', 'Échec de connexion', 'Email/téléphone ou mot de passe incorrect')
    }
  } catch (error) {
    showNotification('error', 'Erreur', 'Une erreur est survenue. Veuillez réessayer.')
  } finally {
    isLoading.value = false
  }
}

// ====================================================================
// FONCTIONS UTILITAIRES
// ====================================================================

const togglePasswordVisibility = (): void => {
  showPassword.value = !showPassword.value
}

// NOUVELLE FONCTION : Navigation vers register avec stockage du mode
const navigateToRegister = (): void => {
  localStorage.setItem('authMode', 'register')
  router.push('/inscription')
}

const goBack = (): void => {
  router.push('/')
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
  console.log('Connexion.vue mounted')
})
</script>

<style src="@/Auth/Authentification.css"></style>