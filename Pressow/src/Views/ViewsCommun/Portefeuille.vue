<template>
  <DashboardLayout>
    <div class="wallet-page">
      <!-- Header -->
      <header class="page-header">
        <div class="header-info">
          <h1>Portefeuille</h1>
          <p>Gérez vos gains et effectuez des retraits</p>
        </div>
      </header>

      <!-- Cartes de solde -->
      <section class="balance-section">
        <div class="balance-grid">
          <!-- Solde disponible -->
          <div class="balance-card main">
            <div class="balance-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M22 10H18C16.9 10 16 10.9 16 12C16 13.1 16.9 14 18 14H22"/>
              </svg>
            </div>
            <div class="balance-content">
              <span class="balance-label">Solde disponible</span>
              <span class="balance-amount">{{ formatCurrency(balance) }}</span>
            </div>
            <button 
              class="withdraw-btn" 
              @click="openWithdrawModal"
              :disabled="!canRequestPayout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
              Retirer
            </button>
          </div>

          <!-- Solde en attente -->
          <div class="balance-card pending">
            <div class="balance-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="balance-content">
              <span class="balance-label">En attente de virement</span>
              <span class="balance-amount small">{{ formatCurrency(pendingBalance) }}</span>
            </div>
          </div>

          <!-- Total gagné -->
          <div class="balance-card total">
            <div class="balance-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <div class="balance-content">
              <span class="balance-label">Total gagné</span>
              <span class="balance-amount small">{{ formatCurrency(totalEarned) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Compte Mobile Money -->
      <section class="payout-account-section" v-if="payoutAccount">
        <div class="section-header">
          <h2>Compte de retrait</h2>
        </div>
        <div class="payout-account-card">
          <div class="account-icon" :class="payoutAccount.operator">
            <span>{{ getOperatorInitial(payoutAccount.operator) }}</span>
          </div>
          <div class="account-info">
            <span class="account-name">{{ payoutAccount.account_name }}</span>
            <span class="account-number">{{ payoutAccount.operator_display }} • {{ formatPhone(payoutAccount.phone_number) }}</span>
          </div>
          <span class="account-status" :class="payoutAccount.status">
            {{ payoutAccount.status === 'verified' ? 'Vérifié' : 'En attente' }}
          </span>
        </div>
      </section>

      <!-- Historique des transactions -->
      <section class="transactions-section">
        <div class="section-header">
          <h2>Transactions récentes</h2>
          <div class="filter-tabs">
            <button 
              v-for="filter in transactionFilters" 
              :key="filter.value"
              :class="['filter-tab', { active: activeFilter === filter.value }]"
              @click="activeFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <div class="transactions-list" v-if="filteredTransactions.length > 0">
          <div 
            v-for="tx in filteredTransactions" 
            :key="tx.id" 
            class="transaction-item"
          >
            <div class="tx-icon" :class="tx.direction">
              <svg v-if="tx.direction === 'credit'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
            </div>
            <div class="tx-info">
              <span class="tx-type">{{ tx.type_display }}</span>
              <span class="tx-desc">{{ tx.description || tx.order_numero || '-' }}</span>
            </div>
            <div class="tx-meta">
              <span class="tx-amount" :class="tx.direction">
                {{ tx.direction === 'credit' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
              </span>
              <span class="tx-date">{{ formatDate(tx.created) }}</span>
            </div>
          </div>
        </div>

        <div class="empty-state" v-else>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          <p>Aucune transaction</p>
          <span>Vos transactions apparaîtront ici</span>
        </div>

        <button 
          v-if="hasMoreTransactions" 
          class="load-more-btn"
          @click="loadMoreTransactions"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Chargement...' : 'Voir plus' }}
        </button>
      </section>

      <!-- Modal de retrait -->
      <div v-if="showWithdrawModal" class="modal-overlay" @click.self="closeWithdrawModal">
        <div class="modal">
          <div class="modal-header">
            <h3>Demander un retrait</h3>
            <button class="modal-close" @click="closeWithdrawModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="withdraw-info">
              <div class="info-row">
                <span class="info-label">Solde disponible</span>
                <span class="info-value">{{ formatCurrency(balance) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Frais de transfert</span>
                <span class="info-value">6 FCFA</span>
              </div>
            </div>

            <div class="form-group">
              <label>Montant à retirer</label>
              <div class="amount-input-wrapper">
                <input 
                  type="number" 
                  v-model.number="withdrawAmount"
                  :max="balance"
                  min="500"
                  placeholder="0"
                  class="amount-input"
                />
                <span class="currency">FCFA</span>
              </div>
              <div class="amount-presets">
                <button 
                  v-for="preset in amountPresets" 
                  :key="preset"
                  @click="withdrawAmount = Math.min(preset, balance)"
                  :disabled="preset > balance"
                  class="preset-btn"
                >
                  {{ formatShortCurrency(preset) }}
                </button>
                <button @click="withdrawAmount = balance" class="preset-btn all">
                  Tout
                </button>
              </div>
            </div>

            <div class="withdraw-summary" v-if="withdrawAmount >= 500">
              <div class="summary-row">
                <span>Montant demandé</span>
                <span>{{ formatCurrency(withdrawAmount) }}</span>
              </div>
              <div class="summary-row">
                <span>Frais</span>
                <span>- 6 FCFA</span>
              </div>
              <div class="summary-row total">
                <span>Vous recevrez</span>
                <span>{{ formatCurrency(withdrawAmount - 6) }}</span>
              </div>
            </div>

            <div class="destination-info" v-if="payoutAccount">
              <span class="dest-label">Vers</span>
              <div class="dest-account">
                <span class="dest-operator">{{ payoutAccount.operator_display }}</span>
                <span class="dest-number">{{ payoutAccount.phone_number }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="closeWithdrawModal">Annuler</button>
            <button 
              class="btn-confirm" 
              @click="submitWithdraw"
              :disabled="!canSubmitWithdraw || isSubmitting"
            >
              {{ isSubmitting ? 'Envoi...' : 'Confirmer le retrait' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de succès -->
      <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccessModal">
        <div class="modal success-modal">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h3>Retrait demandé !</h3>
          <p>Votre demande de retrait de <strong>{{ formatCurrency(lastWithdrawAmount) }}</strong> a été enregistrée.</p>
          <p class="success-note">Le virement sera effectué sous 2 heures maximum.</p>
          <button class="btn-confirm" @click="closeSuccessModal">OK</button>
        </div>
      </div>

      <!-- Loading overlay -->
      <div v-if="isLoading && !transactions.length" class="loading-overlay">
        <div class="spinner"></div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import DashboardLayout from '@/Components/ComponentsCommun/DashboardLayout.vue'
import { useWalletStore } from '@/stores/wallet'
import type { TransactionType } from '@/stores/wallet'

const walletStore = useWalletStore()

// État local
const showWithdrawModal = ref(false)
const showSuccessModal = ref(false)
const withdrawAmount = ref(0)
const isSubmitting = ref(false)
const lastWithdrawAmount = ref(0)
const activeFilter = ref<TransactionType | 'all'>('all')

// Filtres de transactions
const transactionFilters = [
  { value: 'all', label: 'Tout' },
  { value: 'order_payment', label: 'Revenus' },
  { value: 'payout', label: 'Retraits' },
] as const

// Presets de montants
const amountPresets = [1000, 5000, 10000, 25000]

// Computed
const isLoading = computed(() => walletStore.isLoading)
const balance = computed(() => walletStore.balance)
const pendingBalance = computed(() => walletStore.pendingBalance)
const totalEarned = computed(() => walletStore.totalEarned)
const payoutAccount = computed(() => walletStore.payoutAccount)
const canRequestPayout = computed(() => walletStore.canRequestPayout)
const transactions = computed(() => walletStore.transactions)
const hasMoreTransactions = computed(() => walletStore.transactionsPagination?.has_more ?? false)

const filteredTransactions = computed(() => {
  if (activeFilter.value === 'all') {
    return transactions.value
  }
  return transactions.value.filter(tx => tx.type === activeFilter.value)
})

const canSubmitWithdraw = computed(() => {
  return withdrawAmount.value >= 500 && withdrawAmount.value <= balance.value
})

// Méthodes
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' FCFA'
}

function formatShortCurrency(amount: number): string {
  if (amount >= 1000) {
    return (amount / 1000) + 'k'
  }
  return amount.toString()
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

function formatPhone(phone: string): string {
  // Format +225XXXXXXXXXX to XX XX XX XX XX
  const digits = phone.replace(/\D/g, '')
  const local = digits.slice(-10)
  return local.replace(/(\d{2})(?=\d)/g, '$1 ')
}

function getOperatorInitial(operator: string): string {
  const initials: Record<string, string> = {
    orange: 'OM',
    mtn: 'MM',
    moov: 'MV',
    wave: 'W'
  }
  return initials[operator] || operator.charAt(0).toUpperCase()
}

function openWithdrawModal(): void {
  withdrawAmount.value = 0
  showWithdrawModal.value = true
}

function closeWithdrawModal(): void {
  showWithdrawModal.value = false
  withdrawAmount.value = 0
}

async function submitWithdraw(): Promise<void> {
  if (!canSubmitWithdraw.value || isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    await walletStore.requestPayout(withdrawAmount.value)
    lastWithdrawAmount.value = withdrawAmount.value
    closeWithdrawModal()
    showSuccessModal.value = true
  } catch (error: any) {
    alert(error.message || 'Erreur lors de la demande de retrait')
  } finally {
    isSubmitting.value = false
  }
}

function closeSuccessModal(): void {
  showSuccessModal.value = false
  lastWithdrawAmount.value = 0
}

async function loadMoreTransactions(): Promise<void> {
  await walletStore.loadMoreTransactions()
}

// Charger les données au montage
onMounted(async () => {
  try {
    await walletStore.loadAll()
  } catch (error) {
    console.error('Erreur lors du chargement du portefeuille:', error)
  }
})

// Recharger les transactions quand le filtre change
watch(activeFilter, async (newFilter) => {
  const filterValue = newFilter === 'all' ? undefined : newFilter
  await walletStore.fetchTransactions({ type: filterValue as TransactionType | undefined })
})
</script>

<style scoped>
/* Variables - Charte graphique Pressow */
:root {
  --color-primary: #37A1EF;
  --color-primary-dark: #2589d4;
  --color-accent: #F9A13B;
  --color-accent-dark: #e8922d;
  --color-success: #10b981;
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
.wallet-page {
  min-height: 100%;
  background: #f8fafc;
  padding: 1.5rem;
}

/* Header */
.page-header {
  margin-bottom: 1.5rem;
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

/* Balance Section */
.balance-section {
  margin-bottom: 1.5rem;
}

.balance-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .balance-grid {
    grid-template-columns: 1fr;
  }
}

.balance-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.balance-card.main {
  background: linear-gradient(135deg, #37A1EF 0%, #2589d4 100%);
  color: white;
}

.balance-card.main .balance-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.balance-card.main .balance-label {
  color: rgba(255, 255, 255, 0.85);
}

.balance-card.main .balance-amount {
  color: white;
}

.balance-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.balance-card.pending .balance-icon {
  background: rgba(249, 161, 59, 0.12);
  color: #F9A13B;
}

.balance-card.total .balance-icon {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.balance-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.balance-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.balance-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.balance-amount.small {
  font-size: 1.125rem;
}

.withdraw-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.withdraw-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.withdraw-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Payout Account Section */
.payout-account-section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.section-header h2 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.payout-account-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.account-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
}

.account-icon.orange { background: #ff6600; }
.account-icon.mtn { background: #ffcc00; color: #333; }
.account-icon.moov { background: #0066cc; }
.account-icon.wave { background: #1dc9ff; }

.account-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.account-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.account-number {
  font-size: 0.75rem;
  color: #64748b;
}

.account-status {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.account-status.verified {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.account-status.pending {
  background: rgba(249, 161, 59, 0.1);
  color: #d97706;
}

/* Transactions Section */
.transactions-section {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-tabs {
  display: flex;
  gap: 0.25rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 6px;
}

.filter-tab {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-tab:hover {
  color: #1e293b;
}

.filter-tab.active {
  background: white;
  color: #37A1EF;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.transactions-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.transaction-item:last-child {
  border-bottom: none;
}

.tx-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tx-icon.credit {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.tx-icon.debit {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.tx-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.tx-type {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.tx-desc {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tx-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.tx-amount {
  font-size: 0.875rem;
  font-weight: 600;
}

.tx-amount.credit {
  color: #10b981;
}

.tx-amount.debit {
  color: #ef4444;
}

.tx-date {
  font-size: 0.625rem;
  color: #94a3b8;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  text-align: center;
  color: #94a3b8;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.4;
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

.load-more-btn {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.load-more-btn:hover:not(:disabled) {
  background: #f1f5f9;
  color: #37A1EF;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.25rem 0;
}

.modal-header h3 {
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
  padding: 1.25rem;
}

.withdraw-info {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.875rem;
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}

.info-label {
  font-size: 0.75rem;
  color: #64748b;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 0.875rem;
  transition: border-color 0.15s;
}

.amount-input-wrapper:focus-within {
  border-color: #37A1EF;
}

.amount-input {
  flex: 1;
  padding: 0.75rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  background: transparent;
  border: none;
  outline: none;
}

.amount-input::placeholder {
  color: #94a3b8;
}

.currency {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.amount-presets {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.preset-btn {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.preset-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #1e293b;
}

.preset-btn.all {
  background: rgba(55, 161, 239, 0.1);
  color: #37A1EF;
}

.preset-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.withdraw-summary {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.875rem;
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0;
  font-size: 0.875rem;
  color: #64748b;
}

.summary-row.total {
  border-top: 1px solid #e2e8f0;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  font-weight: 600;
  color: #1e293b;
}

.destination-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(55, 161, 239, 0.05);
  border: 1px solid rgba(55, 161, 239, 0.15);
  border-radius: 8px;
}

.dest-label {
  font-size: 0.75rem;
  color: #64748b;
}

.dest-account {
  display: flex;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 0 1.25rem 1.25rem;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
  border: none;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-confirm {
  background: #37A1EF;
  color: white;
  border: none;
}

.btn-confirm:hover:not(:disabled) {
  background: #2589d4;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Success modal */
.success-modal {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
}

.success-modal h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.success-modal p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.5rem;
}

.success-note {
  font-size: 0.75rem !important;
  color: #94a3b8 !important;
}

.success-modal .btn-confirm {
  margin-top: 1rem;
  width: auto;
  padding: 0.75rem 2rem;
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
  .wallet-page {
    padding: 1rem;
  }

  .balance-amount {
    font-size: 1.25rem;
  }

  .withdraw-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  .filter-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .modal {
    max-height: 85vh;
  }
}
</style>
