<template>
  <DashboardLayout>
    <div class="dashboard">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <div class="welcome-content">
          <div class="welcome-text">
            <h1 class="welcome-title">Bienvenue, {{ user?.name || 'Utilisateur' }} !</h1>
            <p class="welcome-subtitle">Voici un aperçu de votre activité</p>
            <!-- Affichage du nom de la boutique -->
            <div class="shop-name-display" v-if="userShopName">
              <i class="fas fa-store shop-icon"></i>
              <span class="shop-name">{{ userShopName }}</span>
            </div>
          </div>
          <div class="welcome-icon">
            <i class="fas fa-chart-line"></i>
          </div>
        </div>
        <div class="welcome-stats">
          <div class="welcome-stat">
            <i class="fas fa-calendar-day"></i>
            <span>Aujourd'hui</span>
          </div>
          <div class="welcome-stat">
            <i class="fas fa-money-bill-wave"></i>
            <span>{{ formatCurrency(todayStats.revenue) }} FCFA</span>
          </div>
          <div class="welcome-stat">
            <i class="fas fa-box"></i>
            <span>{{ todayStats.orders }} commandes</span>
          </div>
        </div>
      </div>

      <!-- Order Status Stats -->
      <div class="stats-section">
        <h2 class="section--title">
          <i class="fas fa-tasks section-icon"></i>
          État des Commandes
        </h2>
        <div class="status-grid">
          <div v-for="(stat, index) in statusStats" :key="index" :class="['status-card', stat.cardClass]">
            <div class="status-content">
              <div :class="['status-icon', stat.bgColor]">
                <i :class="stat.icon"></i>
              </div>
              <div class="status-info">
                <p class="status-label">{{ stat.title }}</p>
                <p class="status-value">{{ stat.value }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="recent-orders-card">
        <div class="recent-orders-header">
          <div class="header-content">
            <div class="header-title">
              <i class="fas fa-clock header-icon"></i>
              <h3>Commandes Récentes</h3>
            </div>
            <div class="header-actions">
              <router-link to="/CommandesOthers">
                <button class="view-all-btn">
                  <i class="fas fa-list"></i>Voir tout
                </button>
              </router-link>
            </div>
          </div>
        </div>
        <div class="orders-content">
          <!-- Utilisation du même design que la page Orders -->
          <div class="orders-list">

            <!-- Cartes des commandes - Même structure que Commandes.vue mais sans sélection/suppression -->
            <div v-for="order in recentOrders" :key="order.id" class="orders-order-card" @click="openOrderDetails(order)">
              <div class="card-content">
                <div class="order-header">
                  <div class="order-header-left">
                    <div>
                      <div class="order-id-section">
                        <h3 class="order-id">#{{ order.id }}</h3>
                        <div class="badges-container">
                          <span :class="['status-badge', getStatusBadgeClass(order.status)]">
                            <i :class="getStatusIcon(order.status)"></i>
                            {{ getStatusLabel(order.status) }}
                          </span>
                          <span :class="['service-badge', getServiceBadgeClass(order.serviceType)]">
                            <i :class="getServiceIcon(order.serviceType)"></i>
                            {{ getServiceLabel(order.serviceType) }}
                          </span>
                        </div>
                      </div>
                      <p class="order-date">{{ formatDateTime(order.createdAt) }}</p>
                    </div>
                  </div>
                  <div class="order-header-actions">
                    <button class="BtnGlobal2 details-btn" @click.stop="openOrderDetails(order)">
                      <i class="fas fa-eye"></i>
                      Détails
                    </button>
                  </div>
                </div>

                <div class="order-body">
                  <div class="order-info-col">
                    <!-- Nombre total d'articles -->
                    <div class="order-info-row">
                      <span class="order-info-label">
                        <i class="fas fa-box"></i>
                        Articles:
                      </span>
                      <span class="order-info-value">{{ order.totalItems }} article(s)</span>
                    </div>

                    <!-- Adresse unique (collecte = livraison) -->
                    <div class="order-info-row">
                      <span class="order-info-label">
                        <i class="fas fa-map-marker-alt"></i>
                        Adresse:
                      </span>
                      <span class="order-info-value">{{ order.address }}</span>
                    </div>

                    <!-- Date de livraison -->
                    <div v-if="order.status !== 'refused'" class="order-info-row">
                      <span class="order-info-label">
                        <i class="fas fa-calendar-alt"></i>
                        Livraison:
                      </span>
                      <span class="order-info-value">
                        {{ formatDate(order.deliveryDate) }}
                        <span v-if="order.deliveryTime" class="delivery-time">à {{ order.deliveryTime }}</span>
                      </span>
                    </div>

                    <!-- Motif de refus -->
                    <div class="refusal-info" v-if="order.status === 'refused' && order.refusalReason">
                      <div class="order-info-row">
                        <span class="order-info-label refusal-label">
                          <i class="fas fa-exclamation-triangle"></i>
                          Motif de refus:
                        </span>
                        <span class="refusal-reason">{{ order.refusalReason }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="order-info-col-right">
                    <p class="order-price">
                      <i class="fas fa-money-bill-wave"></i>
                      {{ formatCurrency(order.price) }} FCFA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- État vide -->
            <div v-if="recentOrders.length === 0" class="empty-state">
              <div class="card-content">
                <div class="empty-icon">
                  <i class="fas fa-box-open"></i>
                </div>
                <p class="empty-message">Aucune commande récente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal des détails de commande - Même logique que Commandes.vue -->
      <div v-if="selectedOrder" class="modal-overlay" @click="closeOrderDetails">
        <div class="modern-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title-section">
              <div class="modal-title-info">
                <div class="modal-icon">
                  <i class="fas fa-receipt"></i>
                </div>
                <div class="modal-title-content">
                  <h2 class="modal-title">Commande #{{ selectedOrder.id }}</h2>
                  <p class="modal-subtitle">Créée le {{ formatDateTime(selectedOrder.createdAt) }}</p>
                </div>
              </div>
              <div class="modal-header-badges">
                <span :class="['modal-badge', getStatusBadgeClass(selectedOrder.status)]">
                  <i :class="getStatusIcon(selectedOrder.status)"></i>
                  {{ getStatusLabel(selectedOrder.status) }}
                </span>
                <span :class="['modal-badge', getServiceBadgeClass(selectedOrder.serviceType)]">
                  <i :class="getServiceIcon(selectedOrder.serviceType)"></i>
                  {{ getServiceLabel(selectedOrder.serviceType) }}
                </span>
              </div>
            </div>
            <button class="modal-close-btn" @click="closeOrderDetails">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-content">
            <!-- Articles Section -->
            <div class="modal-section">
              <div class="section-header">
                <i class="fas fa-box section-icon"></i>
                <h3 class="section-title">Articles commandés</h3>
              </div>
              <div class="items-list">
                <div v-for="(item, index) in selectedOrder.itemsWithQuantities" :key="index" class="item-row">
                  <div class="item-info">
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-quantity">×{{ item.quantity }}</span>
                  </div>
                  <span class="item-price" v-if="item.price">
                    {{ formatCurrency(item.price * item.quantity) }} FCFA
                  </span>
                </div>
              </div>
              <div class="items-total">
                <span>Total articles:</span>
                <span class="total-count">{{ selectedOrder.totalItems }} article(s)</span>
              </div>
            </div>

            <!-- Address Section -->
            <div class="modal-section">
              <div class="section-header">
                <i class="fas fa-map-marker-alt section-icon"></i>
                <h3 class="section-title">Adresse</h3>
              </div>
              <div class="address-content">
                <div class="address-details">
                  <i class="fas fa-user"></i>
                  <span>{{ selectedOrder.customer?.name || 'Client' }}</span>
                </div>
                <div class="address-details">
                  <i class="fas fa-phone"></i>
                  <span>{{ selectedOrder.customer?.phone || 'Non spécifié' }}</span>
                </div>
                <div class="address-details">
                  <i class="fas fa-map-pin"></i>
                  <span>{{ selectedOrder.address }}</span>
                </div>
              </div>
            </div>

            <!-- Price Summary -->
            <div class="modal-section price-section">
              <div class="section-header">
                <i class="fas fa-money-bill-wave section-icon"></i>
                <h3 class="section-title">Récapitulatif</h3>
              </div>
              <div class="price-summary">
                <div class="price-row total-row">
                  <span class="price-label">Montant total:</span>
                  <span class="price-value">{{ formatCurrency(selectedOrder.price) }} FCFA</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons - Même logique que Commandes.vue -->
            <div class="modal-actions" v-if="selectedOrder.status === 'pending'">
              <button @click="acceptOrder(selectedOrder.id)" class="action-btn accept-btn BtnGlobal2">
                <i class="fas fa-check"></i>
                Accepter la commande
              </button>
              <button @click="openRefusalModal(selectedOrder)" class="action-btn refuse-btn BtnGlobal2">
                <i class="fas fa-times"></i>
                Refuser
              </button>
            </div>

            <!-- Même logique simplifiée pour les commandes acceptées -->
            <div v-if="selectedOrder.status === 'accepted'" class="modal-actions">
              <button @click="completeOrder(selectedOrder)" class="action-btn accept-btn BtnGlobal2">
                <i class="fas fa-flag-checkered"></i>
                Marquer comme terminée
              </button>
            </div>

            <!-- Close button for completed orders -->
            <div v-if="selectedOrder.status === 'completed'" class="modal-actions">
              <button @click="closeOrderDetails" class="action-btn BtnGlobal2">
                <i class="fas fa-times"></i>
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de refus - Même logique que Commandes.vue -->
      <div v-if="showRefusalModal" class="modal-overlay" @click="closeRefusalModal">
        <div class="modern-modal" @click.stop>
          <div class="modal-header">
            <div class="header-main">
              <h2 class="dialog-title">
                <i class="fas fa-exclamation-triangle title-icon"></i>
                Refuser la commande
              </h2>
            </div>
          </div>
          <div class="modal-content">
            <div class="refusal-modal">
              <p class="refusal-question">Pourquoi souhaitez-vous refuser la commande #{{ refusalOrder?.id }} ?</p>
              <textarea 
                v-model="refusalReason"
                placeholder="Veuillez saisir le motif de refus..."
                class="refusal-textarea"
                rows="4"
              ></textarea>
              <div class="refusal-actions">
                <button @click="closeRefusalModal" class="BtnGlobal2">
                  Annuler
                </button>
                <button 
                  @click="confirmRefuseOrder" 
                  :disabled="!refusalReason.trim()"
                  class="BtnGlobal2"
                >
                  <i class="fas fa-times"></i>
                  Confirmer le refus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de succès - Même logique que Commandes.vue -->
      <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
        <div class="modern-modal" @click.stop>
          <div class="modal-header">
            <div class="header-main">
              <h2 class="dialog-title">
                <i class="fas fa-check-circle modal-icon"></i>
                Succès
              </h2>
            </div>
          </div>
          <div class="modal-content">
            <div class="success-modal">
              <p class="success-message">{{ successMessage }}</p>
              <div class="success-actions">
                <button @click="closeSuccessModal" class="BtnGlobal2 success-btn">
                  <i class="fas fa-check"></i>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/DashboardOthers/Components/DashboardLayout.vue'

const router = useRouter()

// Types
interface ItemWithQuantity {
  name: string
  quantity: number
  price: number
}

interface Customer {
  name: string
  phone: string
}

interface StatusHistoryItem {
  status: string
  label: string
  timestamp: string
}

interface Order {
  id: string
  serviceType: string
  items: string[]
  itemsWithQuantities: ItemWithQuantity[]
  totalItems: number
  address: string
  deliveryDate: string
  deliveryTime?: string
  requestedDate?: string
  requestedTime?: string
  price: number
  status: string
  createdAt: string
  specialInstructions?: string
  customer: Customer
  statusHistory?: StatusHistoryItem[]
  refusalReason?: string
  refusedAt?: string
}

interface Service {
  id: string
  name: string
  category: string
  price: number
  duration: string
  description: string
  active: boolean
}

// Données réactives - Même structure que Commandes.vue
const orders = ref<Order[]>([])
const services = ref<Service[]>([])
const selectedOrder = ref<Order | null>(null)
const showRefusalModal = ref(false)
const refusalOrder = ref<Order | null>(null)
const refusalReason = ref('')

// États pour les modales - Même structure que Commandes.vue
const showSuccessModal = ref(false)
const successMessage = ref('')

// Données utilisateur
const user = ref({
  name: 'Jean Dupont',
  phone: '+33612345678'
})

// Récupération du nom de la boutique
const userShopName = computed(() => {
  const savedShopName = localStorage.getItem('userShopName')
  if (savedShopName) {
    return savedShopName
  }
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  if (currentUser.companyName) {
    return currentUser.companyName
  }
  
  return user.value?.name ? `${user.value.name} - Boutique` : 'Ma Boutique'
})

// NOUVEAU : Statistiques calculées en temps réel pour aujourd'hui
const todayStats = computed(() => {
  const today = new Date().toISOString().split('T')[0] as string
  const todayOrders = orders.value.filter(order => 
    order.createdAt.startsWith(today)
  )
  
  return {
    revenue: todayOrders.reduce((sum, order) => sum + order.price, 0),
    orders: todayOrders.length
  }
})

// NOUVEAU : Statistiques globales calculées en temps réel
const stats = computed(() => {
  const allOrders = orders.value
  
  return {
    revenue: {
      daily: todayStats.value.revenue,
      monthly: allOrders.reduce((sum, order) => sum + order.price, 0),
      total: allOrders.reduce((sum, order) => sum + order.price, 0),
    },
    orders: {
      daily: todayStats.value.orders,
      monthly: allOrders.length,
      total: allOrders.length,
      accepted: allOrders.filter(order => order.status === 'accepted').length,
      pending: allOrders.filter(order => order.status === 'pending').length,
      completed: allOrders.filter(order => order.status === 'completed').length,
      refused: allOrders.filter(order => order.status === 'refused').length,
    },
  }
})

// Commandes récentes - Même logique que Commandes.vue mais limitée à 5
const recentOrders = computed(() => {
  // Trier par date de création (plus récent en premier) et prendre les 5 premiers
  return orders.value
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

// Statistiques d'état - MAINTENANT calculées en temps réel
const statusStats = computed(() => [
  {
    title: 'Acceptées',
    value: stats.value.orders.accepted,
    icon: 'fas fa-check-circle',
    bgColor: 'bg-green',
    cardClass: 'status-card-green',
  },
  {
    title: 'En Attente',
    value: stats.value.orders.pending,
    icon: 'fas fa-clock',
    bgColor: 'bg-orange',
    cardClass: 'status-card-orange',
  },
  {
    title: 'Terminées',
    value: stats.value.orders.completed,
    icon: 'fas fa-flag-checkered',
    bgColor: 'bg-blue',
    cardClass: 'status-card-blue',
  },
  {
    title: 'Refusées',
    value: stats.value.orders.refused,
    icon: 'fas fa-times-circle',
    bgColor: 'bg-red',
    cardClass: 'status-card-red',
  },
])

// Fonctions utilitaires
const formatCurrency = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR')
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR')
}

// Gestion des statuts - Mêmes fonctions que Commandes.vue
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Acceptée',
    completed: 'Terminée',
    refused: 'Refusée'
  }
  return labels[status] || status
}

// NOUVELLE FONCTION : Utilise les services dynamiques de Services.vue
const getServiceLabel = (serviceType: string) => {
  // Si c'est un ID de service, chercher le nom correspondant
  if (serviceType.startsWith('SRV')) {
    const service = services.value.find(s => s.id === serviceType)
    return service ? service.name : serviceType
  }
  
  // Fallback pour les anciens types de service
  const labels: Record<string, string> = {
    dry_cleaning: 'Nettoyage à sec',
    express: 'Express',
    delicate: 'Lavage délicat',
    standard: 'Standard'
  }
  return labels[serviceType] || serviceType
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'badge-orange',
    accepted: 'badge-green',
    completed: 'badge-blue',
    refused: 'badge-red'
  }
  return classes[status] || ''
}

// NOUVELLE FONCTION : Badge cohérent avec Commandes.vue
const getServiceBadgeClass = (serviceType: string) => {
  // Tous les services ont maintenant la même classe de badge
  return 'badge-blue'
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    pending: 'fas fa-clock',
    accepted: 'fas fa-check',
    completed: 'fas fa-flag-checkered',
    refused: 'fas fa-times'
  }
  return icons[status] || 'fas fa-question'
}

// NOUVELLE FONCTION : Icône cohérente avec Commandes.vue
const getServiceIcon = (serviceType: string) => {
  // Icône unique pour tous les services
  return 'fas fa-cogs'
}

// Fonction pour émettre l'événement de mise à jour du badge
const emitOrderStatusChange = (orderId: string, newStatus: string) => {
  window.dispatchEvent(new CustomEvent('orderStatusChanged', {
    detail: { orderId, newStatus }
  }))
}

// Gestion des commandes - Même logique que Commandes.vue
const openOrderDetails = (order: Order) => {
  selectedOrder.value = order
}

const closeOrderDetails = () => {
  selectedOrder.value = null
}

const acceptOrder = (orderId: string) => {
  const order = orders.value.find(o => o.id === orderId)
  if (order) {
    order.status = 'accepted'
    if (!order.statusHistory) order.statusHistory = []
    order.statusHistory.push({
      status: 'accepted',
      label: 'Commande acceptée',
      timestamp: new Date().toISOString()
    })
    saveOrders()
    showSuccessModal.value = true
    successMessage.value = `La commande #${orderId} a été acceptée avec succès.`
    
    // Émettre l'événement pour mettre à jour le badge
    emitOrderStatusChange(orderId, 'accepted')
  }
}

// Même logique simplifiée : passer directement à "terminée"
const completeOrder = (order: Order) => {
  if (!order) return
  
  if (!order.statusHistory) order.statusHistory = []
  
  order.status = 'completed'
  order.statusHistory.push({
    status: 'completed',
    label: 'Commande terminée',
    timestamp: new Date().toISOString()
  })
  
  saveOrders()
  showSuccessModal.value = true
  successMessage.value = `La commande #${order.id} est maintenant terminée.`
  
  // Émettre l'événement pour mettre à jour le badge
  emitOrderStatusChange(order.id, 'completed')
  
  closeOrderDetails()
}

const openRefusalModal = (order: Order) => {
  refusalOrder.value = order
  refusalReason.value = ''
  showRefusalModal.value = true
}

const closeRefusalModal = () => {
  showRefusalModal.value = false
  refusalOrder.value = null
  refusalReason.value = ''
}

const confirmRefuseOrder = () => {
  if (refusalOrder.value && refusalReason.value.trim()) {
    const order = orders.value.find(o => o.id === refusalOrder.value!.id)
    if (order) {
      order.status = 'refused'
      order.refusalReason = refusalReason.value.trim()
      order.refusedAt = new Date().toISOString()
      saveOrders()
      showSuccessModal.value = true
      successMessage.value = `La commande #${order.id} a été refusée avec succès.`
      
      // Émettre l'événement pour mettre à jour le badge
      emitOrderStatusChange(order.id, 'refused')
      
      closeRefusalModal()
      closeOrderDetails()
    }
  }
}

// Gestion de la modale de succès
const closeSuccessModal = () => {
  showSuccessModal.value = false
  successMessage.value = ''
}

// Fonctions de gestion des données - Même logique que Commandes.vue
const saveOrders = () => {
  localStorage.setItem('presso_orders', JSON.stringify(orders.value))
  
  // Émettre un event pour synchroniser avec d'autres pages
  window.dispatchEvent(new CustomEvent('ordersUpdated', {
    detail: { orders: orders.value }
  }))
}

const loadOrders = () => {
  const savedOrders = localStorage.getItem('presso_orders')
  if (savedOrders) {
    try {
      orders.value = JSON.parse(savedOrders)
    } catch (e) {
      console.error('Erreur lors du chargement des commandes:', e)
      orders.value = []
      saveOrders()
    }
  } else {
    orders.value = []
    saveOrders()
  }
}

// NOUVELLE FONCTION : Charger les services depuis Services.vue
const loadServices = () => {
  const savedServices = localStorage.getItem('presso_services')
  if (savedServices) {
    try {
      services.value = JSON.parse(savedServices)
    } catch (e) {
      console.error('Erreur lors du chargement des services:', e)
      services.value = []
    }
  } else {
    services.value = []
  }
}

// Écouter les événements de synchronisation
const handleOrderStatusChange = (event: CustomEvent) => {
  const { orderId, newStatus } = event.detail
  const order = orders.value.find(o => o.id === orderId)
  if (order) {
    order.status = newStatus
    saveOrders()
  }
}

const handleOrdersUpdated = (event: CustomEvent) => {
  orders.value = event.detail.orders
}

// NOUVEL ÉVÉNEMENT : Écouter les mises à jour des services
const handleServicesUpdated = (event: CustomEvent) => {
  const { services: updatedServices } = event.detail
  services.value = updatedServices
}

onMounted(() => {
  // Charger les données utilisateur depuis le localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  if (currentUser.name) {
    user.value = currentUser
  }

  loadServices()
  loadOrders()
  
  // Écouter les changements depuis d'autres pages
  window.addEventListener('orderStatusChanged', handleOrderStatusChange as EventListener)
  window.addEventListener('ordersUpdated', handleOrdersUpdated as EventListener)
  window.addEventListener('servicesUpdated', handleServicesUpdated as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('orderStatusChanged', handleOrderStatusChange as EventListener)
  window.removeEventListener('ordersUpdated', handleOrdersUpdated as EventListener)
  window.removeEventListener('servicesUpdated', handleServicesUpdated as EventListener)
})
</script>

<style scoped src="@/DashboardOthers/Assets/Styles/Dashboard.css"></style>