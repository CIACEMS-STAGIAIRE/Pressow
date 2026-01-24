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
          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- ACCÈS RAPIDES (Toujours visibles) -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div class="quick-access" :class="{ 'quick-access-collapsed': isSidebarCollapsed }">
            <!-- Tableau de bord -->
            <button @click="navigateTo('/Dashboard')" :class="['quick-btn', { 'quick-btn-active': isActive('/Dashboard') }]" :title="isSidebarCollapsed ? 'Tableau de bord' : ''">
              <i class="fas fa-home"></i>
              <span v-if="!isSidebarCollapsed">Accueil</span>
            </button>
            <!-- Notifications (Cloche) -->
            <button @click="navigateTo('/dashboard/notifications')" :class="['quick-btn notification-btn', { 'quick-btn-active': isActive('/dashboard/notifications') }]" :title="isSidebarCollapsed ? 'Notifications' : ''">
              <i class="fas fa-bell"></i>
              <span v-if="!isSidebarCollapsed">Alertes</span>
              <div class="notification-badge" v-if="unreadNotifications > 0">{{ unreadNotifications }}</div>
            </button>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- MODULE: GESTION INTERNE -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div class="nav-module" v-if="!isSidebarCollapsed">
            <button class="module-header" @click="toggleModule('gestion')" :class="{ 'module-open': expandedModules.gestion }">
              <div class="module-icon">
                <i class="fas fa-tasks"></i>
              </div>
              <span class="module-title">Gestion Interne</span>
              <i class="fas fa-chevron-down module-chevron" :class="{ 'chevron-rotated': expandedModules.gestion }"></i>
            </button>
            <div class="module-content" v-show="expandedModules.gestion">
              <!-- Commandes -->
              <button @click="navigateToSubitem('/Dashboard/Commandes', 'gestion')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/Dashboard/Commandes') }]">
                <i class="fas fa-shopping-bag"></i>
                <span>Commandes</span>
                <div class="nav-badge" v-if="pendingOrdersCount > 0">{{ pendingOrdersCount }}</div>
              </button>
              <!-- Portefeuille -->
              <button v-if="!isManager" @click="navigateToSubitem('/dashboard/portefeuille', 'gestion')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/portefeuille') }]">
                <i class="fas fa-wallet"></i>
                <span>Portefeuille</span>
                <div class="nav-badge wallet-badge" v-if="walletBalance > 0">{{ walletBalance }}€</div>
              </button>
            </div>
          </div>
          <!-- Collapsed: Commandes icon only -->
          <button v-if="isSidebarCollapsed" @click="navigateTo('/Dashboard/Commandes')" :class="['nav-item', 'nav-item-collapsed', { 'nav-item-active': isActive('/Dashboard/Commandes') }]" title="Commandes">
            <div class="nav-icon"><i class="fas fa-shopping-bag"></i></div>
            <div class="nav-badge-collapsed" v-if="pendingOrdersCount > 0">{{ pendingOrdersCount }}</div>
          </button>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- MODULE: RELATION CLIENT -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div class="nav-module" v-if="!isSidebarCollapsed">
            <button class="module-header" @click="toggleModule('relation')" :class="{ 'module-open': expandedModules.relation }">
              <div class="module-icon">
                <i class="fas fa-users"></i>
              </div>
              <span class="module-title">Relation Client</span>
              <i class="fas fa-chevron-down module-chevron" :class="{ 'chevron-rotated': expandedModules.relation }"></i>
            </button>
            <div class="module-content" v-show="expandedModules.relation">
              <!-- Annuaire Clients -->
              <button @click="navigateToSubitem('/dashboard/clients', 'relation')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/clients') }]">
                <i class="fas fa-address-book"></i>
                <span>Annuaire Clients</span>
              </button>
              <!-- Avis & Témoignages -->
              <button @click="navigateToSubitem('/dashboard/avis', 'relation')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/avis') }]">
                <i class="fas fa-star"></i>
                <span>Avis & Témoignages</span>
                <div class="nav-badge rating-badge">{{ userRating }}</div>
              </button>
              <!-- Marketing -->
              <button @click="navigateToSubitem('/dashboard/marketing', 'relation')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/marketing') }]">
                <i class="fas fa-bullhorn"></i>
                <span>Marketing</span>
              </button>
            </div>
          </div>
          <!-- Collapsed: Relation Client icon only -->
          <button v-if="isSidebarCollapsed" @click="navigateTo('/dashboard/clients')" :class="['nav-item', 'nav-item-collapsed', { 'nav-item-active': isActive('/dashboard/clients') || isActive('/dashboard/avis') || isActive('/dashboard/marketing') }]" title="Relation Client">
            <div class="nav-icon"><i class="fas fa-users"></i></div>
          </button>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- MODULE: RESSOURCES HUMAINES -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div class="nav-module" v-if="!isSidebarCollapsed">
            <button class="module-header" @click="toggleModule('rh')" :class="{ 'module-open': expandedModules.rh }">
              <div class="module-icon">
                <i class="fas fa-user-tie"></i>
              </div>
              <span class="module-title">Ressources Humaines</span>
              <i class="fas fa-chevron-down module-chevron" :class="{ 'chevron-rotated': expandedModules.rh }"></i>
            </button>
            <div class="module-content" v-show="expandedModules.rh">
              <!-- Employés -->
              <button @click="navigateToSubitem('/dashboard/employes', 'rh')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/employes') }]">
                <i class="fas fa-id-badge"></i>
                <span>Employés</span>
              </button>
              <!-- Planning -->
              <button @click="navigateToSubitem('/dashboard/planning', 'rh')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/planning') }]">
                <i class="fas fa-calendar-alt"></i>
                <span>Planning</span>
              </button>
            </div>
          </div>
          <!-- Collapsed: RH icon only -->
          <button v-if="isSidebarCollapsed" @click="navigateTo('/dashboard/employes')" :class="['nav-item', 'nav-item-collapsed', { 'nav-item-active': isActive('/dashboard/employes') || isActive('/dashboard/planning') }]" title="Ressources Humaines">
            <div class="nav-icon"><i class="fas fa-user-tie"></i></div>
          </button>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- ANALYSE ET RAPPORTS (Direct - Style module) -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div class="nav-module-single" v-if="!isSidebarCollapsed">
            <button class="module-header module-single" @click="navigateTo('/dashboard/statistics')" :class="{ 'module-active': isActive('/dashboard/statistics') }">
              <div class="module-icon">
                <i class="fas fa-chart-pie"></i>
              </div>
              <span class="module-title">Analyse et Rapports</span>
            </button>
          </div>
          <!-- Collapsed: Analyse icon only -->
          <button v-if="isSidebarCollapsed" @click="navigateTo('/dashboard/statistics')" :class="['nav-item', 'nav-item-collapsed', { 'nav-item-active': isActive('/dashboard/statistics') }]" title="Analyse et Rapports">
            <div class="nav-icon"><i class="fas fa-chart-pie"></i></div>
          </button>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- MODULE: CONFIGURATION -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div class="nav-module" v-if="!isSidebarCollapsed">
            <button class="module-header" @click="toggleModule('config')" :class="{ 'module-open': expandedModules.config }">
              <div class="module-icon">
                <i class="fas fa-cog"></i>
              </div>
              <span class="module-title">Configuration</span>
              <i class="fas fa-chevron-down module-chevron" :class="{ 'chevron-rotated': expandedModules.config }"></i>
            </button>
            <div class="module-content" v-show="expandedModules.config">
              <!-- Mes Services -->
              <button @click="navigateToSubitem('/dashboard/services', 'config')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/services') }]">
                <i class="fas fa-concierge-bell"></i>
                <span>Mes Services</span>
              </button>
              <!-- Profil -->
              <button @click="navigateToSubitem('/dashboard/profile', 'config')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/profile') }]">
                <i class="fas fa-user"></i>
                <span>Profil</span>
              </button>
              <!-- Paramètres -->
              <button @click="navigateToSubitem('/dashboard/parametres', 'config')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/parametres') }]">
                <i class="fas fa-sliders-h"></i>
                <span>Paramètres</span>
              </button>
            </div>
          </div>
          <!-- Collapsed: Config icon only -->
          <button v-if="isSidebarCollapsed" @click="navigateTo('/dashboard/services')" :class="['nav-item', 'nav-item-collapsed', { 'nav-item-active': isActive('/dashboard/services') || isActive('/dashboard/profile') || isActive('/dashboard/parametres') }]" title="Configuration">
            <div class="nav-icon"><i class="fas fa-cog"></i></div>
          </button>
        </nav>

      </div>
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
import { useAuthStore } from '@/stores/auth'

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

interface Notification {
  id: string
  type: string
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: string
  meta?: {
    orderId?: string
    service?: string
    amount?: number
    customer?: string
  }
  actions?: Array<{
    type: string
    label: string
    icon: string
  }>
}

// ====================================================================
// ÉTATS RÉACTIFS
// ====================================================================

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// États de l'interface
const sidebarOpen = ref(false)
const showLogoutModal = ref(false)
const isLoggingOut = ref(false)
const isSidebarCollapsed = ref(false)
const notificationInterval = ref<number | null>(null)

// États des modules dépliables (initialisé vide, sera défini au montage)
const expandedModules = ref({
  gestion: false,
  relation: false,
  rh: false,
  config: false
})

// Mapping des routes vers les modules
const routeToModule: Record<string, 'gestion' | 'relation' | 'rh' | 'config'> = {
  '/Dashboard/Commandes': 'gestion',
  '/dashboard/portefeuille': 'gestion',
  '/dashboard/clients': 'relation',
  '/dashboard/avis': 'relation',
  '/dashboard/marketing': 'relation',
  '/dashboard/employes': 'rh',
  '/dashboard/planning': 'rh',
  '/dashboard/services': 'config',
  '/dashboard/profile': 'config',
  '/dashboard/parametres': 'config'
}

// Données utilisateur
const displayUser = ref<User | null>(null)
const activeShop = ref<Shop | null>(null)

// Données de navigation
const pendingOrdersCount = ref(0)
const userRating = ref('4.8')
const walletBalance = ref(125.50)
const unreadNotifications = ref(0)

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

// Fonction pour calculer le nombre de commandes en attente
const calculatePendingOrders = (): number => {
  try {
    const savedOrders = localStorage.getItem('presso_orders')
    if (savedOrders) {
      const orders = JSON.parse(savedOrders)
      return orders.filter((order: any) => order.status === 'pending').length
    }
  } catch (error) {
    console.error('Erreur lors du calcul des commandes en attente:', error)
  }
  return 0
}

// Fonction pour calculer le nombre de notifications non lues
const calculateUnreadNotifications = (): number => {
  try {
    const savedNotifications = localStorage.getItem('presso_notifications')
    if (savedNotifications) {
      const notifications = JSON.parse(savedNotifications)
      const unreadCount = notifications.filter((notification: any) => !notification.read).length
      console.log('Notifications non lues calculées:', unreadCount)
      return unreadCount
    }
  } catch (error) {
    console.error('Erreur lors du calcul des notifications non lues:', error)
  }
  return 0
}

// Fonction pour mettre à jour le compteur de commandes en attente
const updatePendingOrdersCount = (): void => {
  pendingOrdersCount.value = calculatePendingOrders()
}

// Fonction pour mettre à jour le compteur de notifications non lues
const updateUnreadNotificationsCount = (): void => {
  const count = calculateUnreadNotifications()
  unreadNotifications.value = count
  console.log('Compteur de notifications mis à jour:', count)
}

// ====================================================================
// GESTION GLOBALE DES NOTIFICATIONS
// ====================================================================

// Méthode pour simuler les notifications globalement
const simulateGlobalNotification = (): void => {
  if (Math.random() > 0.2) { // 80% de chance
    const types = [
      'order_new',
      'payment_received', 
      'system_alert',
      'order_completed',
      'service_added'
    ]
    
    const randomType = types[Math.floor(Math.random() * types.length)] as string
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: randomType,
      title: getRandomTitle(randomType),
      message: getRandomMessage(randomType),
      timestamp: new Date().toISOString(),
      read: false,
      priority: Math.random() > 0.7 ? 'high' : 'medium'
    }
    
    // Ajouter des métadonnées selon le type
    if (randomType === 'order_new') {
      newNotification.meta = {
        orderId: 'CMD' + (1000 + Math.floor(Math.random() * 900)),
        service: ['Nettoyage à sec', 'Repassage', 'Lavage'][Math.floor(Math.random() * 3)],
        amount: parseFloat((20 + Math.floor(Math.random() * 80)).toFixed(2)),
        customer: ['Marie', 'Pierre', 'Sophie', 'Jean'][Math.floor(Math.random() * 4)] + ' ' + ['Martin', 'Dubois', 'Lambert', 'Moreau'][Math.floor(Math.random() * 4)]
      }
      newNotification.actions = [
        { type: 'view_order', label: 'Voir la commande', icon: 'fas fa-eye' },
        { type: 'accept_order', label: 'Accepter', icon: 'fas fa-check' }
      ]
    } else if (randomType === 'payment_received') {
      newNotification.meta = {
        amount: parseFloat((50 + Math.floor(Math.random() * 200)).toFixed(2))
      }
    }
    
    addGlobalNotification(newNotification)
  }
}

const getRandomTitle = (type: string): string => {
  const titles: Record<string, string> = {
    'order_new': 'Nouvelle commande reçue',
    'payment_received': 'Paiement reçu',
    'system_alert': 'Alerte système',
    'order_completed': 'Commande terminée',
    'service_added': 'Nouveau service'
  }
  return titles[type] || 'Nouvelle notification'
}

const getRandomMessage = (type: string): string => {
  const messages: Record<string, string> = {
    'order_new': 'Une nouvelle commande a été créée pour vos services.',
    'payment_received': 'Un paiement a été crédité sur votre compte.',
    'system_alert': 'Une mise à jour système est disponible.',
    'order_completed': 'Une commande a été livrée avec succès.',
    'service_added': 'Un nouveau service a été configuré.'
  }
  return messages[type] || 'Vous avez une nouvelle notification.'
}

const addGlobalNotification = (newNotification: Notification): void => {
  try {
    const savedNotifications = localStorage.getItem('presso_notifications')
    let notifications = savedNotifications ? JSON.parse(savedNotifications) : []
    
    // Ajouter la nouvelle notification au début
    notifications.unshift(newNotification)
    
    // Sauvegarder dans localStorage
    localStorage.setItem('presso_notifications', JSON.stringify(notifications))
    
    // Émettre l'événement de mise à jour
    window.dispatchEvent(new CustomEvent('notificationsUpdated'))
    
    console.log('Nouvelle notification globale générée:', newNotification)
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la notification globale:', error)
  }
}

// Démarrer la simulation globale des notifications
const startGlobalNotificationSimulation = (): void => {
  // Nettoyer l'intervalle existant
  if (notificationInterval.value) {
    clearInterval(notificationInterval.value)
  }
  
  // Démarrer un nouvel intervalle (toutes les 30 secondes pour les tests)
  notificationInterval.value = setInterval(simulateGlobalNotification, 30000)
  
  console.log('Simulation globale des notifications démarrée')
}

// Arrêter la simulation
const stopGlobalNotificationSimulation = (): void => {
  if (notificationInterval.value) {
    clearInterval(notificationInterval.value)
    notificationInterval.value = null
    console.log('Simulation globale des notifications arrêtée')
  }
}

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

const toggleModule = (moduleName: 'gestion' | 'relation' | 'rh' | 'config') => {
  expandedModules.value[moduleName] = !expandedModules.value[moduleName]
  // Sauvegarder l'état dans localStorage
  saveModulesState()
}

const saveModulesState = () => {
  localStorage.setItem('expandedModules', JSON.stringify(expandedModules.value))
}

const loadModulesState = () => {
  const saved = localStorage.getItem('expandedModules')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      expandedModules.value = { ...expandedModules.value, ...parsed }
    } catch {
      // Ignorer les erreurs de parsing
    }
  }
}

const openModuleForCurrentRoute = () => {
  const currentPath = route.path
  const moduleName = routeToModule[currentPath]
  if (moduleName) {
    expandedModules.value[moduleName] = true
    saveModulesState()
  }
}

const navigateTo = (path: string) => {
  sidebarOpen.value = false
  router.push(path)
}

const navigateToSubitem = (path: string, moduleName: 'gestion' | 'relation' | 'rh' | 'config') => {
  sidebarOpen.value = false
  // Garder le module ouvert
  expandedModules.value[moduleName] = true
  saveModulesState()
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
    // Déconnexion via le store auth
    await authStore.logout()

    // Effacer les données locales
    localStorage.removeItem('userToken')
    localStorage.removeItem('currentUser')
    sessionStorage.removeItem('currentUserData')
    localStorage.removeItem('sidebarCollapsed')

    // Arrêter la simulation des notifications
    stopGlobalNotificationSimulation()

    // Réinitialiser les données affichées
    displayUser.value = null
    activeShop.value = null

    // Fermer le modal AVANT la redirection
    showLogoutModal.value = false
    isLoggingOut.value = false

    // Rediriger vers la page de connexion
    router.push('/Connexion')

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    // Même en cas d'erreur, on déconnecte l'utilisateur localement
    authStore.clearSession()
    showLogoutModal.value = false
    isLoggingOut.value = false
    router.push('/Connexion')
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

// Écouter les changements de statut des commandes
const handleOrderStatusChange = (event: CustomEvent) => {
  const { orderId, newStatus } = event.detail
  console.log(`Statut de la commande ${orderId} changé en: ${newStatus}`)
  updatePendingOrdersCount()
}

// Écouter les mises à jour des commandes
const handleOrdersUpdated = (event: CustomEvent) => {
  console.log('Commandes mises à jour, recalcul des commandes en attente')
  updatePendingOrdersCount()
}

// Écouter les mises à jour des notifications
const handleNotificationsUpdated = (event: CustomEvent) => {
  console.log('Notifications mises à jour, recalcul des notifications non lues')
  updateUnreadNotificationsCount()
}

// Écouter les changements de statut des notifications
const handleNotificationStatusChange = (event: CustomEvent) => {
  const { notificationId, read } = event.detail
  console.log(`Statut de la notification ${notificationId} changé en: ${read ? 'lu' : 'non lu'}`)
  updateUnreadNotificationsCount()
}

// Gestionnaire des changements de localStorage
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'presso_notifications') {
    console.log('Stockage localStorage des notifications modifié')
    updateUnreadNotificationsCount()
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

  // Charger l'état des modules dépliables
  loadModulesState()
  // Ouvrir le module correspondant à la route actuelle
  openModuleForCurrentRoute()

  // Calculer les compteurs initiaux
  updatePendingOrdersCount()
  updateUnreadNotificationsCount()

  // DÉMARRER LA SIMULATION GLOBALE DES NOTIFICATIONS
  startGlobalNotificationSimulation()

  // Écouter les mises à jour des données utilisateur
  window.addEventListener('userDataUpdated', handleUserDataUpdate as EventListener)

  // Écouter les changements de statut des commandes
  window.addEventListener('orderStatusChanged', handleOrderStatusChange as EventListener)
  
  // Écouter les mises à jour générales des commandes
  window.addEventListener('ordersUpdated', handleOrdersUpdated as EventListener)

  // Écouter les mises à jour des notifications
  window.addEventListener('notificationsUpdated', handleNotificationsUpdated as EventListener)
  window.addEventListener('notificationStatusChanged', handleNotificationStatusChange as EventListener)

  // Écouter le stockage localStorage pour les notifications
  window.addEventListener('storage', handleStorageChange)

  // Autres écouteurs d'événements
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)

  // Forcer une vérification initiale
  setTimeout(() => {
    updateUnreadNotificationsCount()
  }, 100)
})

onUnmounted(() => {
  // Arrêter la simulation des notifications
  stopGlobalNotificationSimulation()

  // Nettoyer les écouteurs d'événements
  window.removeEventListener('userDataUpdated', handleUserDataUpdate as EventListener)
  window.removeEventListener('orderStatusChanged', handleOrderStatusChange as EventListener)
  window.removeEventListener('ordersUpdated', handleOrdersUpdated as EventListener)
  window.removeEventListener('notificationsUpdated', handleNotificationsUpdated as EventListener)
  window.removeEventListener('notificationStatusChanged', handleNotificationStatusChange as EventListener)
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped src="@/Assets/AssetsCommun/DashboardLayout.css"></style>