<template>
  <DashboardLayout>
    <div class="dashboard-page">
      <!-- Header avec salutation et switch On/Off -->
      <header class="dashboard-header">
        <div class="header-content">
          <div class="greeting">
            <h1>Bienvenue {{ providerName }} !</h1>
            <p class="subtitle">{{ currentDate }}</p>
          </div>
          
          <!-- Switch En ligne / Hors ligne -->
          <div class="status-toggle">
            <span class="status-label" :class="{ 'is-open': isOpen }">
              {{ isOpen ? 'En ligne' : 'Hors ligne' }}
            </span>
            <button 
              class="toggle-btn" 
              :class="{ 'active': isOpen }"
              @click="toggleOpenStatus"
              :disabled="isToggling"
            >
              <span class="toggle-slider"></span>
            </button>
          </div>
        </div>
      </header>

      <!-- Contenu principal -->
      <div class="dashboard-content">
        <!-- Colonne gauche : Stats et commandes -->
        <div class="main-column">
          <!-- Cartes de statistiques -->
          <section class="stats-section">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon wallet">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M22 10H18C16.9 10 16 10.9 16 12C16 13.1 16.9 14 18 14H22"/>
                  </svg>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ formatCurrency(walletBalance) }}</span>
                  <span class="stat-label">Solde disponible</span>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon orders">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ pendingOrdersCount }}</span>
                  <span class="stat-label">Commandes en attente</span>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon revenue">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ formatCurrency(todayRevenue) }}</span>
                  <span class="stat-label">Gains aujourd'hui</span>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon completed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ weekDelivered }}</span>
                  <span class="stat-label">Livrées cette semaine</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Commandes récentes -->
          <section class="orders-section">
            <div class="section-header">
              <h2>Commandes récentes</h2>
              <router-link to="/Dashboard/Commandes" class="view-all-link">
                Voir tout
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </router-link>
            </div>

            <div class="orders-list" v-if="pendingOrders.length > 0">
              <div 
                v-for="order in pendingOrders" 
                :key="order.id" 
                class="order-item"
                @click="goToOrder(order.id)"
              >
                <div class="order-info">
                  <span class="order-number">{{ order.numero }}</span>
                  <span class="order-client">{{ order.client_name }}</span>
                </div>
                <div class="order-meta">
                  <span class="order-amount">{{ formatCurrency(order.total) }}</span>
                  <span class="order-status" :class="getStatusClass(order.statut)">
                    {{ order.statut_display }}
                  </span>
                </div>
              </div>
            </div>

            <div class="empty-state" v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              <p>Aucune commande en attente</p>
              <span>Les nouvelles commandes apparaîtront ici</span>
            </div>
          </section>

          <!-- Derniers paiements reçus -->
          <section class="payments-section" v-if="recentPayments.length > 0">
            <div class="section-header">
              <h2>Paiements reçus</h2>
              <router-link to="/Dashboard/Portefeuille" class="view-all-link">
                Portefeuille
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </router-link>
            </div>

            <div class="payments-list">
              <div 
                v-for="payment in recentPayments" 
                :key="payment.id" 
                class="payment-item"
              >
                <div class="payment-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/>
                    <polyline points="5 12 12 5 19 12"/>
                  </svg>
                </div>
                <div class="payment-info">
                  <span class="payment-order">{{ payment.order_numero || 'Paiement' }}</span>
                  <span class="payment-time">{{ formatPaymentDate(payment.created) }}</span>
                </div>
                <span class="payment-amount">+{{ formatCurrency(payment.amount) }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Colonne droite : Checklist et partage -->
        <aside class="side-column">
          <!-- Checklist de configuration -->
          <section class="checklist-section">
            <div class="section-header">
              <h2>Configuration</h2>
              <span class="progress-badge">{{ checklistProgress }}%</span>
            </div>

            <div class="checklist">
              <div 
                v-for="item in checklist" 
                :key="item.id" 
                class="checklist-item"
                :class="{ 'completed': item.completed }"
              >
                <div class="check-icon">
                  <svg v-if="item.completed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span v-else class="check-empty"></span>
                </div>
                <div class="check-content">
                  <span class="check-label">{{ item.label }}</span>
                  <span class="check-desc">{{ item.description }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Partage WhatsApp -->
          <section class="share-section">
            <div class="share-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <div class="share-content">
              <h3>Partagez votre boutique</h3>
              <p>Envoyez votre lien à vos clients pour recevoir vos premières commandes</p>
            </div>
            <button class="share-btn" @click="shareOnWhatsApp" :disabled="!shareLink">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Partager
            </button>
          </section>

          <!-- Copier le lien -->
          <section class="copy-link-section">
            <div class="link-display">
              <span class="link-text">{{ shopUrl || 'presso.ci/votre-boutique' }}</span>
              <button class="copy-btn" @click="copyLink" :class="{ 'copied': linkCopied }">
                <svg v-if="!linkCopied" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
            </div>
          </section>
        </aside>
      </div>

      <!-- Loading overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/Components/ComponentsCommun/DashboardLayout.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useOnboardingStore } from '@/stores/onboarding'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'

const router = useRouter()
const dashboardStore = useDashboardStore()
const onboardingStore = useOnboardingStore()
const authStore = useAuthStore()
const walletStore = useWalletStore()

// État local
const isToggling = ref(false)
const linkCopied = ref(false)

// Computed
const isLoading = computed(() => dashboardStore.isLoading)

const providerName = computed(() => {
  return dashboardStore.provider?.name || authStore.user?.first_name || 'Prestataire'
})

const isOpen = computed(() => dashboardStore.isOpen)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const walletBalance = computed(() => dashboardStore.wallet?.balance ?? 0)
const pendingOrdersCount = computed(() => dashboardStore.pendingOrdersCount)
const todayRevenue = computed(() => dashboardStore.stats?.today.revenue ?? 0)
const weekDelivered = computed(() => dashboardStore.stats?.week.delivered_orders ?? 0)

const pendingOrders = computed(() => dashboardStore.pendingOrders)
const checklist = computed(() => dashboardStore.checklist)
const checklistProgress = computed(() => dashboardStore.checklistProgress)

const shareLink = computed(() => dashboardStore.shareLink)
const shopUrl = computed(() => {
  if (shareLink.value?.shop_url) {
    // Extraire juste le domaine + path
    try {
      const url = new URL(shareLink.value.shop_url)
      return url.host + url.pathname
    } catch {
      return shareLink.value.shop_url
    }
  }
  return null
})

// Derniers paiements reçus (crédits)
const recentPayments = computed(() => {
  return walletStore.transactions
    .filter(tx => tx.direction === 'credit' && tx.type === 'order_payment')
    .slice(0, 3)
})

// Méthodes
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA'
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
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

function formatPaymentDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  
  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function goToOrder(orderId: string): void {
  router.push(`/Dashboard/Commandes?order=${orderId}`)
}

async function toggleOpenStatus(): Promise<void> {
  if (isToggling.value) return
  
  isToggling.value = true
  try {
    await onboardingStore.toggleOpenStatus(!isOpen.value)
    // Rafraîchir le dashboard pour refléter le changement
    await dashboardStore.fetchDashboard()
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
  } finally {
    isToggling.value = false
  }
}

function shareOnWhatsApp(): void {
  dashboardStore.shareOnWhatsApp()
}

async function copyLink(): Promise<void> {
  const success = await dashboardStore.copyShopLink()
  if (success) {
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      dashboardStore.fetchDashboard(),
      dashboardStore.fetchShareLink(),
      walletStore.fetchTransactions({ limit: 10 })
    ])
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error)
  }
})
</script>

<style scoped>
/* Variables */
:root {
  --color-primary: #3b82f6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
}

/* Layout */
.dashboard-page {
  min-height: 100%;
  background: #f8fafc;
  padding: 1.5rem;
}

/* Header */
.dashboard-header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.greeting h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.greeting .subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
  text-transform: capitalize;
}

/* Toggle switch */
.status-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  transition: color 0.2s;
}

.status-label.is-open {
  color: #10b981;
}

.toggle-btn {
  position: relative;
  width: 48px;
  height: 26px;
  background: #cbd5e1;
  border: none;
  border-radius: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-btn.active {
  background: #10b981;
}

.toggle-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-btn.active .toggle-slider {
  transform: translateX(22px);
}

/* Dashboard content */
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

/* Stats section */
.stats-section {
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.wallet {
  background: rgba(55, 161, 239, 0.12);
  color: #37A1EF;
}

.stat-icon.orders {
  background: rgba(249, 161, 59, 0.12);
  color: #F9A13B;
}

.stat-icon.revenue {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.stat-icon.completed {
  background: rgba(55, 161, 239, 0.12);
  color: #37A1EF;
}

.stat-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.125rem;
}

/* Orders section */
.orders-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #37A1EF;
  text-decoration: none;
  font-weight: 500;
}

.view-all-link:hover {
  color: #2589d4;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.order-item:hover {
  background: #f1f5f9;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.order-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.order-client {
  font-size: 0.75rem;
  color: #64748b;
}

.order-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.order-amount {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.order-status {
  font-size: 0.625rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-confirmed {
  background: rgba(55, 161, 239, 0.15);
  color: #2589d4;
}

.status-progress {
  background: rgba(55, 161, 239, 0.1);
  color: #37A1EF;
}

.status-ready {
  background: #d1fae5;
  color: #065f46;
}

.status-delivered {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

/* Payments section */
.payments-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-top: 1.5rem;
}

.payments-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f0fdf4;
  border-radius: 8px;
}

.payment-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.payment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.payment-order {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.payment-time {
  font-size: 0.625rem;
  color: #64748b;
}

.payment-amount {
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
  white-space: nowrap;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  margin: 0;
}

.empty-state span {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

/* Side column */
.side-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Checklist section */
.checklist-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.progress-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  background: rgba(55, 161, 239, 0.12);
  color: #37A1EF;
  border-radius: 4px;
}

.checklist {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checklist-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.check-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.checklist-item.completed .check-icon {
  background: #10b981;
  color: white;
}

.check-empty {
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
}

.check-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.check-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.checklist-item.completed .check-label {
  color: #64748b;
}

.check-desc {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Share section */
.share-section {
  background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.share-icon {
  width: 48px;
  height: 48px;
  background: #25D366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.share-content h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #166534;
  margin: 0;
}

.share-content p {
  font-size: 0.75rem;
  color: #15803d;
  margin: 0.25rem 0 0;
  line-height: 1.4;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #166534;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.share-btn:hover {
  background: #14532d;
}

.share-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Copy link section */
.copy-link-section {
  background: white;
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.link-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
}

.link-text {
  font-size: 0.75rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.copy-btn:hover {
  background: #e2e8f0;
  color: #37A1EF;
}

.copy-btn.copied {
  color: #10b981;
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #37A1EF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .dashboard-page {
    padding: 1rem;
  }

  .greeting h1 {
    font-size: 1.25rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-value {
    font-size: 1rem;
  }
}
</style>
