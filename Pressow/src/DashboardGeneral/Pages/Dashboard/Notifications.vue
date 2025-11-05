<template>
  <DashboardLayout>
    <div class="notifications-page">
      <!-- En-tête de la page -->
      <div class="notifications-header">
        <div class="header-content">
          <h1 class="page-title">Notifications</h1>
          <p class="page-description">Restez informé de toutes vos activités</p>
        </div>
        <div class="header-actions">
          <button @click="markAllAsRead" class="BtnGlobal2 mark-all-read-btn" :disabled="unreadCount === 0">
            <i class="fas fa-check-double"></i>
            Tout marquer comme lu
          </button>
          <button @click="clearAllNotifications" class="BtnGlobal2 clear-all-btn">
            <i class="fas fa-trash"></i>
            Tout supprimer
          </button>
        </div>
      </div>

      <!-- Filtres des notifications -->
      <div class="notifications-filters">
        <div class="filter-buttons">
          <button 
            v-for="filter in notificationFilters" 
            :key="filter.value"
            class="BtnGlobal2 filter-btn"
            :class="{ 'active-filter': activeFilter === filter.value }"
            @click="setActiveFilter(filter.value)"
          >
            <i :class="filter.icon"></i>
            {{ filter.label }}
            <span v-if="filter.value === 'unread'" class="filter-badge">{{ unreadCount }}</span>
          </button>
        </div>
      </div>

      <!-- Liste des notifications -->
      <div class="notifications-list">
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <div class="empty-content">
            <div class="empty-icon">
              <i class="fas fa-bell-slash"></i>
            </div>
            <h3 class="empty-title">Aucune notification</h3>
            <p class="empty-message">
              {{ activeFilter === 'unread' ? 'Vous n\'avez aucune notification non lue' : 
                 activeFilter === 'orders' ? 'Aucune notification de commande' :
                 activeFilter === 'system' ? 'Aucune notification système' :
                 'Aucune notification' }}
            </p>
          </div>
        </div>

        <div v-else class="notifications-container">
          <div 
            v-for="notification in filteredNotifications" 
            :key="notification.id"
            :class="['notification-card', { 'unread': !notification.read, 'notification-high-priority': notification.priority === 'high' }]"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-content">
              <div class="notification-icon" :class="getNotificationIconClass(notification.type)">
                <i :class="getNotificationIcon(notification.type)"></i>
              </div>
              
              <div class="notification-details">
                <div class="notification-header">
                  <h4 class="notification-title">{{ notification.title }}</h4>
                  <span class="notification-time">{{ formatTimeAgo(notification.timestamp) }}</span>
                </div>
                
                <p class="notification-message">{{ notification.message }}</p>
                
                <div v-if="notification.meta" class="notification-meta">
                  <span v-if="notification.meta.orderId" class="meta-item">
                    <i class="fas fa-hashtag"></i>
                    Commande #{{ notification.meta.orderId }}
                  </span>
                  <span v-if="notification.meta.amount" class="meta-item">
                    <i class="fas fa-euro-sign"></i>
                    {{ formatCurrency(notification.meta.amount) }}
                  </span>
                  <span v-if="notification.meta.service" class="meta-item">
                    <i class="fas fa-cog"></i>
                    {{ notification.meta.service }}
                  </span>
                </div>
              </div>
              
              <div class="notification-actions">
                <button 
                  v-if="!notification.read" 
                  @click.stop="markAsRead(notification.id)"
                  class="action-btn mark-read-btn"
                  title="Marquer comme lu"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button 
                  @click.stop="deleteNotification(notification.id)"
                  class="action-btn delete-btn"
                  title="Supprimer"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Actions spécifiques pour certaines notifications -->
            <div v-if="notification.actions && !notification.read" class="notification-actions-footer">
              <button 
                v-for="action in notification.actions" 
                :key="action.label"
                @click.stop="handleAction(notification, action)"
                :class="['BtnGlobal2', `action-${action.type}`]"
              >
                <i :class="action.icon"></i>
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de détails de notification -->
      <div v-if="selectedNotification" class="modal-overlay" @click="closeNotificationModal">
        <div class="modern-modal notification-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title-section">
              <div class="modal-title-info">
                <div :class="['modal-icon', getNotificationIconClass(selectedNotification.type)]">
                  <i :class="getNotificationIcon(selectedNotification.type)"></i>
                </div>
                <div class="modal-title-content">
                  <h2 class="modal-title">{{ selectedNotification.title }}</h2>
                  <p class="modal-subtitle">{{ formatDateTime(selectedNotification.timestamp) }}</p>
                </div>
              </div>
              <div class="modal-header-badges">
                <span v-if="!selectedNotification.read" class="modal-badge badge-blue">
                  <i class="fas fa-envelope"></i>
                  Non lu
                </span>
                <span :class="['modal-badge', getPriorityBadgeClass(selectedNotification.priority)]">
                  <i :class="getPriorityIcon(selectedNotification.priority)"></i>
                  {{ getPriorityLabel(selectedNotification.priority) }}
                </span>
              </div>
            </div>
            <button class="modal-close-btn" @click="closeNotificationModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-content">
            <div class="notification-detail-content">
              <p class="notification-detail-message">{{ selectedNotification.message }}</p>
              
              <div v-if="selectedNotification.meta" class="notification-detail-meta">
                <div v-if="selectedNotification.meta.orderId" class="detail-meta-item">
                  <strong><i class="fas fa-hashtag"></i> Commande:</strong>
                  <span>#{{ selectedNotification.meta.orderId }}</span>
                </div>
                <div v-if="selectedNotification.meta.amount" class="detail-meta-item">
                  <strong><i class="fas fa-euro-sign"></i> Montant:</strong>
                  <span>{{ formatCurrency(selectedNotification.meta.amount) }}</span>
                </div>
                <div v-if="selectedNotification.meta.service" class="detail-meta-item">
                  <strong><i class="fas fa-cog"></i> Service:</strong>
                  <span>{{ selectedNotification.meta.service }}</span>
                </div>
                <div v-if="selectedNotification.meta.customer" class="detail-meta-item">
                  <strong><i class="fas fa-user"></i> Client:</strong>
                  <span>{{ selectedNotification.meta.customer }}</span>
                </div>
                <div v-if="selectedNotification.meta.address" class="detail-meta-item">
                  <strong><i class="fas fa-map-marker-alt"></i> Adresse:</strong>
                  <span>{{ selectedNotification.meta.address }}</span>
                </div>
              </div>

              <div v-if="selectedNotification.actions && !selectedNotification.read" class="notification-detail-actions">
                <button 
                  v-for="action in selectedNotification.actions" 
                  :key="action.label"
                  @click="handleAction(selectedNotification, action)"
                  :class="['BtnGlobal2', `action-${action.type}`]"
                >
                  <i :class="action.icon"></i>
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/DashboardGeneral/Components/DashboardLayout.vue'

const router = useRouter()

// Types de notifications basés sur l'analyse des fichiers
const NOTIFICATION_TYPES = {
  ORDER_NEW: 'order_new',
  ORDER_ACCEPTED: 'order_accepted',
  ORDER_REFUSED: 'order_refused',
  ORDER_STATUS_CHANGED: 'order_status_changed',
  ORDER_COMPLETED: 'order_completed',
  ORDER_DELETED: 'order_deleted',
  SERVICE_ADDED: 'service_added',
  SERVICE_UPDATED: 'service_updated',
  SERVICE_DELETED: 'service_deleted',
  SERVICE_TOGGLED: 'service_toggled',
  REVENUE_MILESTONE: 'revenue_milestone',
  STATISTICS_UPDATE: 'statistics_update',
  SYSTEM_ALERT: 'system_alert',
  PAYMENT_RECEIVED: 'payment_received'
}

// Données réactives
const notifications = ref([])
const selectedNotification = ref(null)
const activeFilter = ref('all')

// Filtres disponibles
const notificationFilters = [
  { value: 'all', label: 'Toutes', icon: 'fas fa-bell' },
  { value: 'unread', label: 'Non lues', icon: 'fas fa-envelope' },
  { value: 'orders', label: 'Commandes', icon: 'fas fa-shopping-bag' },
  { value: 'services', label: 'Services', icon: 'fas fa-cogs' },
  { value: 'system', label: 'Système', icon: 'fas fa-info-circle' },
  { value: 'payments', label: 'Paiements', icon: 'fas fa-money-bill-wave' }
]

// Computed properties
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const filteredNotifications = computed(() => {
  let filtered = notifications.value
  
  if (activeFilter.value === 'unread') {
    filtered = filtered.filter(n => !n.read)
  } else if (activeFilter.value === 'orders') {
    filtered = filtered.filter(n => n.type.includes('ORDER_'))
  } else if (activeFilter.value === 'services') {
    filtered = filtered.filter(n => n.type.includes('SERVICE_'))
  } else if (activeFilter.value === 'system') {
    filtered = filtered.filter(n => n.type === 'SYSTEM_ALERT' || n.type === 'STATISTICS_UPDATE')
  } else if (activeFilter.value === 'payments') {
    filtered = filtered.filter(n => n.type === 'PAYMENT_RECEIVED' || n.type === 'REVENUE_MILESTONE')
  }
  
  // Trier par date (plus récent en premier)
  return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

// Méthodes
const setActiveFilter = (filter) => {
  activeFilter.value = filter
}

const markAsRead = (notificationId) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
    saveNotifications()
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
  saveNotifications()
}

const deleteNotification = (notificationId) => {
  notifications.value = notifications.value.filter(n => n.id !== notificationId)
  saveNotifications()
}

const clearAllNotifications = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
    notifications.value = []
    saveNotifications()
  }
}

const handleNotificationClick = (notification) => {
  selectedNotification.value = notification
  if (!notification.read) {
    markAsRead(notification.id)
  }
}

const closeNotificationModal = () => {
  selectedNotification.value = null
}

const handleAction = (notification, action) => {
  // Marquer comme lu si ce n'est pas déjà fait
  if (!notification.read) {
    markAsRead(notification.id)
  }

  // Exécuter l'action spécifique
  switch (action.type) {
    case 'view_order':
      if (notification.meta?.orderId) {
        router.push('/Commandes')
      }
      break
    case 'view_services':
      router.push('/Services')
      break
    case 'view_statistics':
      router.push('/Statistics')
      break
    case 'accept_order':
      // Logique pour accepter la commande
      console.log('Accepter la commande:', notification.meta?.orderId)
      break
    case 'dismiss':
      // Simple fermeture
      break
  }

  closeNotificationModal()
}

// Utilitaires d'affichage
const getNotificationIcon = (type) => {
  const icons = {
    [NOTIFICATION_TYPES.ORDER_NEW]: 'fas fa-plus-circle',
    [NOTIFICATION_TYPES.ORDER_ACCEPTED]: 'fas fa-check-circle',
    [NOTIFICATION_TYPES.ORDER_REFUSED]: 'fas fa-times-circle',
    [NOTIFICATION_TYPES.ORDER_STATUS_CHANGED]: 'fas fa-sync-alt',
    [NOTIFICATION_TYPES.ORDER_COMPLETED]: 'fas fa-flag-checkered',
    [NOTIFICATION_TYPES.ORDER_DELETED]: 'fas fa-trash',
    [NOTIFICATION_TYPES.SERVICE_ADDED]: 'fas fa-plus',
    [NOTIFICATION_TYPES.SERVICE_UPDATED]: 'fas fa-edit',
    [NOTIFICATION_TYPES.SERVICE_DELETED]: 'fas fa-trash',
    [NOTIFICATION_TYPES.SERVICE_TOGGLED]: 'fas fa-power-off',
    [NOTIFICATION_TYPES.REVENUE_MILESTONE]: 'fas fa-trophy',
    [NOTIFICATION_TYPES.STATISTICS_UPDATE]: 'fas fa-chart-line',
    [NOTIFICATION_TYPES.SYSTEM_ALERT]: 'fas fa-exclamation-triangle',
    [NOTIFICATION_TYPES.PAYMENT_RECEIVED]: 'fas fa-money-bill-wave'
  }
  return icons[type] || 'fas fa-bell'
}

const getNotificationIconClass = (type) => {
  const classes = {
    [NOTIFICATION_TYPES.ORDER_NEW]: 'icon-blue',
    [NOTIFICATION_TYPES.ORDER_ACCEPTED]: 'icon-green',
    [NOTIFICATION_TYPES.ORDER_REFUSED]: 'icon-red',
    [NOTIFICATION_TYPES.ORDER_STATUS_CHANGED]: 'icon-orange',
    [NOTIFICATION_TYPES.ORDER_COMPLETED]: 'icon-purple',
    [NOTIFICATION_TYPES.ORDER_DELETED]: 'icon-gray',
    [NOTIFICATION_TYPES.SERVICE_ADDED]: 'icon-green',
    [NOTIFICATION_TYPES.SERVICE_UPDATED]: 'icon-blue',
    [NOTIFICATION_TYPES.SERVICE_DELETED]: 'icon-red',
    [NOTIFICATION_TYPES.SERVICE_TOGGLED]: 'icon-orange',
    [NOTIFICATION_TYPES.REVENUE_MILESTONE]: 'icon-gold',
    [NOTIFICATION_TYPES.STATISTICS_UPDATE]: 'icon-purple',
    [NOTIFICATION_TYPES.SYSTEM_ALERT]: 'icon-red',
    [NOTIFICATION_TYPES.PAYMENT_RECEIVED]: 'icon-green'
  }
  return classes[type] || 'icon-blue'
}

const getPriorityBadgeClass = (priority) => {
  const classes = {
    low: 'badge-gray',
    medium: 'badge-blue',
    high: 'badge-red'
  }
  return classes[priority] || 'badge-gray'
}

const getPriorityIcon = (priority) => {
  const icons = {
    low: 'fas fa-arrow-down',
    medium: 'fas fa-minus',
    high: 'fas fa-arrow-up'
  }
  return icons[priority] || 'fas fa-minus'
}

const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute'
  }
  return labels[priority] || 'Moyenne'
}

const formatCurrency = (amount) => {
  if (typeof amount === 'number') {
    return amount.toFixed(2) + ' €'
  }
  return amount + ' €'
}

const formatTimeAgo = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'À l\'instant'
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
  if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`
  
  return formatDate(timestamp)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR')
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR')
}

// Gestion du stockage
const saveNotifications = () => {
  localStorage.setItem('presso_notifications', JSON.stringify(notifications.value))
}

const loadNotifications = () => {
  const saved = localStorage.getItem('presso_notifications')
  if (saved) {
    try {
      notifications.value = JSON.parse(saved)
    } catch (e) {
      console.error('Erreur lors du chargement des notifications:', e)
      notifications.value = getDefaultNotifications()
    }
  } else {
    notifications.value = getDefaultNotifications()
  }
}

const getDefaultNotifications = () => {
  return [
    {
      id: '1',
      type: NOTIFICATION_TYPES.ORDER_NEW,
      title: 'Nouvelle commande reçue',
      message: 'Une nouvelle commande #CMD005 a été créée pour un service de nettoyage à sec.',
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      read: false,
      priority: 'medium',
      meta: {
        orderId: 'CMD005',
        service: 'Nettoyage à sec',
        amount: 35.00,
        customer: 'Marie Laurent',
        address: '15 Rue de la Paix, Paris'
      },
      actions: [
        { type: 'view_order', label: 'Voir la commande', icon: 'fas fa-eye' },
        { type: 'accept_order', label: 'Accepter', icon: 'fas fa-check' }
      ]
    },
    {
      id: '2',
      type: NOTIFICATION_TYPES.ORDER_COMPLETED,
      title: 'Commande terminée',
      message: 'La commande #CMD003 a été livrée avec succès au client.',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      read: true,
      priority: 'low',
      meta: {
        orderId: 'CMD003',
        amount: 60.00,
        customer: 'Pierre Lambert'
      },
      actions: [
        { type: 'view_order', label: 'Voir détails', icon: 'fas fa-eye' }
      ]
    },
    {
      id: '3',
      type: NOTIFICATION_TYPES.SERVICE_ADDED,
      title: 'Nouveau service ajouté',
      message: 'Le service "Repassage express" a été ajouté avec succès à votre catalogue.',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      read: true,
      priority: 'low',
      meta: {
        service: 'Repassage express',
        price: 12.00
      },
      actions: [
        { type: 'view_services', label: 'Gérer les services', icon: 'fas fa-cogs' }
      ]
    },
    {
      id: '4',
      type: NOTIFICATION_TYPES.REVENUE_MILESTONE,
      title: 'Objectif de revenu atteint',
      message: 'Félicitations ! Vous avez atteint 50 000 € de revenus ce mois-ci.',
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      read: true,
      priority: 'medium',
      meta: {
        amount: 50000
      },
      actions: [
        { type: 'view_statistics', label: 'Voir les statistiques', icon: 'fas fa-chart-line' }
      ]
    },
    {
      id: '5',
      type: NOTIFICATION_TYPES.SYSTEM_ALERT,
      title: 'Maintenance programmée',
      message: 'Une maintenance système est prévue ce soir entre 22h et 23h. Le service pourrait être temporairement indisponible.',
      timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      read: true,
      priority: 'high',
      actions: [
        { type: 'dismiss', label: 'Compris', icon: 'fas fa-check' }
      ]
    }
  ]
}

// Lifecycle
onMounted(() => {
  loadNotifications()
})
</script>

<style scoped src="@/DashboardGeneral/Assets/Styles/Notification.css"></style>
