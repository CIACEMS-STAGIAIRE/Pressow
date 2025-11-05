<template>
  <div class="Dashboard-layout">
    <!-- Main Content -->
    <main class="main-content" :class="{ 'main-content-expanded': isSidebarCollapsed }">
      <div class="content-wrapper">
        <slot></slot>
      </div>
    </main>
    <!-- Mobile Menu Button -->
    <div class="mobile-menu-btn">
      <button class="menu-toggle" @click="toggleSidebar">
        <i :class="sidebarOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
      </button>
    </div>

    <!-- Sidebar -->
    <aside :class="['sidebar', {
      'sidebar-open': sidebarOpen,
      'sidebar-collapsed': isSidebarCollapsed
    }]">
      <div class="sidebar-content">
        <!-- User Info -->
        <div class="user-info" :class="{ 'user-info-collapsed': isSidebarCollapsed }">
          <div class="user-info-container">
            <div class="user-avatar">
              {{ userInitial }}
            </div>
            <div class="user-details" v-if="!isSidebarCollapsed">
              <p class="user-name">{{ displayName }}</p>
              <p class="user-phone">{{ displayPhone }}</p>
            </div>
            <!-- Collapse Toggle Button -->
            <div class="collapse-toggle">
              <button class="collapse-btn" @click="toggleSidebarCollapse">
                <i :class="isSidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
              </button>
            </div>
          </div>

          <!-- Affichage des prestations de la boutique active -->
          <div v-if="!isSidebarCollapsed && activeShop && activeShop.prestations && activeShop.prestations.length > 0"
            class="prestations-section">
            <p class="prestations-title">Prestations proposées</p>
            <div class="prestations-list">
              <div v-for="prestation in activeShop.prestations" :key="prestation" class="prestation-badge"
                :class="getPrestationBadgeClass(prestation)">
                <i :class="getPrestationIcon(prestation)"></i>
                <span>{{ getPrestationLabel(prestation) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="nav-menu">
          <button @click="navigateTo('/Dashboard')" :class="['nav-item', {
            'nav-item-active': isActive('/Dashboard'),
            'nav-item-elevated': isActive('/Dashboard'),
            'nav-item-collapsed': isSidebarCollapsed
          }]" :title="isSidebarCollapsed ? 'Tableau de bord' : ''">
            <div class="nav-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <span class="nav-text" v-if="!isSidebarCollapsed">Tableau de bord</span>
            <div class="active-indicator" v-if="isActive('/Dashboard')"></div>
          </button>

          <button @click="navigateTo('/Commandes')" :class="['nav-item', {
            'nav-item-active': isActive('/Commandes'),
            'nav-item-elevated': isActive('/Commandes'),
            'nav-item-collapsed': isSidebarCollapsed
          }]" :title="isSidebarCollapsed ? 'Commandes' : ''">
            <div class="nav-icon">
              <i class="fas fa-shopping-bag"></i>
            </div>
            <span class="nav-text" v-if="!isSidebarCollapsed">Commandes</span>
            <div class="nav-badge" v-if="pendingOrders > 0 && !isSidebarCollapsed">{{ pendingOrders }}</div>
            <div class="nav-badge-collapsed" v-if="pendingOrders > 0 && isSidebarCollapsed">{{ pendingOrders }}</div>
            <div class="active-indicator" v-if="isActive('/Commandes')"></div>
          </button>

          <button @click="navigateTo('/Services')" :class="['nav-item', {
            'nav-item-active': isActive('/Services'),
            'nav-item-elevated': isActive('/Services'),
            'nav-item-collapsed': isSidebarCollapsed
          }]" :title="isSidebarCollapsed ? 'Mes Services' : ''">
            <div class="nav-icon">
              <i class="fas fa-concierge-bell"></i>
            </div>
            <span class="nav-text" v-if="!isSidebarCollapsed">Mes Services</span>
            <div class="active-indicator" v-if="isActive('/Services')"></div>
          </button>

          <!-- Nouvel onglet Statistiques -->
          <button @click="navigateTo('/Statistics')" :class="['nav-item', {
            'nav-item-active': isActive('/Statistics'),
            'nav-item-elevated': isActive('/Statistics'),
            'nav-item-collapsed': isSidebarCollapsed
          }]" :title="isSidebarCollapsed ? 'Mes Statistiques' : ''">
            <div class="nav-icon">
              <i class="fas fa-chart-bar"></i>
            </div>
            <span class="nav-text" v-if="!isSidebarCollapsed">Mes Statistiques</span>
            <div class="active-indicator" v-if="isActive('/Statistics')"></div>
          </button>

          <!-- Nouvel onglet Notifications -->
          <button @click="navigateTo('/Notifications')" :class="['nav-item', {
            'nav-item-active': isActive('/Notifications'),
            'nav-item-elevated': isActive('/Notifications'),
            'nav-item-collapsed': isSidebarCollapsed
          }]" :title="isSidebarCollapsed ? 'Notifications' : ''">
            <div class="nav-icon">
              <i class="fas fa-bell"></i>
            </div>
            <span class="nav-text" v-if="!isSidebarCollapsed">Notifications</span>
            <div class="nav-badge" v-if="unreadNotifications > 0 && !isSidebarCollapsed">{{ unreadNotifications }}</div>
            <div class="nav-badge-collapsed" v-if="unreadNotifications > 0 && isSidebarCollapsed">{{ unreadNotifications
              }}</div>
            <div class="active-indicator" v-if="isActive('/Notifications')"></div>
          </button>

          <!-- Nouvel onglet Portefeuille (caché pour les managers) -->
          <button v-if="!isManager" @click="navigateTo('/Portefeuille')" :class="['nav-item', {
            'nav-item-active': isActive('/Portefeuille'),
            'nav-item-elevated': isActive('/Portefeuille'),
            'nav-item-collapsed': isSidebarCollapsed
          }]" :title="isSidebarCollapsed ? 'Mon Portefeuille' : ''">
            <div class="nav-icon">
              <i class="fas fa-wallet"></i>
            </div>
            <span class="nav-text" v-if="!isSidebarCollapsed">Mon Portefeuille</span>
            <div class="nav-badge wallet-badge" v-if="walletBalance > 0 && !isSidebarCollapsed">€{{ walletBalance }}
            </div>
            <div class="nav-badge-collapsed wallet-badge" v-if="walletBalance > 0 && isSidebarCollapsed">€</div>
            <div class="active-indicator" v-if="isActive('/Portefeuille')"></div>
          </button>

          <!-- Nouvel onglet Avis -->
          <button @click="navigateTo('/Avis')" :class="['nav-item', {
            'nav-item-active': isActive('/Avis'),
            'nav-item-elevated': isActive('/Avis'),
            'nav-item-collapsed': isSidebarCollapsed
          }]" :title="isSidebarCollapsed ? 'Mes Avis' : ''">
            <div class="nav-icon">
              <i class="fas fa-star"></i>
            </div>
            <span class="nav-text" v-if="!isSidebarCollapsed">Mes Avis</span>
            <div class="nav-badge rating-badge" v-if="!isSidebarCollapsed">{{ userRating }}</div>
            <div class="nav-badge-collapsed rating-badge" v-if="isSidebarCollapsed">{{ userRating }}</div>
            <div class="active-indicator" v-if="isActive('/Avis')"></div>
          </button>

          <!-- Nouvel onglet Profile -->
          <button @click="navigateTo('/Profile')" :class="['nav-item', {
            'nav-item-active': isActive('/Profile'),
            'nav-item-elevated': isActive('/Profile'),
            'nav-item-collapsed': isSidebarCollapsed
          }]" :title="isSidebarCollapsed ? 'Profil' : ''">
            <div class="nav-icon">
              <i class="fas fa-user"></i>
            </div>
            <span class="nav-text" v-if="!isSidebarCollapsed">Profil</span>
            <div class="active-indicator" v-if="isActive('/Profile')"></div>
          </button>

          <!-- Nouvel onglet Paramètres -->
          <button @click="navigateTo('/Parametres')" :class="['nav-item', {
            'nav-item-active': isActive('/Parametres'),
            'nav-item-elevated': isActive('/Parametres'),
            'nav-item-collapsed': isSidebarCollapsed
          }]" :title="isSidebarCollapsed ? 'Paramètres' : ''">
            <div class="nav-icon">
              <i class="fas fa-cog"></i>
            </div>
            <span class="nav-text" v-if="!isSidebarCollapsed">Paramètres</span>
            <div class="active-indicator" v-if="isActive('/Parametres')"></div>
          </button>
        </nav>

        <!-- Logout Button -->
        <div class="sidebar-footer" :class="{ 'sidebar-footer-collapsed': isSidebarCollapsed }">
          <button class="logout-btn" @click="handleLogout" :disabled="isLoggingOut"
            :title="isSidebarCollapsed ? 'Déconnexion' : ''">
            <div class="logout-icon">
              <i class="fas fa-sign-out-alt"></i>
            </div>
            <span class="logout-text" v-if="!isSidebarCollapsed">
              {{ isLoggingOut ? 'Déconnexion...' : 'Déconnexion' }}
            </span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <i class="fas fa-sign-out-alt modal-icon"></i>
          <h3>Confirmer la déconnexion</h3>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir vous déconnecter de votre compte ?</p>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showLogoutModal = false">
            Annuler
          </button>
          <button class="confirm-logout-btn" @click="confirmLogout" :disabled="isLoggingOut">
            <i class="fas fa-sign-out-alt"></i>
            {{ isLoggingOut ? 'Déconnexion...' : 'Se déconnecter' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

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

interface Shop {
  id: string
  name: string
  prestations: string[]
}

// ====================================================================
// ÉTATS RÉACTIFS
// ====================================================================

const router = useRouter()
const route = useRoute()

// États de l'interface
const sidebarOpen = ref(false)
const showLogoutModal = ref(false)
const isLoggingOut = ref(false)
const isSidebarCollapsed = ref(false)

// Données utilisateur
const displayUser = ref<User | null>(null)
const activeShop = ref<Shop | null>(null)

// Données de navigation
const pendingOrders = ref(3)
const userRating = ref('4.8')
const walletBalance = ref(125.50)
const unreadNotifications = ref(5) // ← Nouvel état pour les notifications

// ====================================================================
// COMPUTED PROPERTIES
// ====================================================================

const userInitial = computed(() => {
  return displayUser.value?.name?.charAt(0).toUpperCase() || 'U'
})

const displayName = computed(() => {
  return displayUser.value?.displayName || displayUser.value?.name || 'Utilisateur'
})

const displayPhone = computed(() => {
  return displayUser.value?.phone || 'Non renseigné'
})

const isManager = computed(() => {
  return displayUser.value?.role === 'manager'
})

// ====================================================================
// FONCTIONS UTILITAIRES
// ====================================================================

const loadUserData = (): void => {
  // Essayer d'abord depuis sessionStorage (données fraîches)
  const sessionUser = sessionStorage.getItem('currentUserData')
  if (sessionUser) {
    displayUser.value = JSON.parse(sessionUser)
    updateActiveShop()
    return
  }

  // Sinon charger depuis localStorage
  const localUser = localStorage.getItem('currentUser')
  if (localUser) {
    displayUser.value = JSON.parse(localUser)
    updateActiveShop()
  }
}

const updateActiveShop = (): void => {
  if (displayUser.value?.shops && displayUser.value.shops.length > 0) {
    activeShop.value = displayUser.value.shops[0]
  }
}

const getServiceLabel = (serviceType: string): string => {
  const services: Record<string, string> = {
    'pressing-linge': 'Pressing Linge',
    'pressing-chaussures': 'Pressing Chaussures',
    'blanchisserie': 'Blanchisserie',
    'laverie': 'Laverie',
    'fanico': 'Fanico',
    'nettoyage': 'Nettoyage'
  }
  return services[serviceType] || serviceType
}

// Fonctions pour les prestations
const getPrestationLabel = (prestation: string) => {
  const labels: Record<string, string> = {
    'pressing': 'Pressing',
    'pressing-linge': 'Pressing Linge',
    'pressing_lingerie': 'Pressing Lingerie',
    'pressing-chaussures': 'Pressing Chaussures',
    'pressing_chaussures': 'Pressing Chaussures',
    'blanchisserie': 'Blanchisserie',
    'laverie': 'Laverie',
    'fanico': 'Fanico',
    'nettoyage': 'Nettoyage'
  };
  return labels[prestation] || prestation;
};

const getPrestationIcon = (prestation: string) => {
  const icons: Record<string, string> = {
    'pressing': 'fas fa-tshirt',
    'pressing-linge': 'fas fa-tshirt',
    'pressing_lingerie': 'fas fa-tshirt',
    'pressing-chaussures': 'fas fa-shoe-prints',
    'pressing_chaussures': 'fas fa-shoe-prints',
    'blanchisserie': 'fas fa-wind',
    'laverie': 'fas fa-soap',
    'fanico': 'fas fa-home',
    'nettoyage': 'fas fa-broom'
  };
  return icons[prestation] || 'fas fa-concierge-bell';
};

const getPrestationBadgeClass = (prestation: string) => {
  const classes: Record<string, string> = {
    'pressing': 'prestation-badge-blue',
    'pressing-linge': 'prestation-badge-blue',
    'pressing_lingerie': 'prestation-badge-blue',
    'pressing-chaussures': 'prestation-badge-indigo',
    'pressing_chaussures': 'prestation-badge-indigo',
    'blanchisserie': 'prestation-badge-purple',
    'laverie': 'prestation-badge-green',
    'fanico': 'prestation-badge-orange',
    'nettoyage': 'prestation-badge-teal'
  };
  return classes[prestation] || 'prestation-badge-blue';
};

// ====================================================================
// GESTION DE L'INTERFACE
// ====================================================================

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const toggleSidebarCollapse = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  // Sauvegarder l'état dans localStorage
  localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed.value))
}

const navigateTo = (path: string) => {
  sidebarOpen.value = false
  router.push(path)
}

const isActive = (path: string) => {
  return route.path === path
}

const handleLogout = () => {
  showLogoutModal.value = true
}

const confirmLogout = async () => {
  isLoggingOut.value = true

  try {
    // Simuler une déconnexion asynchrone
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Effacer les données utilisateur
    localStorage.removeItem('userToken')
    localStorage.removeItem('currentUser')
    sessionStorage.removeItem('currentUserData')
    localStorage.removeItem('sidebarCollapsed')

    // Réinitialiser les données affichées
    displayUser.value = null
    activeShop.value = null

    // Rediriger vers la page de connexion
    router.push('/Connexion')

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  } finally {
    isLoggingOut.value = false
    showLogoutModal.value = false
  }
}

// ====================================================================
// GESTION DES ÉVÉNEMENTS
// ====================================================================

const handleUserDataUpdate = (event: CustomEvent) => {
  if (event.detail.user) {
    displayUser.value = event.detail.user
    updateActiveShop()
  }
}

const handleResize = () => {
  if (window.innerWidth >= 1024) {
    sidebarOpen.value = false
  }
  // Sur mobile, désactiver le mode réduit
  if (window.innerWidth < 1024) {
    isSidebarCollapsed.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && sidebarOpen.value) {
    sidebarOpen.value = false
  }
}

// ====================================================================
// LIFECYCLE HOOKS
// ====================================================================

onMounted(() => {
  // Charger les données utilisateur au montage
  loadUserData()

  // Charger l'état du sidebar depuis localStorage
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState) {
    isSidebarCollapsed.value = JSON.parse(savedState)
  }

  // Écouter les mises à jour des données utilisateur
  window.addEventListener('userDataUpdated', handleUserDataUpdate as EventListener)

  // Autres écouteurs d'événements
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // Nettoyer les écouteurs d'événements
  window.removeEventListener('userDataUpdated', handleUserDataUpdate as EventListener)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped src="@/DashboardGeneral/Assets/Styles/DashboardLayout.css"></style>