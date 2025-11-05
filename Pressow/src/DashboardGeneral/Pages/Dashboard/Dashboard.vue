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
            <span>{{ formatCurrency(stats.revenue.daily) }} FCFA</span>
          </div>
          <div class="welcome-stat">
            <i class="fas fa-box"></i>
            <span>{{ stats.orders.daily }} commandes</span>
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
              <router-link to="/Commandes">
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

            <!-- Cartes des commandes -->
            <div
              v-for="order in recentOrders"
              :key="order.id"
              class="orders-order-card"
              @click="viewOrder(order)"
            >
              <div class="card-content">
                <div class="order-header">
                  <div class="order-header-left">
                    <div>
                      <div class="order-id-section">
                        <h3 class="order-id">#{{ order.id }}</h3>
                        <div class="badges-container">
                          <span :class="getStatusBadgeClass(order.status)" class="status-badge">
                            <i :class="getStatusIcon(order.status)"></i>
                            {{ getStatusLabel(order.status) }}
                          </span>
                          <span :class="getServiceBadgeClass(order.serviceType)" class="service-badge">
                            <i :class="getServiceIcon(order.serviceType)"></i>
                            {{ getServiceLabel(order.serviceType) }}
                          </span>
                        </div>
                      </div>
                      <p class="order-date">{{ formatDateTime(order.createdAt) }}</p>
                    </div>
                  </div>
                  <div class="order-header-actions">
                    <button 
                      @click.stop="viewOrder(order)" 
                      class="BtnGlobal2 details-btn"
                    >
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
                  <i class="fas fa-box"></i>
                </div>
                <p class="empty-message">Aucune commande récente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modern Mini Modal -->
      <div v-if="selectedOrder" class="modal-overlay" @click="closeOrderDetails">
        <div class="modern-modal" @click.stop>
          <!-- Modal Header -->
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

          <!-- Modal Content -->
          <div class="modal-content">
            <!-- Articles Section -->
            <div class="modal-section">
              <div class="section-header">
                <i class="fas fa-box section-icon"></i>
                <h3 class="section-title">Articles commandés</h3>
              </div>
              <div class="items-list">
                <div
                  v-for="(item, index) in selectedOrder.itemsWithQuantities"
                  :key="index"
                  class="item-row"
                >
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

            <!-- Planning Section -->
            <div v-if="selectedOrder.status !== 'refused'" class="modal-section">
              <div class="section-header">
                <i class="fas fa-calendar-alt section-icon"></i>
                <h3 class="section-title">Planning</h3>
              </div>
              <div class="planning-content">
                <div class="planning-subsection">
                  <h4 class="planning-subtitle">
                    <i class="fas fa-box-open"></i>
                    Dépôt / Ramassage
                  </h4>
                  <div class="planning-item">
                    <i class="fas fa-calendar-day"></i>
                    <div class="planning-info">
                      <span class="planning-label">Date de ramassage souhaitée</span>
                      <span class="planning-value">{{ formatDate(selectedOrder.requestedDate || selectedOrder.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="planning-item">
                    <i class="fas fa-clock"></i>
                    <div class="planning-info">
                      <span class="planning-label">Créneau de ramassage</span>
                      <span class="planning-value">{{ selectedOrder.requestedTime || 'Non spécifié' }}</span>
                    </div>
                  </div>
                </div>

                <div class="planning-divider"></div>

                <div class="planning-subsection">
                  <h4 class="planning-subtitle">
                    <i class="fas fa-shipping-fast"></i>
                    Récupération / Livraison
                  </h4>
                  <div class="planning-item">
                    <i class="fas fa-calendar-day"></i>
                    <div class="planning-info">
                      <span class="planning-label">Date de livraison souhaitée</span>
                      <span class="planning-value">{{ formatDate(selectedOrder.deliveryDate) }}</span>
                    </div>
                  </div>
                  <div class="planning-item">
                    <i class="fas fa-clock"></i>
                    <div class="planning-info">
                      <span class="planning-label">Créneau de livraison</span>
                      <span class="planning-value">{{ selectedOrder.deliveryTime || 'Non spécifié' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Instructions Section -->
            <div v-if="selectedOrder.specialInstructions" class="modal-section">
              <div class="section-header">
                <i class="fas fa-sticky-note section-icon"></i>
                <h3 class="section-title">Instructions spéciales</h3>
              </div>
              <div class="instructions-content">
                <p>{{ selectedOrder.specialInstructions }}</p>
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

            <!-- Action Buttons -->
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

            <!-- Progress Action Buttons for Accepted Orders -->
            <div
              v-if="selectedOrder.status === 'accepted' || selectedOrder.status === 'in_pickup' || selectedOrder.status === 'processing' || selectedOrder.status === 'ready_for_delivery' || selectedOrder.status === 'in_delivery'"
              class="modal-actions">
              <!-- Show progress button based on current status -->
              <button @click="progressOrderStatus(selectedOrder)" class="action-btn accept-btn BtnGlobal2">
                <i :class="getProgressButtonIcon(selectedOrder.status)"></i>
                {{ getProgressButtonLabel(selectedOrder.status) }}
              </button>
            </div>

            <!-- Close button for refused orders -->
            <div v-if="selectedOrder.status === 'refused' || selectedOrder.status === 'completed'" class="modal-actions">
              <button @click="closeOrderDetails" class="action-btn BtnGlobal2">
                <i class="fas fa-times"></i>
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de refus -->
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
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/DashboardGeneral/Components/DashboardLayout.vue';

const router = useRouter()

interface OrderItem {
  name: string
  quantity: number
  price?: number
}

interface Order {
  id: string
  serviceType: string
  items: string[]
  itemsWithQuantities: OrderItem[]
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
  refusalReason?: string
  refusedAt?: string
  customer?: {
    name: string
    phone: string
  }
  statusHistory?: { status: string; timestamp: string; label?: string }[]
  pickupStage?: string
}

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

// Statistiques
const stats = reactive({
  revenue: {
    daily: 83000,
    monthly: 2450000,
    total: 57000000,
  },
  orders: {
    daily: 2,
    monthly: 18,
    total: 42,
    accepted: 28,
    pending: 2,
    completed: 10,
    refused: 2,
  },
})

// Commandes récentes - calculées à partir des données partagées
const recentOrders = computed(() => {
  const allOrders = loadAllOrders()
  // Trier par date de création (plus récent en premier) et prendre les 5 premiers
  return allOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

// Fonction pour charger toutes les commandes depuis localStorage
const loadAllOrders = (): Order[] => {
  const savedOrders = localStorage.getItem('presso_orders')
  if (savedOrders) {
    try {
      return JSON.parse(savedOrders)
    } catch (e) {
      console.error('Erreur lors du chargement des commandes:', e)
      return getDefaultOrders()
    }
  }
  return getDefaultOrders()
}

// Fonction pour obtenir les commandes par défaut
const getDefaultOrders = (): Order[] => {
  return [
    {
      id: 'CMD001',
      serviceType: 'dry_cleaning',
      items: ['Chemise blanche', 'Pantalon costume', 'Robe de soirée'],
      itemsWithQuantities: [
        { name: 'Chemise blanche', quantity: 2, price: 8.0 },
        { name: 'Pantalon costume', quantity: 1, price: 12.0 },
        { name: 'Robe de soirée', quantity: 1, price: 25.0 }
      ],
      totalItems: 4,
      address: '25 Avenue des Champs, Paris 75008',
      deliveryDate: '2025-01-22',
      deliveryTime: '14:00-16:00',
      requestedDate: '2025-01-18',
      requestedTime: '10:00-12:00',
      price: 45000,
      status: 'pending',
      createdAt: '2025-01-18T10:30:00',
      specialInstructions: 'Urgent - Évènement important',
      customer: {
        name: 'Jean Dupont',
        phone: '+33 6 12 34 56 78'
      }
    },
    {
      id: 'CMD002',
      serviceType: 'express',
      items: ['Costume 2 pièces', 'Cravate'],
      itemsWithQuantities: [
        { name: 'Costume 2 pièces', quantity: 1, price: 30.0 },
        { name: 'Cravate', quantity: 2, price: 5.0 }
      ],
      totalItems: 3,
      address: '10 Boulevard Saint-Germain, Paris 75005',
      deliveryDate: '2025-01-21',
      deliveryTime: '16:00-18:00',
      requestedDate: '2025-01-17',
      requestedTime: '14:00-16:00',
      price: 40000,
      status: 'accepted',
      createdAt: '2025-01-17T14:20:00',
      specialInstructions: 'Repassage soigné',
      customer: {
        name: 'Marie Martin',
        phone: '+33 6 98 76 54 32'
      },
      statusHistory: [
        { status: 'accepted', label: 'Commande acceptée', timestamp: '2025-01-17T15:00:00' }
      ]
    },
    {
      id: 'CMD003',
      serviceType: 'delicate',
      items: ['Linge de maison'],
      itemsWithQuantities: [
        { name: 'Linge de maison', quantity: 8, price: 7.5 }
      ],
      totalItems: 8,
      address: '5 Rue Victor Hugo, Paris 75016',
      deliveryDate: '2025-01-23',
      requestedDate: '2025-01-16',
      requestedTime: '09:00-11:00',
      price: 60000,
      status: 'completed',
      createdAt: '2025-01-16T09:15:00',
      customer: {
        name: 'Pierre Lambert',
        phone: '+33 6 45 67 89 01'
      },
      statusHistory: [
        { status: 'accepted', label: 'Commande acceptée', timestamp: '2025-01-16T10:00:00' },
        { status: 'in_pickup', label: 'Ramassage en cours', timestamp: '2025-01-16T11:30:00' },
        { status: 'processing', label: 'En traitement', timestamp: '2025-01-17T09:00:00' },
        { status: 'ready_for_delivery', label: 'Prête à livrer', timestamp: '2025-01-18T14:00:00' },
        { status: 'in_delivery', label: 'En livraison', timestamp: '2025-01-19T10:00:00' },
        { status: 'completed', label: 'Commande terminée', timestamp: '2025-01-19T16:00:00' }
      ]
    },
    {
      id: 'CMD004',
      serviceType: 'standard',
      items: ['Veste en cuir', 'Pull en laine'],
      itemsWithQuantities: [
        { name: 'Veste en cuir', quantity: 1, price: 25.0 },
        { name: 'Pull en laine', quantity: 3, price: 15.0 }
      ],
      totalItems: 4,
      address: '15 Rue de Rivoli, Paris 75004',
      deliveryDate: '2025-01-24',
      requestedDate: '2025-01-15',
      requestedTime: '11:00-13:00',
      price: 70000,
      status: 'refused',
      createdAt: '2025-01-15T11:00:00',
      refusalReason: 'Service non disponible pour les articles en cuir',
      refusedAt: '2025-01-15T14:30:00',
      customer: {
        name: 'Sophie Bernard',
        phone: '+33 6 23 45 67 89'
      }
    }
  ]
}

// Statistiques d'état
const statusStats = computed(() => [
  {
    title: 'Acceptées',
    value: stats.orders.accepted,
    icon: 'fas fa-check-circle',
    bgColor: 'bg-green',
    cardClass: 'status-card-green',
  },
  {
    title: 'En Attente',
    value: stats.orders.pending,
    icon: 'fas fa-clock',
    bgColor: 'bg-orange',
    cardClass: 'status-card-orange',
  },
  {
    title: 'Terminées',
    value: stats.orders.completed,
    icon: 'fas fa-flag-checkered',
    bgColor: 'bg-blue',
    cardClass: 'status-card-blue',
  },
  {
    title: 'Refusées',
    value: stats.orders.refused,
    icon: 'fas fa-times-circle',
    bgColor: 'bg-red',
    cardClass: 'status-card-red',
  },
])

// Gestion de la modal
const selectedOrder = ref<Order | null>(null)
const showRefusalModal = ref(false)
const refusalOrder = ref<Order | null>(null)
const refusalReason = ref('')

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

// Gestion des statuts
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Acceptée',
    in_pickup: 'Ramassage en cours',
    processing: 'En traitement',
    ready_for_delivery: 'Prête à livrer',
    in_delivery: 'En livraison',
    completed: 'Terminée',
    refused: 'Refusée',
  }
  return labels[status] || status
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    pending: 'fas fa-clock',
    accepted: 'fas fa-check',
    in_pickup: 'fas fa-truck-loading',
    processing: 'fas fa-cog fa-spin',
    ready_for_delivery: 'fas fa-box-open',
    in_delivery: 'fas fa-shipping-fast',
    completed: 'fas fa-flag-checkered',
    refused: 'fas fa-times',
  }
  return icons[status] || 'fas fa-question'
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'badge-orange',
    accepted: 'badge-green',
    in_pickup: 'badge-cyan',
    processing: 'badge-purple',
    ready_for_delivery: 'badge-yellow',
    in_delivery: 'badge-blue',
    completed: 'badge-blue',
    refused: 'badge-red',
  }
  return classes[status] || ''
}

// Gestion des services
const getServiceLabel = (serviceType: string) => {
  const labels: Record<string, string> = {
    dry_cleaning: 'Nettoyage à sec',
    express: 'Express',
    delicate: 'Lavage délicat',
    standard: 'Standard',
  }
  return labels[serviceType] || serviceType
}

const getServiceIcon = (serviceType: string) => {
  const icons: Record<string, string> = {
    dry_cleaning: 'fas fa-wind',
    express: 'fas fa-bolt',
    delicate: 'fas fa-feather',
    standard: 'fas fa-tint',
  }
  return icons[serviceType] || 'fas fa-question'
}

const getServiceBadgeClass = (serviceType: string) => {
  const classes: Record<string, string> = {
    dry_cleaning: 'badge-purple',
    express: 'badge-yellow',
    delicate: 'badge-pink',
    standard: 'badge-cyan',
  }
  return classes[serviceType] || ''
}

// Helper functions for button labels and icons based on status
const getProgressButtonLabel = (status: string) => {
  const labels: Record<string, string> = {
    accepted: 'Lancer le ramassage',
    in_pickup: 'Colis reçu - Démarrer le traitement',
    processing: 'Traitement terminé - Prêt pour livraison',
    ready_for_delivery: 'Lancer la livraison',
    in_delivery: 'Confirmer la livraison',
  }
  return labels[status] || 'Continuer'
}

const getProgressButtonIcon = (status: string) => {
  const icons: Record<string, string> = {
    accepted: 'fas fa-truck-loading',
    in_pickup: 'fas fa-box',
    processing: 'fas fa-check-circle',
    ready_for_delivery: 'fas fa-shipping-fast',
    in_delivery: 'fas fa-flag-checkered',
  }
  return icons[status] || 'fas fa-arrow-right'
}

// Logique de progression pour tous les statuts
const progressOrderStatus = (order: Order) => {
  if (!order) return
  
  const currentStatus = order.status
  if (!order.statusHistory) order.statusHistory = []

  switch (currentStatus) {
    case 'accepted':
      order.status = 'in_pickup'
      order.statusHistory.push({
        status: 'in_pickup',
        label: 'Ramassage en cours',
        timestamp: new Date().toISOString()
      })
      break
      
    case 'in_pickup':
      order.status = 'processing'
      order.statusHistory.push({
        status: 'processing',
        label: 'En traitement',
        timestamp: new Date().toISOString()
      })
      break
      
    case 'processing':
      order.status = 'ready_for_delivery'
      order.statusHistory.push({
        status: 'ready_for_delivery',
        label: 'Prête à livrer',
        timestamp: new Date().toISOString()
      })
      break
      
    case 'ready_for_delivery':
      order.status = 'in_delivery'
      order.statusHistory.push({
        status: 'in_delivery',
        label: 'En livraison',
        timestamp: new Date().toISOString()
      })
      break
      
    case 'in_delivery':
      order.status = 'completed'
      order.statusHistory.push({
        status: 'completed',
        label: 'Commande terminée',
        timestamp: new Date().toISOString()
      })
      break
      
    default:
      console.log('Statut non géré:', currentStatus)
      return
  }

  console.log(`Commande passée de ${currentStatus} à ${order.status}`)
  
  // Sauvegarder les modifications dans localStorage
  const allOrders = loadAllOrders()
  const orderIndex = allOrders.findIndex(o => o.id === order.id)
  if (orderIndex !== -1) {
    allOrders[orderIndex] = order
    localStorage.setItem('presso_orders', JSON.stringify(allOrders))
  }
}

// Gestion de la modal
const viewOrder = (order: Order) => {
  selectedOrder.value = order
}

const closeOrderDetails = () => {
  selectedOrder.value = null
}

const acceptOrder = (orderId: string) => {
  const allOrders = loadAllOrders()
  const order = allOrders.find((o) => o.id === orderId)
  if (order) {
    order.status = 'accepted'
    if (!order.statusHistory) order.statusHistory = []
    order.statusHistory.push({
      status: 'accepted',
      label: 'Commande acceptée',
      timestamp: new Date().toISOString()
    })
    
    // Sauvegarder les modifications
    localStorage.setItem('presso_orders', JSON.stringify(allOrders))
    
    // Mettre à jour les statistiques
    stats.orders.pending = Math.max(0, stats.orders.pending - 1)
    stats.orders.accepted += 1
    
    console.log('Commande acceptée avec succès!')
  }
}

// Fonctions pour le refus avec motif
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
    const allOrders = loadAllOrders()
    const order = allOrders.find((o) => o.id === refusalOrder.value!.id)
    if (order) {
      order.status = 'refused'
      order.refusalReason = refusalReason.value.trim()
      order.refusedAt = new Date().toISOString()
      
      // Sauvegarder les modifications
      localStorage.setItem('presso_orders', JSON.stringify(allOrders))
      
      // Mettre à jour les statistiques
      stats.orders.pending = Math.max(0, stats.orders.pending - 1)
      stats.orders.refused += 1
      
      closeRefusalModal()
      closeOrderDetails()
    }
  }
}

// Initialisation
onMounted(() => {
  // Charger les données utilisateur depuis le localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  if (currentUser.name) {
    user.value = currentUser
  }

  // Mettre à jour les statistiques basées sur les commandes réelles
  const allOrders = loadAllOrders()
  stats.orders.pending = allOrders.filter(order => order.status === 'pending').length
  stats.orders.accepted = allOrders.filter(order => order.status === 'accepted').length
  stats.orders.completed = allOrders.filter(order => order.status === 'completed').length
  stats.orders.refused = allOrders.filter(order => order.status === 'refused').length
  stats.orders.total = allOrders.length
})
</script>

<style scoped src="@/DashboardGeneral/Assets/Styles/Dashboard.css"></style>