<template>
  <div class="order-tracking">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>
      <h1>Suivi de commande</h1>
      <button class="refresh-btn" @click="refreshOrder" :disabled="isLoading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: isLoading }">
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
      </button>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading && !order" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement de la commande...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadOrder">Réessayer</button>
    </div>

    <!-- Order Content -->
    <div v-else-if="order" class="order-content">
      <!-- Order Header Card -->
      <div class="order-header-card">
        <div class="order-number">
          <span class="label">Commande</span>
          <span class="number">{{ order.numero }}</span>
        </div>
        <div class="order-status" :class="statusClass">
          <span class="status-dot"></span>
          {{ order.statut_display }}
        </div>
      </div>

      <!-- OTP Code Section (visible when ready for delivery) -->
      <div v-if="showOtpSection" class="otp-section">
        <div class="otp-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <div>
            <h3>Code de livraison</h3>
            <p>Donnez ce code au livreur pour confirmer la réception</p>
          </div>
        </div>
        
        <div v-if="deliveryOtp" class="otp-code">
          <span v-for="(digit, idx) in deliveryOtp.split('')" :key="idx" class="otp-digit">
            {{ digit }}
          </span>
        </div>
        
        <div v-else-if="isLoadingOtp" class="otp-loading">
          <div class="spinner-small"></div>
          <span>Chargement du code...</span>
        </div>
        
        <div v-else class="otp-unavailable">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Code non disponible</span>
        </div>
      </div>

      <!-- Status Timeline -->
      <div class="timeline-section">
        <h2>Suivi de votre commande</h2>
        
        <div class="timeline">
          <div
            v-for="(step, idx) in timelineSteps"
            :key="step.status"
            class="timeline-step"
            :class="{
              completed: step.completed,
              current: step.current,
              cancelled: step.status === 'cancelled'
            }"
          >
            <div class="timeline-marker">
              <div class="marker-dot">
                <svg v-if="step.completed && step.status !== 'cancelled'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <svg v-else-if="step.status === 'cancelled'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <div v-if="idx < timelineSteps.length - 1" class="marker-line"></div>
            </div>
            
            <div class="timeline-content">
              <h4>{{ step.label }}</h4>
              <p>{{ step.description }}</p>
              <span v-if="step.time" class="step-time">{{ step.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Provider Info -->
      <div class="provider-section">
        <h2>Votre pressing</h2>
        
        <div class="provider-card">
          <div class="provider-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
          </div>
          <div class="provider-info">
            <h3>{{ order.provider?.nom_commercial }}</h3>
            <p v-if="order.provider?.phone">{{ formatPhone(order.provider.phone) }}</p>
          </div>
          <a v-if="order.provider?.phone" :href="`tel:${order.provider.phone}`" class="call-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            Appeler
          </a>
        </div>
      </div>

      <!-- Order Details -->
      <div class="details-section">
        <h2>Détails de la commande</h2>
        
        <!-- Items -->
        <div class="details-card">
          <h3>Articles ({{ order.items?.length || 0 }})</h3>
          <div class="items-list">
            <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
              <div class="item-info">
                <span class="item-name">{{ item.service_label || 'Service' }}</span>
                <span v-if="item.article_type_label" class="item-type">{{ item.article_type_label }}</span>
              </div>
              <span class="item-qty">x{{ item.quantite_declaree || item.quantity || 1 }}</span>
            </div>
          </div>
        </div>

        <!-- Addresses -->
        <div class="details-card">
          <h3>Adresses</h3>
          
          <div class="address-item">
            <div class="address-icon pickup">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 2v4"></path>
                <path d="M12 18v4"></path>
                <path d="M4.93 4.93l2.83 2.83"></path>
                <path d="M16.24 16.24l2.83 2.83"></path>
                <path d="M2 12h4"></path>
                <path d="M18 12h4"></path>
                <path d="M4.93 19.07l2.83-2.83"></path>
                <path d="M16.24 7.76l2.83-2.83"></path>
              </svg>
            </div>
            <div class="address-content">
              <span class="address-label">Collecte</span>
              <p>{{ order.adresse_collecte }}</p>
            </div>
          </div>
          
          <div class="address-item">
            <div class="address-icon delivery">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div class="address-content">
              <span class="address-label">Livraison</span>
              <p>{{ order.adresse_livraison || order.adresse_collecte }}</p>
            </div>
          </div>
        </div>

        <!-- Payment -->
        <div class="details-card">
          <h3>Paiement</h3>
          
          <div class="payment-info">
            <div class="payment-row">
              <span>Statut</span>
              <span class="payment-status" :class="paymentStatusClass">
                {{ order.payment_status_display }}
              </span>
            </div>
            <div class="payment-row total">
              <span>Total estimé</span>
              <span>{{ formatPrice(order.total_estime) }} FCFA</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="order.notes_client" class="details-card">
          <h3>Vos instructions</h3>
          <p class="notes-text">{{ order.notes_client }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <router-link to="/client/orders" class="secondary-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
          Mes commandes
        </router-link>
        
        <button v-if="canCancel" class="cancel-btn" @click="showCancelModal = true">
          Annuler la commande
        </button>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelModal" class="modal-overlay" @click.self="showCancelModal = false">
      <div class="confirm-modal">
        <div class="confirm-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3>Annuler la commande ?</h3>
        <p>Cette action est irréversible. Vous serez remboursé si le paiement a déjà été effectué.</p>
        <div class="confirm-actions">
          <button class="cancel-action-btn" @click="showCancelModal = false">Non, garder</button>
          <button class="confirm-action-btn" @click="cancelOrder">Oui, annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClientStore, type ClientOrder } from '@/stores/client'

const route = useRoute()
const router = useRouter()
const clientStore = useClientStore()

// State
const order = ref<ClientOrder | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const deliveryOtp = ref<string | null>(null)
const isLoadingOtp = ref(false)
const showCancelModal = ref(false)

// Auto-refresh interval
let refreshInterval: ReturnType<typeof setInterval> | null = null

// Computed
const orderId = computed(() => route.params.id as string)

const statusClass = computed(() => {
  if (!order.value) return ''
  const status = order.value.statut
  
  const classes: Record<string, string> = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    collected: 'status-collected',
    in_progress: 'status-progress',
    ready: 'status-ready',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
  }
  
  return classes[status] || 'status-pending'
})

const paymentStatusClass = computed(() => {
  if (!order.value) return ''
  const status = order.value.payment_status
  
  if (status === 'completed' || status === 'escrow') return 'payment-success'
  if (status === 'refunded') return 'payment-refunded'
  if (status === 'failed') return 'payment-failed'
  return 'payment-pending'
})

const showOtpSection = computed(() => {
  if (!order.value) return false
  // Show OTP when order is ready for delivery or delivered
  return ['ready', 'delivered'].includes(order.value.statut)
})

const canCancel = computed(() => {
  if (!order.value) return false
  // Can only cancel if pending or confirmed
  return ['pending', 'confirmed'].includes(order.value.statut)
})

const timelineSteps = computed(() => {
  if (!order.value) return []
  
  const statuses = [
    { status: 'pending', label: 'Commande passée', description: 'Votre commande a été enregistrée' },
    { status: 'confirmed', label: 'Confirmée', description: 'Le pressing a accepté votre commande' },
    { status: 'collected', label: 'Collectée', description: 'Vos vêtements ont été récupérés' },
    { status: 'in_progress', label: 'En traitement', description: 'Vos vêtements sont en cours de nettoyage' },
    { status: 'ready', label: 'Prête', description: 'Votre commande est prête pour la livraison' },
    { status: 'delivered', label: 'Livrée', description: 'Vos vêtements ont été livrés' },
  ]
  
  const currentStatus = order.value.statut
  const currentIndex = statuses.findIndex(s => s.status === currentStatus)
  
  // If cancelled, show cancelled status
  if (currentStatus === 'cancelled') {
    return statuses.slice(0, Math.max(currentIndex, 1)).map((step, idx) => ({
      ...step,
      completed: idx < currentIndex,
      current: false,
      time: null,
    })).concat([{
      status: 'cancelled',
      label: 'Annulée',
      description: 'Cette commande a été annulée',
      completed: false,
      current: true,
      time: null,
    }])
  }
  
  return statuses.map((step, idx) => ({
    ...step,
    completed: idx < currentIndex,
    current: idx === currentIndex,
    time: idx <= currentIndex ? getStepTime(step.status) : null,
  }))
})

// Methods
function formatPrice(price: number | string | undefined): string {
  if (!price) return '0'
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('fr-FR').format(Math.round(num))
}

function formatPhone(phone: string): string {
  // Format: +225 XX XX XX XX XX
  if (phone.startsWith('+225')) {
    const numbers = phone.slice(4).replace(/\D/g, '')
    return `+225 ${numbers.match(/.{1,2}/g)?.join(' ') || numbers}`
  }
  return phone
}

function getStepTime(status: string): string | null {
  // TODO: Get actual timestamps from order history
  // For now, show creation date for first step
  if (status === 'pending' && order.value?.created) {
    const date = new Date(order.value.created)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return null
}

function goBack() {
  router.back()
}

async function loadOrder() {
  isLoading.value = true
  error.value = null
  
  try {
    const result = await clientStore.fetchOrderDetail(orderId.value)
    if (result) {
      order.value = result
      
      // Load OTP if needed
      if (showOtpSection.value && !deliveryOtp.value) {
        loadDeliveryOtp()
      }
    } else {
      error.value = 'Commande introuvable'
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement'
  } finally {
    isLoading.value = false
  }
}

async function refreshOrder() {
  await loadOrder()
}

async function loadDeliveryOtp() {
  if (!order.value) return
  
  isLoadingOtp.value = true
  try {
    const result = await clientStore.fetchOrderDeliveryCode(order.value.id)
    if (result?.otp_code) {
      deliveryOtp.value = result.otp_code
    }
  } catch (err) {
    console.error('Failed to load OTP:', err)
  } finally {
    isLoadingOtp.value = false
  }
}

async function cancelOrder() {
  // TODO: Implement cancel order API
  showCancelModal.value = false
  // For now, just show a message
  alert('Fonctionnalité en cours de développement')
}

// Lifecycle
onMounted(() => {
  loadOrder()
  
  // Auto-refresh every 30 seconds for active orders
  refreshInterval = setInterval(() => {
    if (order.value && !['delivered', 'cancelled'].includes(order.value.statut)) {
      loadOrder()
    }
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

// Watch for OTP section visibility
watch(showOtpSection, (show) => {
  if (show && !deliveryOtp.value) {
    loadDeliveryOtp()
  }
})
</script>

<style scoped>
.order-tracking {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 40px;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 64px;
  z-index: 50;
}

.back-btn,
.refresh-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 10px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover,
.refresh-btn:hover {
  background: #e5e7eb;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn svg.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.page-header h1 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Loading & Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #37A1EF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

.loading-state p,
.error-state p {
  color: #6b7280;
  margin: 0;
}

.retry-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background: #37A1EF;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #2b8dd4;
}

/* Order Content */
.order-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

/* Order Header Card */
.order-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.order-number .label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.order-number .number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.order-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.status-pending { background: #fef3c7; color: #d97706; }
.status-confirmed { background: #dbeafe; color: #2563eb; }
.status-collected { background: #e0e7ff; color: #4f46e5; }
.status-progress { background: #fce7f3; color: #db2777; }
.status-ready { background: #d1fae5; color: #059669; }
.status-delivered { background: #d1fae5; color: #059669; }
.status-cancelled { background: #fee2e2; color: #dc2626; }

/* OTP Section */
.otp-section {
  background: linear-gradient(135deg, #37A1EF 0%, #2b8dd4 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  color: white;
}

.otp-header {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
}

.otp-header svg {
  flex-shrink: 0;
}

.otp-header h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.otp-header p {
  font-size: 0.813rem;
  opacity: 0.9;
  margin: 0;
}

.otp-code {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.otp-digit {
  width: 48px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0;
}

.otp-loading,
.otp-unavailable {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 0.875rem;
  opacity: 0.9;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Timeline Section */
.timeline-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.timeline-section h2,
.provider-section h2,
.details-section h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.timeline {
  display: flex;
  flex-direction: column;
}

.timeline-step {
  display: flex;
  gap: 16px;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-dot {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #9ca3af;
  border-radius: 50%;
  font-size: 0.813rem;
  font-weight: 600;
  transition: all 0.3s;
}

.timeline-step.completed .marker-dot {
  background: #10b981;
  color: white;
}

.timeline-step.current .marker-dot {
  background: #37A1EF;
  color: white;
  box-shadow: 0 0 0 4px rgba(55, 161, 239, 0.2);
}

.timeline-step.cancelled .marker-dot {
  background: #ef4444;
  color: white;
}

.marker-line {
  width: 2px;
  flex: 1;
  min-height: 30px;
  background: #e5e7eb;
  margin: 8px 0;
}

.timeline-step.completed .marker-line {
  background: #10b981;
}

.timeline-content {
  flex: 1;
  padding-bottom: 24px;
}

.timeline-step:last-child .timeline-content {
  padding-bottom: 0;
}

.timeline-content h4 {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.timeline-step.current .timeline-content h4 {
  color: #37A1EF;
}

.timeline-step.cancelled .timeline-content h4 {
  color: #ef4444;
}

.timeline-content p {
  font-size: 0.813rem;
  color: #6b7280;
  margin: 0;
}

.step-time {
  display: inline-block;
  margin-top: 6px;
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Provider Section */
.provider-section {
  margin-bottom: 16px;
}

.provider-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.provider-icon {
  width: 48px;
  height: 48px;
  background: rgba(55, 161, 239, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #37A1EF;
}

.provider-info {
  flex: 1;
}

.provider-info h3 {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 2px 0;
}

.provider-info p {
  font-size: 0.813rem;
  color: #6b7280;
  margin: 0;
}

.call-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #10b981;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.call-btn:hover {
  background: #059669;
}

/* Details Section */
.details-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.details-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.details-card h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
}

.item-type {
  font-size: 0.75rem;
  color: #6b7280;
}

.item-qty {
  font-size: 0.875rem;
  font-weight: 600;
  color: #37A1EF;
}

/* Addresses */
.address-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.address-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.address-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.address-icon.pickup {
  background: rgba(249, 161, 59, 0.1);
  color: #F9A13B;
}

.address-icon.delivery {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.address-content {
  flex: 1;
}

.address-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 2px;
}

.address-content p {
  font-size: 0.875rem;
  color: #1f2937;
  margin: 0;
}

/* Payment Info */
.payment-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.payment-row span:last-child {
  font-weight: 500;
  color: #1f2937;
}

.payment-row.total {
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
  font-weight: 600;
}

.payment-row.total span:last-child {
  color: #37A1EF;
  font-size: 1rem;
}

.payment-status {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 600;
}

.payment-success { background: #d1fae5; color: #059669; }
.payment-pending { background: #fef3c7; color: #d97706; }
.payment-failed { background: #fee2e2; color: #dc2626; }
.payment-refunded { background: #e0e7ff; color: #4f46e5; }

/* Notes */
.notes-text {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.6;
  margin: 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
}

.secondary-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 20px;
  background: #f3f4f6;
  color: #374151;
  text-decoration: none;
  border-radius: 12px;
  font-size: 0.938rem;
  font-weight: 500;
  transition: background 0.2s;
}

.secondary-btn:hover {
  background: #e5e7eb;
}

.cancel-btn {
  flex: 1;
  padding: 14px 20px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 12px;
  font-size: 0.938rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: #fecaca;
}

/* Confirm Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.confirm-modal {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.confirm-icon {
  width: 64px;
  height: 64px;
  background: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.confirm-modal h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.confirm-modal p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.cancel-action-btn,
.confirm-action-btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-action-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-action-btn:hover {
  background: #e5e7eb;
}

.confirm-action-btn {
  background: #ef4444;
  color: white;
}

.confirm-action-btn:hover {
  background: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    top: 64px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .secondary-btn {
    justify-content: center;
  }
}

@media (max-width: 400px) {
  .otp-digit {
    width: 40px;
    height: 48px;
    font-size: 1.25rem;
  }
}
</style>
