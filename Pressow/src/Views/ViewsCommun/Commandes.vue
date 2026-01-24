<template>
  <DashboardLayout>
    <div class="orders-page">
      <!-- Header -->
      <header class="page-header">
        <div class="header-info">
          <h1>Commandes</h1>
          <p>Gérez vos commandes et livraisons</p>
        </div>
        <button class="refresh-btn" @click="refreshOrders" :disabled="isLoading">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ spinning: isLoading }">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
        </button>
      </header>

      <!-- Tabs de statuts -->
      <div class="status-tabs">
        <button 
          v-for="tab in statusTabs" 
          :key="tab.value"
          :class="['tab-btn', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          <span class="tab-label">{{ tab.label }}</span>
          <span class="tab-count" :class="tab.countClass">{{ getTabCount(tab.value) }}</span>
        </button>
      </div>

      <!-- Liste des commandes -->
      <div class="orders-list" v-if="!isLoading">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id" 
          class="order-card"
          @click="openOrderDetail(order)"
        >
          <div class="order-header">
            <div class="order-info">
              <span class="order-numero">#{{ order.numero }}</span>
              <span class="order-date">{{ formatDate(order.created) }}</span>
            </div>
            <div class="order-badges">
              <span class="status-badge" :class="getStatusClass(order.statut)">
                {{ order.statut_display }}
              </span>
              <span class="payment-badge" :class="getPaymentClass(order.payment_status)">
                {{ order.payment_status_display }}
              </span>
            </div>
          </div>

          <div class="order-body">
            <div class="client-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>{{ order.client.first_name }} {{ order.client.last_name }}</span>
            </div>
            <div class="address-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{{ order.adresse_collecte }}</span>
            </div>
          </div>

          <div class="order-footer">
            <span class="order-amount">{{ formatCurrency(order.total_estime) }}</span>
            <div class="order-actions">
              <span v-if="order.statut === 'ready' && !order.is_delivery_validated" class="otp-hint">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                OTP requis
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div v-if="filteredOrders.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <p>Aucune commande</p>
          <span>Les commandes apparaîtront ici</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des commandes...</p>
      </div>

      <!-- Modal détail commande -->
      <div v-if="selectedOrder" class="modal-overlay" @click.self="closeOrderDetail">
        <div class="modal order-detail-modal">
          <div class="modal-header">
            <div class="modal-title">
              <h3>#{{ selectedOrder.numero }}</h3>
              <span class="status-badge large" :class="getStatusClass(selectedOrder.statut)">
                {{ selectedOrder.statut_display }}
              </span>
            </div>
            <button class="modal-close" @click="closeOrderDetail">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Infos client -->
            <section class="detail-section">
              <h4>Client</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Nom</span>
                  <span class="value">{{ selectedOrder.client.first_name }} {{ selectedOrder.client.last_name }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Téléphone</span>
                  <span class="value">{{ selectedOrder.client.phone_number }}</span>
                </div>
              </div>
            </section>

            <!-- Adresses -->
            <section class="detail-section">
              <h4>Adresses</h4>
              <div class="address-block">
                <div class="address-item">
                  <span class="address-type collecte">Collecte</span>
                  <p>{{ selectedOrder.adresse_collecte }}</p>
                  <span class="creneau" v-if="selectedOrder.creneau_collecte">{{ selectedOrder.creneau_collecte }}</span>
                </div>
                <div class="address-item" v-if="selectedOrder.adresse_livraison">
                  <span class="address-type livraison">Livraison</span>
                  <p>{{ selectedOrder.adresse_livraison }}</p>
                  <span class="creneau" v-if="selectedOrder.creneau_livraison">{{ selectedOrder.creneau_livraison }}</span>
                </div>
              </div>
            </section>

            <!-- Articles -->
            <section class="detail-section" v-if="selectedOrder.items && selectedOrder.items.length">
              <h4>Articles ({{ selectedOrder.items.length }})</h4>
              <div class="items-list">
                <div v-for="item in selectedOrder.items" :key="item.id" class="item-row">
                  <div class="item-info">
                    <span class="item-name">{{ item.service_name }} - {{ item.article_type_name }}</span>
                    <span class="item-qty">x{{ item.quantity }}</span>
                  </div>
                  <span class="item-price">{{ formatCurrency(item.total_price) }}</span>
                </div>
              </div>
            </section>

            <!-- Récapitulatif financier -->
            <section class="detail-section financial">
              <h4>Récapitulatif</h4>
              <div class="financial-grid">
                <div class="fin-row">
                  <span>Total estimé</span>
                  <span>{{ formatCurrency(selectedOrder.total_estime) }}</span>
                </div>
                <div class="fin-row" v-if="selectedOrder.frais_livraison">
                  <span>Frais de livraison</span>
                  <span>{{ formatCurrency(selectedOrder.frais_livraison) }}</span>
                </div>
                <div class="fin-row total" v-if="selectedOrder.provider_net_amount">
                  <span>Vous recevrez</span>
                  <span class="net-amount">{{ formatCurrency(selectedOrder.provider_net_amount) }}</span>
                </div>
              </div>
            </section>

            <!-- Section OTP (pour commandes prêtes) -->
            <section 
              class="detail-section otp-section" 
              v-if="showOTPSection"
            >
              <h4>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Validation de livraison
              </h4>

              <!-- OTP non généré -->
              <div v-if="!selectedOrder.has_delivery_otp" class="otp-generate">
                <p>Générez un code OTP à communiquer au client pour valider la livraison.</p>
                <button class="btn-primary" @click="generateOTP" :disabled="isOTPLoading">
                  {{ isOTPLoading ? 'Génération...' : 'Générer le code OTP' }}
                </button>
              </div>

              <!-- OTP généré, en attente de validation -->
              <div v-else-if="!selectedOrder.is_delivery_validated" class="otp-validate">
                <p class="otp-info">Le code OTP a été envoyé au client. Demandez-lui le code pour valider la livraison.</p>
                
                <div class="otp-input-group">
                  <input 
                    type="text" 
                    v-model="otpCode"
                    maxlength="6"
                    placeholder="Code à 6 chiffres"
                    class="otp-input"
                    @keyup.enter="validateOTP"
                  />
                  <button 
                    class="btn-validate" 
                    @click="validateOTP" 
                    :disabled="otpCode.length !== 6 || isOTPLoading"
                  >
                    {{ isOTPLoading ? 'Validation...' : 'Valider' }}
                  </button>
                </div>

                <button class="btn-text" @click="regenerateOTP" :disabled="isOTPLoading">
                  Renvoyer le code
                </button>
              </div>

              <!-- Livraison validée -->
              <div v-else class="otp-validated">
                <div class="validated-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>Livraison validée</span>
                </div>
                <p class="validated-date">
                  Validé le {{ formatDateTime(selectedOrder.delivery_otp_validated_at) }}
                </p>
              </div>
            </section>
          </div>

          <!-- Actions selon le statut -->
          <div class="modal-footer">
            <!-- Commande en attente -->
            <template v-if="selectedOrder.statut === 'pending'">
              <button class="btn-reject" @click="openRejectModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Refuser
              </button>
              <button class="btn-accept" @click="handleAccept" :disabled="isLoading">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Accepter
              </button>
            </template>

            <!-- Commande confirmée -->
            <template v-else-if="selectedOrder.statut === 'confirmed'">
              <button class="btn-secondary" @click="closeOrderDetail">Fermer</button>
              <button class="btn-primary" @click="handleMarkCollected" :disabled="isLoading">
                Marquer comme ramassée
              </button>
            </template>

            <!-- Commande collectée -->
            <template v-else-if="selectedOrder.statut === 'collected'">
              <button class="btn-secondary" @click="closeOrderDetail">Fermer</button>
              <button class="btn-primary" @click="handleMarkInProgress" :disabled="isLoading">
                Démarrer le traitement
              </button>
            </template>

            <!-- Commande en cours -->
            <template v-else-if="selectedOrder.statut === 'in_progress'">
              <button class="btn-secondary" @click="closeOrderDetail">Fermer</button>
              <button class="btn-primary" @click="handleMarkReady" :disabled="isLoading">
                Marquer comme prête
              </button>
            </template>

            <!-- Commande prête -->
            <template v-else-if="selectedOrder.statut === 'ready'">
              <button class="btn-secondary" @click="closeOrderDetail">Fermer</button>
            </template>

            <!-- Commande livrée -->
            <template v-else>
              <button class="btn-secondary" @click="closeOrderDetail">Fermer</button>
            </template>
          </div>
        </div>
      </div>

      <!-- Modal de refus -->
      <div v-if="showRejectModal" class="modal-overlay" @click.self="closeRejectModal">
        <div class="modal reject-modal">
          <div class="modal-header">
            <h3>Refuser la commande</h3>
            <button class="modal-close" @click="closeRejectModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <p>Sélectionnez une raison de refus :</p>
            
            <div class="reason-options">
              <label 
                v-for="reason in CANCELLATION_REASONS" 
                :key="reason.value"
                class="reason-option"
                :class="{ selected: rejectReason === reason.value }"
              >
                <input 
                  type="radio" 
                  :value="reason.value" 
                  v-model="rejectReason"
                  name="reject-reason"
                />
                <span class="reason-label">{{ reason.label }}</span>
              </label>
            </div>

            <div class="form-group" v-if="rejectReason === 'other'">
              <label>Précisez la raison</label>
              <textarea 
                v-model="rejectNotes" 
                placeholder="Expliquez la raison du refus..."
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="closeRejectModal">Annuler</button>
            <button 
              class="btn-reject" 
              @click="handleReject" 
              :disabled="!rejectReason || isLoading"
            >
              Confirmer le refus
            </button>
          </div>
        </div>
      </div>

      <!-- Toast de succès -->
      <transition name="toast">
        <div v-if="toastMessage" class="toast" :class="toastType">
          <svg v-if="toastType === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span>{{ toastMessage }}</span>
        </div>
      </transition>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/Components/ComponentsCommun/DashboardLayout.vue'
import { useOrdersStore, CANCELLATION_REASONS } from '@/stores/orders'
import type { Order, OrderStatus } from '@/stores/orders'

const ordersStore = useOrdersStore()

// État local
const activeTab = ref<'all' | 'to_collect' | 'in_progress' | 'ready' | 'delivered'>('all')
const selectedOrder = ref<Order | null>(null)
const showRejectModal = ref(false)
const rejectReason = ref('')
const rejectNotes = ref('')
const otpCode = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Tabs de statut
const statusTabs = [
  { value: 'all', label: 'Toutes', countClass: '' },
  { value: 'to_collect', label: 'À ramasser', countClass: 'pending' },
  { value: 'in_progress', label: 'En cours', countClass: 'progress' },
  { value: 'ready', label: 'Prêtes', countClass: 'ready' },
  { value: 'delivered', label: 'Livrées', countClass: 'delivered' },
] as const

// Computed
const isLoading = computed(() => ordersStore.isLoading)
const isOTPLoading = computed(() => ordersStore.isOTPLoading)
const orders = computed(() => ordersStore.orders)

const filteredOrders = computed(() => {
  switch (activeTab.value) {
    case 'to_collect':
      return orders.value.filter(o => ['pending', 'confirmed'].includes(o.statut))
    case 'in_progress':
      return orders.value.filter(o => ['collected', 'in_progress'].includes(o.statut))
    case 'ready':
      return orders.value.filter(o => o.statut === 'ready')
    case 'delivered':
      return orders.value.filter(o => o.statut === 'delivered')
    default:
      return orders.value
  }
})

const showOTPSection = computed(() => {
  if (!selectedOrder.value) return false
  const validStatuses: OrderStatus[] = ['collected', 'in_progress', 'ready', 'delivered']
  return validStatuses.includes(selectedOrder.value.statut)
})

// Méthodes
function getTabCount(tab: string): number {
  switch (tab) {
    case 'to_collect':
      return orders.value.filter(o => ['pending', 'confirmed'].includes(o.statut)).length
    case 'in_progress':
      return orders.value.filter(o => ['collected', 'in_progress'].includes(o.statut)).length
    case 'ready':
      return orders.value.filter(o => o.statut === 'ready').length
    case 'delivered':
      return orders.value.filter(o => o.statut === 'delivered').length
    default:
      return orders.value.length
  }
}

function getStatusClass(status: OrderStatus): string {
  const classes: Record<OrderStatus, string> = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    collected: 'status-progress',
    in_progress: 'status-progress',
    ready: 'status-ready',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled'
  }
  return classes[status] || ''
}

function getPaymentClass(status: string): string {
  const classes: Record<string, string> = {
    pending: 'payment-pending',
    paid: 'payment-paid',
    escrow: 'payment-escrow',
    released: 'payment-released',
    refunded: 'payment-refunded',
    failed: 'payment-failed'
  }
  return classes[status] || ''
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// Navigation
function openOrderDetail(order: Order): void {
  selectedOrder.value = order
  ordersStore.selectOrder(order)
  otpCode.value = ''
}

function closeOrderDetail(): void {
  selectedOrder.value = null
  ordersStore.selectOrder(null)
  otpCode.value = ''
}

function openRejectModal(): void {
  rejectReason.value = ''
  rejectNotes.value = ''
  showRejectModal.value = true
}

function closeRejectModal(): void {
  showRejectModal.value = false
  rejectReason.value = ''
  rejectNotes.value = ''
}

// Actions
async function refreshOrders(): Promise<void> {
  try {
    await ordersStore.fetchOrders()
  } catch (error) {
    showToast('Erreur lors du chargement', 'error')
  }
}

async function handleAccept(): Promise<void> {
  if (!selectedOrder.value) return
  try {
    await ordersStore.acceptOrder(selectedOrder.value.id)
    showToast('Commande acceptée')
    closeOrderDetail()
  } catch (error: any) {
    showToast(error.message || 'Erreur', 'error')
  }
}

async function handleReject(): Promise<void> {
  if (!selectedOrder.value || !rejectReason.value) return
  try {
    const notes = rejectReason.value === 'other' ? rejectNotes.value : undefined
    await ordersStore.rejectOrder(selectedOrder.value.id, rejectReason.value, notes)
    showToast('Commande refusée')
    closeRejectModal()
    closeOrderDetail()
  } catch (error: any) {
    showToast(error.message || 'Erreur', 'error')
  }
}

async function handleMarkCollected(): Promise<void> {
  if (!selectedOrder.value) return
  try {
    const updated = await ordersStore.markAsCollected(selectedOrder.value.id)
    selectedOrder.value = updated
    showToast('Commande marquée comme ramassée')
  } catch (error: any) {
    showToast(error.message || 'Erreur', 'error')
  }
}

async function handleMarkInProgress(): Promise<void> {
  if (!selectedOrder.value) return
  try {
    const updated = await ordersStore.markAsInProgress(selectedOrder.value.id)
    selectedOrder.value = updated
    showToast('Traitement démarré')
  } catch (error: any) {
    showToast(error.message || 'Erreur', 'error')
  }
}

async function handleMarkReady(): Promise<void> {
  if (!selectedOrder.value) return
  try {
    const updated = await ordersStore.markAsReady(selectedOrder.value.id)
    selectedOrder.value = updated
    showToast('Commande prête')
  } catch (error: any) {
    showToast(error.message || 'Erreur', 'error')
  }
}

// OTP
async function generateOTP(): Promise<void> {
  if (!selectedOrder.value) return
  try {
    await ordersStore.generateDeliveryOTP(selectedOrder.value.id)
    selectedOrder.value = ordersStore.selectedOrder
    showToast('Code OTP envoyé au client')
  } catch (error: any) {
    showToast(error.message || 'Erreur de génération OTP', 'error')
  }
}

async function validateOTP(): Promise<void> {
  if (!selectedOrder.value || otpCode.value.length !== 6) return
  try {
    const updated = await ordersStore.validateDeliveryOTP(selectedOrder.value.id, otpCode.value)
    selectedOrder.value = updated
    showToast('Livraison validée ! Paiement en cours de transfert.')
    otpCode.value = ''
  } catch (error: any) {
    showToast(error.message || 'Code OTP invalide', 'error')
  }
}

async function regenerateOTP(): Promise<void> {
  if (!selectedOrder.value) return
  try {
    await ordersStore.regenerateDeliveryOTP(selectedOrder.value.id)
    showToast('Nouveau code OTP envoyé')
  } catch (error: any) {
    showToast(error.message || 'Erreur', 'error')
  }
}

// Charger les commandes au montage
onMounted(async () => {
  await ordersStore.fetchOrders()
})
</script>

<style scoped>
/* Variables - Charte Pressow */
.orders-page {
  --color-primary: #37A1EF;
  --color-primary-dark: #2589d4;
  --color-accent: #F9A13B;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;

  min-height: 100%;
  background: #f8fafc;
  padding: 1.5rem;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.page-header p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.refresh-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.refresh-btn:hover:not(:disabled) {
  background: #f8fafc;
  color: var(--color-primary);
  border-color: var(--color-primary);
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

/* Status Tabs */
.status-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.tab-btn.active {
  background: var(--color-primary);
  color: white;
}

.tab-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.tab-count {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  background: #f1f5f9;
}

.tab-count.pending { background: rgba(249, 161, 59, 0.15); color: #d97706; }
.tab-count.progress { background: rgba(55, 161, 239, 0.15); color: #37A1EF; }
.tab-count.ready { background: rgba(16, 185, 129, 0.15); color: #059669; }
.tab-count.delivered { background: rgba(100, 116, 139, 0.15); color: #475569; }

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: rgba(55, 161, 239, 0.3);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.order-numero {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
}

.order-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.order-badges {
  display: flex;
  gap: 0.375rem;
}

.status-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-badge.large {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.status-pending { background: rgba(249, 161, 59, 0.12); color: #d97706; }
.status-confirmed { background: rgba(55, 161, 239, 0.12); color: #37A1EF; }
.status-progress { background: rgba(55, 161, 239, 0.2); color: #2589d4; }
.status-ready { background: rgba(16, 185, 129, 0.12); color: #059669; }
.status-delivered { background: rgba(100, 116, 139, 0.12); color: #475569; }
.status-cancelled { background: rgba(239, 68, 68, 0.12); color: #dc2626; }

.payment-badge {
  font-size: 0.625rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.payment-pending { background: #fef3c7; color: #92400e; }
.payment-paid, .payment-escrow { background: #dcfce7; color: #166534; }
.payment-released { background: #d1fae5; color: #065f46; }
.payment-refunded, .payment-failed { background: #fee2e2; color: #991b1b; }

.order-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 0.75rem;
}

.client-info, .address-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.client-info svg, .address-info svg {
  color: #94a3b8;
  flex-shrink: 0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-amount {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.order-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.otp-hint {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-accent);
  background: rgba(249, 161, 59, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.chevron {
  color: #94a3b8;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #94a3b8;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.4;
}

.empty-state p {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #64748b;
  margin: 0;
}

.empty-state span {
  font-size: 0.8125rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
}

.loading-state p {
  font-size: 0.875rem;
  color: #64748b;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-title h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #f1f5f9;
}

/* Detail Sections */
.detail-section {
  margin-bottom: 1.25rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.detail-item .label {
  font-size: 0.6875rem;
  color: #94a3b8;
  text-transform: uppercase;
}

.detail-item .value {
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
}

/* Address Block */
.address-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.address-item {
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
}

.address-type {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  display: inline-block;
  margin-bottom: 0.375rem;
}

.address-type.collecte {
  background: rgba(249, 161, 59, 0.12);
  color: #d97706;
}

.address-type.livraison {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.address-item p {
  font-size: 0.875rem;
  color: #1e293b;
  margin: 0;
}

.address-item .creneau {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
  display: block;
}

/* Items List */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.item-row:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-name {
  font-size: 0.875rem;
  color: #1e293b;
}

.item-qty {
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.item-price {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

/* Financial Section */
.financial-grid {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.875rem;
}

.fin-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0;
  font-size: 0.875rem;
  color: #64748b;
}

.fin-row.total {
  border-top: 1px solid #e2e8f0;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  font-weight: 600;
  color: #1e293b;
}

.net-amount {
  color: var(--color-success);
}

/* OTP Section */
.otp-section {
  background: rgba(55, 161, 239, 0.05);
  border: 1px solid rgba(55, 161, 239, 0.15);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
}

.otp-section h4 {
  color: var(--color-primary);
  margin-bottom: 0.75rem;
}

.otp-generate p, .otp-validate p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.75rem;
}

.otp-info {
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 3px solid var(--color-primary);
}

.otp-input-group {
  display: flex;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.otp-input {
  flex: 1;
  padding: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.25em;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  outline: none;
  transition: border-color 0.15s;
}

.otp-input:focus {
  border-color: var(--color-primary);
}

.btn-validate {
  padding: 0.75rem 1.25rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-validate:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-validate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.8125rem;
  cursor: pointer;
  padding: 0;
}

.btn-text:hover {
  text-decoration: underline;
}

.otp-validated {
  text-align: center;
  padding: 1rem;
}

.validated-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.12);
  color: var(--color-success);
  border-radius: 8px;
  font-weight: 600;
}

.validated-date {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.5rem;
}

/* Buttons */
.btn-primary {
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-accept {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--color-success);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-accept:hover:not(:disabled) {
  background: #059669;
}

.btn-accept:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-reject {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fee2e2;
  color: var(--color-danger);
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-reject:hover:not(:disabled) {
  background: #fecaca;
}

.btn-reject:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Reject Modal */
.reject-modal .modal-body p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1rem;
}

.reason-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.reason-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.reason-option:hover {
  background: #f1f5f9;
}

.reason-option.selected {
  background: rgba(239, 68, 68, 0.05);
  border-color: var(--color-danger);
}

.reason-option input {
  display: none;
}

.reason-label {
  font-size: 0.875rem;
  color: #1e293b;
}

.form-group {
  margin-top: 0.75rem;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 0.375rem;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: none;
  outline: none;
  transition: border-color 0.15s;
}

.form-group textarea:focus {
  border-color: var(--color-primary);
}

/* Toast */
.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  background: #1e293b;
  color: white;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 2000;
}

.toast.success {
  background: var(--color-success);
}

.toast.error {
  background: var(--color-danger);
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Responsive */
@media (max-width: 640px) {
  .orders-page {
    padding: 1rem;
  }

  .status-tabs {
    gap: 0.25rem;
    padding: 0.25rem;
  }

  .tab-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .tab-label {
    display: none;
  }

  .tab-btn.active .tab-label {
    display: inline;
  }

  .modal {
    max-height: 95vh;
    border-radius: 16px 16px 0 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-width: 100%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
