<template>
    <DashboardLayout>
        <div class="orders-page">
            <div class="orders-page-header">
                <div>
                    <h1 class="orders-page-title">Commandes</h1>
                    <p class="orders-page-description">Gérez toutes vos commandes en un seul endroit</p>
                </div>
            </div>

            <!-- Filtres sticky -->
            <div class="orders-filters-card" :class="{ 'sticky-filters': isFiltersSticky }" ref="filtersCard">
                <div class="filters-content">
                    <div class="filters-header">
                        <div class="active-filters">
                            <div class="filter-group">
                                <label class="filter-label">Filtrer par statut :</label>
                                <div class="filter-buttons">
                                    <button v-for="status in statusFilters" :key="status.value" class="BtnGlobal2"
                                        :class="{ 'active-filter': filters.status === status.value }"
                                        @click="toggleStatusFilter(status.value)">
                                        <i :class="getStatusIcon(status.value)"></i>
                                        {{ status.label }}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button class="more-filters-btn BtnGlobal2" @click="showFiltersModal = true">
                            <i class="fas fa-sliders-h"></i>
                            Plus de filtres
                            <span v-if="activeFiltersCount > 0" class="filters-badge">
                                {{ activeFiltersCount }}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Liste des commandes -->
            <div class="orders-list">
                <!-- En-tête avec sélection multiple -->
                <div class="list-header">
                    <div class="selection-info" v-if="selectedOrders.length > 0">
                        <input type="checkbox" :checked="allSelected" @change="toggleSelectAll"
                            class="select-all-checkbox" />
                        <span class="selection-count">{{ selectedOrders.length }} commande(s) sélectionnée(s)</span>
                    </div>
                    <div class="total-info" v-else>
                        {{ filteredOrders.length }} commande(s) trouvée(s)
                    </div>
                    
                    <div class="bulk-actions">
                        <button v-if="selectedOrders.length > 0" class="BtnGlobal2 delete-bulk-btn"
                            @click="openDeleteModal('bulk', null, selectedOrders.length)">
                            <i class="fas fa-trash"></i>
                            Supprimer ({{ selectedOrders.length }})
                        </button>
                    </div>
                </div>

                <!-- Cartes des commandes -->
                <div v-for="order in filteredOrders" :key="order.id" class="orders-order-card"
                    :class="{ 'selected': isOrderSelected(order.id) }" @click="toggleOrderSelection(order.id)">
                    <div class="card-content">
                        <div class="order-header">
                            <div class="order-header-left">
                                <input type="checkbox" :checked="isOrderSelected(order.id)"
                                    @change="toggleOrderSelection(order.id)" class="order-checkbox" @click.stop />
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
                                <button v-if="!isOrderSelected(order.id)" class="BtnGlobal2 delete-btn"
                                    @click.stop="openDeleteModal('single', order.id, 1)">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>

                        <div class="order-body">
                            <div class="order-info-col">
                                <div class="order-info-row">
                                    <span class="order-info-label">
                                        <i class="fas fa-box"></i>
                                        Articles:
                                    </span>
                                    <span class="order-info-value">{{ order.totalItems }} article(s)</span>
                                </div>

                                <div class="order-info-row">
                                    <span class="order-info-label">
                                        <i class="fas fa-map-marker-alt"></i>
                                        Adresse:
                                    </span>
                                    <span class="order-info-value">{{ order.address }}</span>
                                </div>

                                <div v-if="order.status !== 'refused'" class="order-info-row">
                                    <span class="order-info-label">
                                        <i class="fas fa-calendar-alt"></i>
                                        Livraison:
                                    </span>
                                    <span class="order-info-value">
                                        {{ formatDate(order.deliveryDate) }}
                                        <span v-if="order.deliveryTime" class="delivery-time">à {{ order.deliveryTime
                                            }}</span>
                                    </span>
                                </div>

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
                                    {{ order.price.toFixed(2) }} €
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- État vide -->
                <div v-if="filteredOrders.length === 0" class="empty-state">
                    <div class="card-content">
                        <div class="empty-icon">
                            <i class="fas fa-box-open"></i>
                        </div>
                        <p class="empty-message">Aucune commande trouvée</p>
                        <button @click="clearAllFilters" class="BtnGlobal2">
                            <i class="fas fa-times"></i>
                            Réinitialiser les filtres
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal des détails de commande -->
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
                                <div v-for="(item, index) in selectedOrder.itemsWithQuantities" :key="index"
                                    class="item-row">
                                    <div class="item-info">
                                        <span class="item-name">{{ item.name }}</span>
                                        <span class="item-quantity">×{{ item.quantity }}</span>
                                    </div>
                                    <span class="item-price" v-if="item.price">
                                        {{ (item.price * item.quantity).toFixed(2) }} €
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
                                    <span class="price-value">{{ selectedOrder.price.toFixed(2) }} €</span>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons - Nouvelle logique simplifiée -->
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

                        <!-- Nouvelle logique simplifiée pour les commandes acceptées -->
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
                            <p class="refusal-question">Pourquoi souhaitez-vous refuser la commande #{{ refusalOrder?.id
                                }} ?</p>
                            <textarea v-model="refusalReason" placeholder="Veuillez saisir le motif de refus..."
                                class="refusal-textarea" rows="4"></textarea>
                            <div class="refusal-actions">
                                <button @click="closeRefusalModal" class="BtnGlobal2">
                                    Annuler
                                </button>
                                <button @click="confirmRefuseOrder" :disabled="!refusalReason.trim()"
                                    class="BtnGlobal2">
                                    <i class="fas fa-times"></i>
                                    Confirmer le refus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de confirmation de suppression -->
            <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
                <div class="modern-modal" @click.stop>
                    <div class="modal-header">
                        <div class="header-main">
                            <h2 class="dialog-title">
                                <i class="fas fa-trash title-icon"></i>
                                Confirmer la suppression
                            </h2>
                        </div>
                    </div>
                    <div class="modal-content">
                        <div class="delete-modal">
                            <p class="delete-question">
                                Êtes-vous sûr de vouloir supprimer 
                                <span v-if="deleteModalData.type === 'bulk'">
                                    {{ deleteModalData.count }} commande(s) ?
                                </span>
                                <span v-else>
                                    la commande #{{ deleteModalData.orderId }} ?
                                </span>
                            </p>
                            <p class="delete-warning">
                                <i class="fas fa-exclamation-triangle"></i>
                                Cette action est irréversible.
                            </p>
                            <div class="delete-actions">
                                <button @click="closeDeleteModal" class="BtnGlobal2 cancel-btn">
                                    <i class="fas fa-times"></i>
                                    Annuler
                                </button>
                                <button @click="confirmDelete" class="BtnGlobal2 confirm-delete-btn">
                                    <i class="fas fa-trash"></i>
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de succès -->
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

            <!-- Modal des filtres avancés -->
            <div v-if="showFiltersModal" class="modal-overlay" @click="closeFiltersModal">
                <div class="modern-modal filters-modal" @click.stop>
                    <div class="modal-header">
                        <div class="header-main">
                            <h2 class="dialog-title">
                                <i class="fas fa-filter title-icon"></i>
                                Filtres avancés
                            </h2>
                        </div>
                        <button class="modal-close-btn" @click="closeFiltersModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <div class="filters-modal-content">
                            <!-- Filtres par date -->
                            <div class="filter-group">
                                <div class="filter-group-header">
                                    <label class="filter-label">Période</label>
                                </div>
                                <div class="date-filters-section">
                                    <div class="date-filters">
                                        <div class="date-input-group">
                                            <label class="date-label">Du</label>
                                            <input type="date" v-model="filters.dateRange.start" class="date-input"
                                                @change="applyDateFilter">
                                        </div>
                                        <div class="date-input-group">
                                            <label class="date-label">Au</label>
                                            <input type="date" v-model="filters.dateRange.end" class="date-input"
                                                @change="applyDateFilter">
                                        </div>
                                        <button @click="clearDateFilter" class="BtnGlobal2 clear-date-btn">
                                            <i class="fas fa-times"></i>
                                            Effacer
                                        </button>
                                    </div>

                                    <!-- Filtre rapide par période -->
                                    <div class="quick-date-filters-section">
                                        <label class="quick-date-label">Période rapide</label>
                                        <div class="quick-date-filters">
                                            <button v-for="period in quickDateFilters" :key="period.value"
                                                @click="setQuickDateFilter(period.value)"
                                                :class="filters.quickDateFilter === period.value ? 'active-filter' : ''"
                                                class="BtnGlobal2 quick-date-btn">
                                                {{ period.label }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Filtres par type de service (dynamiques) -->
                            <div class="filter-group">
                                <div class="filter-group-header">
                                    <label class="filter-label">Type de service</label>
                                </div>
                                <div class="filter-buttons">
                                    <button class="BtnGlobal2" v-for="service in activeServiceFilters" :key="service.value"
                                        :class="filters.serviceType === service.value ? 'active-filter' : ''"
                                        @click="toggleServiceFilter(service.value)">
                                        <i :class="getServiceIcon(service.value)"></i>
                                        {{ service.label }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="filters-modal-actions">
                            <button @click="clearAllFilters" class="BtnGlobal2 clear-all-btn">
                                <i class="fas fa-times"></i>
                                Réinitialiser tous les filtres
                            </button>
                            <button @click="closeFiltersModal" class="BtnGlobal2 apply-btn">
                                <i class="fas fa-check"></i>
                                Appliquer les filtres
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DashboardLayout from '@/DashboardOthers/Components/DashboardLayout.vue'

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

// Données réactives
const orders = ref<Order[]>([])
const services = ref<Service[]>([])
const selectedOrder = ref<Order | null>(null)
const selectedOrders = ref<string[]>([])
const showRefusalModal = ref(false)
const refusalOrder = ref<Order | null>(null)
const refusalReason = ref('')
const showFiltersModal = ref(false)
const isFiltersSticky = ref(false)
const filtersCard = ref<HTMLElement | null>(null)

// Nouveaux états pour les modales
const showDeleteModal = ref(false)
const deleteModalData = ref<{
  type: string
  orderId: string | null
  count: number
}>({
  type: 'single',
  orderId: null,
  count: 0
})

const showSuccessModal = ref(false)
const successMessage = ref('')

const filters = ref({
  status: 'all',
  serviceType: 'all',
  dateRange: {
    start: '',
    end: ''
  },
  quickDateFilter: ''
})

// Constantes - Filtres simplifiés (seulement 3 statuts)
const statusFilters = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'accepted', label: 'Acceptées' },
  { value: 'completed', label: 'Terminées' }
]

const quickDateFilters = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'last-month', label: 'Mois dernier' }
]

// Computed - Filtres de services dynamiques basés sur les services actifs
const activeServiceFilters = computed(() => {
  const baseFilters = [
    { value: 'all', label: 'Tous les services' }
  ]
  
  // Ajouter seulement les services actifs
  const activeServices = services.value
    .filter(service => service.active)
    .map(service => ({
      value: service.id, // Utiliser l'ID du service comme valeur
      label: service.name,
      category: service.category
    }))
  
  return [...baseFilters, ...activeServices]
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.status !== 'all') count++
  if (filters.value.serviceType !== 'all') count++
  if (filters.value.dateRange.start && filters.value.dateRange.end) count++
  if (filters.value.quickDateFilter) count++
  return count
})

const filteredOrders = computed(() => {
  let filtered = orders.value

  // Filtre par statut (seulement 3 statuts maintenant)
  if (filters.value.status !== 'all') {
    filtered = filtered.filter(order => order.status === filters.value.status)
  }

  // Filtre par type de service (dynamique basé sur les services actifs)
  if (filters.value.serviceType !== 'all') {
    filtered = filtered.filter(order => order.serviceType === filters.value.serviceType)
  }

  // Filtre par date
  if (filters.value.dateRange.start && filters.value.dateRange.end) {
    const startDate = new Date(filters.value.dateRange.start)
    const endDate = new Date(filters.value.dateRange.end)
    endDate.setHours(23, 59, 59, 999)

    filtered = filtered.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startDate && orderDate <= endDate
    })
  }

  return filtered
})

const allSelected = computed(() => {
  return filteredOrders.value.length > 0 && selectedOrders.value.length === filteredOrders.value.length
})

// Méthodes
// Filtres
const toggleStatusFilter = (status: string) => {
  filters.value.status = filters.value.status === status ? 'all' : status
}

const toggleServiceFilter = (serviceType: string) => {
  filters.value.serviceType = filters.value.serviceType === serviceType ? 'all' : serviceType
}

const applyDateFilter = () => {
  filters.value.quickDateFilter = ''
}

const clearDateFilter = () => {
  filters.value.dateRange = { start: '', end: '' }
  filters.value.quickDateFilter = ''
}

const setQuickDateFilter = (period: string) => {
  filters.value.quickDateFilter = period
  const today = new Date()

  switch (period) {
    case 'today': {
      const todayStr = today.toISOString().split('T')[0]!
      filters.value.dateRange = { start: todayStr, end: todayStr }
      break
    }
    case 'week': {
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      filters.value.dateRange = {
        start: startOfWeek.toISOString().split('T')[0]!,
        end: endOfWeek.toISOString().split('T')[0]!
      }
      break
    }
    case 'month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      filters.value.dateRange = {
        start: startOfMonth.toISOString().split('T')[0]!,
        end: endOfMonth.toISOString().split('T')[0]!
      }
      break
    }
    case 'last-month': {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      filters.value.dateRange = {
        start: startOfLastMonth.toISOString().split('T')[0]!,
        end: endOfLastMonth.toISOString().split('T')[0]!
      }
      break
    }
  }
}

const clearAllFilters = () => {
  filters.value = {
    status: 'all',
    serviceType: 'all',
    dateRange: { start: '', end: '' },
    quickDateFilter: ''
  }
}

// Sélection multiple
const toggleOrderSelection = (orderId: string) => {
  const index = selectedOrders.value.indexOf(orderId)
  if (index > -1) {
    selectedOrders.value.splice(index, 1)
  } else {
    selectedOrders.value.push(orderId)
  }
}

const toggleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    selectedOrders.value = filteredOrders.value.map(order => order.id)
  } else {
    selectedOrders.value = []
  }
}

const isOrderSelected = (orderId: string) => {
  return selectedOrders.value.includes(orderId)
}

// Gestion des modales de suppression
const openDeleteModal = (type: string, orderId: string | null, count: number) => {
  deleteModalData.value = {
    type,
    orderId,
    count
  }
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteModalData.value = {
    type: 'single',
    orderId: null,
    count: 0
  }
}

const confirmDelete = () => {
  if (deleteModalData.value.type === 'bulk') {
    // Suppression groupée
    orders.value = orders.value.filter(order => !selectedOrders.value.includes(order.id))
    selectedOrders.value = []
    showSuccessModal.value = true
    successMessage.value = `${deleteModalData.value.count} commande(s) ont été supprimée(s) avec succès.`
  } else {
    // Suppression simple
    orders.value = orders.value.filter(order => order.id !== deleteModalData.value.orderId)
    showSuccessModal.value = true
    successMessage.value = `La commande #${deleteModalData.value.orderId} a été supprimée avec succès.`
  }
  saveOrders()
  closeDeleteModal()
}

// Gestion de la modale de succès
const closeSuccessModal = () => {
  showSuccessModal.value = false
  successMessage.value = ''
}

// Fonction pour émettre l'événement de mise à jour du badge
const emitOrderStatusChange = (orderId: string, newStatus: string) => {
  window.dispatchEvent(new CustomEvent('orderStatusChanged', {
    detail: { orderId, newStatus }
  }))
}

// Gestion des commandes
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

// Nouvelle logique simplifiée : passer directement à "terminée"
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

// Modales
const closeFiltersModal = () => {
  showFiltersModal.value = false
}

// Utilitaires
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Acceptée',
    completed: 'Terminée',
    refused: 'Refusée'
  }
  return labels[status] || status
}

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

const getServiceBadgeClass = (serviceType: string) => {
  // Tous les services ont maintenant la même classe de badge
  return 'badge-blue'
}

const getServiceIcon = (serviceType: string) => {
  // Icône unique pour tous les services
  return 'fas fa-cogs'
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    pending: 'fas fa-clock',
    accepted: 'fas fa-check',
    completed: 'fas fa-flag-checkered',
    refused: 'fas fa-times',
    all: 'fas fa-filter'
  }
  return icons[status] || 'fas fa-question'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR')
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR')
}

// Fonction pour obtenir la date d'aujourd'hui au format YYYY-MM-DD
const getTodayDate = (): string => {
  const today = new Date()
  return today.toISOString().split('T')[0]!
}

// Fonction pour obtenir une date future (pour les dates de livraison)
const getFutureDate = (daysToAdd: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysToAdd)
  return date.toISOString().split('T')[0]!
}

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
      orders.value = getDefaultOrders()
      saveOrders()
    }
  } else {
    orders.value = getDefaultOrders()
    saveOrders()
  }
}

const loadServices = () => {
  const savedServices = localStorage.getItem('presso_services')
  if (savedServices) {
    try {
      services.value = JSON.parse(savedServices)
    } catch (e) {
      console.error('Erreur lors du chargement des services:', e)
      // Si les services ne sont pas trouvés, on initialise avec des services par défaut
      services.value = getDefaultServices()
      saveServices()
    }
  } else {
    services.value = getDefaultServices()
    saveServices()
  }
}

const saveServices = () => {
  localStorage.setItem('presso_services', JSON.stringify(services.value))
}

const getDefaultServices = (): Service[] => {
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

const getDefaultOrders = (): Order[] => {
  const today = getTodayDate()
  
  return [
    {
      id: 'CMD001',
      serviceType: 'SRV001', // Utiliser l'ID du service
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
      serviceType: 'SRV002', // Utiliser l'ID du service
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
      serviceType: 'SRV003', // Utiliser l'ID du service
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

const handleScroll = () => {
  if (filtersCard.value) {
    const rect = filtersCard.value.getBoundingClientRect()
    isFiltersSticky.value = rect.top <= 20
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

// Écouter les mises à jour des services
const handleServicesUpdated = (event: CustomEvent) => {
  const { services: updatedServices } = event.detail
  services.value = updatedServices
  saveServices()
}

onMounted(() => {
  loadServices()
  loadOrders()
  window.addEventListener('scroll', handleScroll)
  
  // Écouter les changements depuis d'autres pages
  window.addEventListener('orderStatusChanged', handleOrderStatusChange as EventListener)
  window.addEventListener('servicesUpdated', handleServicesUpdated as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('orderStatusChanged', handleOrderStatusChange as EventListener)
  window.removeEventListener('servicesUpdated', handleServicesUpdated as EventListener)
})
</script>

<style scoped src="@/DashboardOthers/Assets/Styles/Commandes.css"></style>