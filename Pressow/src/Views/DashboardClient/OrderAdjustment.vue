<template>
  <ClientLayout>
    <div class="order-adjustment">
      <!-- Header -->
      <div class="adjustment-header">
        <button class="back-btn" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>Vérification de commande</h1>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>

      <!-- Error -->
      <div v-else-if="loadError" class="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ loadError }}</p>
        <button @click="loadAdjustmentStatus" class="retry-btn">Réessayer</button>
      </div>

      <!-- Pas d'ajustement requis -->
      <div v-else-if="!adjustmentData?.adjustment_required" class="no-adjustment">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2>Tout est en ordre !</h2>
        <p>Aucun ajustement n'est requis pour cette commande.</p>
        <button @click="goBack" class="btn-primary">Retour aux commandes</button>
      </div>

      <!-- Ajustement requis -->
      <template v-else>
        <!-- Alerte écart -->
        <div class="alert-card">
          <div class="alert-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h2>Écart détecté</h2>
          <p>Le livreur a vérifié votre linge et a constaté un écart avec votre estimation.</p>
        </div>

        <!-- Détails de la commande -->
        <div class="details-card">
          <h3>Commande {{ adjustmentData.order?.numero }}</h3>
          
          <div class="comparison">
            <div class="comparison-row">
              <div class="comparison-item">
                <span class="label">Votre estimation</span>
                <span class="value">
                  {{ adjustmentData.estimated?.weight ? adjustmentData.estimated.weight + ' kg' : '' }}
                  {{ adjustmentData.estimated?.pieces ? adjustmentData.estimated.pieces + ' pièces' : '' }}
                </span>
              </div>
              <div class="comparison-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
              <div class="comparison-item">
                <span class="label">Quantité réelle</span>
                <span class="value highlight">
                  {{ adjustmentData.verified?.weight ? adjustmentData.verified.weight + ' kg' : '' }}
                  {{ adjustmentData.verified?.pieces ? adjustmentData.verified.pieces + ' pièces' : '' }}
                </span>
              </div>
            </div>
          </div>

          <div class="amounts">
            <div class="amount-row">
              <span>Montant déjà payé</span>
              <span>{{ formatCurrency(adjustmentData.initial_paid) }}</span>
            </div>
            <div class="amount-row">
              <span>Nouveau total</span>
              <span>{{ formatCurrency(adjustmentData.new_total) }}</span>
            </div>
            <div class="amount-row highlight">
              <span>Complément à payer</span>
              <span class="adjustment-amount">{{ formatCurrency(adjustmentData.adjustment_amount) }}</span>
            </div>
          </div>
        </div>

        <!-- Deadline -->
        <div v-if="!adjustmentData.timeout_passed && adjustmentData.deadline" class="deadline-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <div>
            <span class="deadline-label">Temps restant pour répondre</span>
            <span class="deadline-value">{{ formatTime(adjustmentData.deadline) }}</span>
          </div>
        </div>

        <div v-else class="deadline-card expired">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <span class="deadline-label">Délai expiré</span>
            <span class="deadline-value">Le livreur ne prendra que ce qui correspond à votre paiement initial.</span>
          </div>
        </div>

        <!-- Options -->
        <div class="options-card" v-if="!adjustmentData.timeout_passed">
          <h3>Choisissez une option</h3>
          
          <!-- Option 1: Compléter le paiement -->
          <div class="option" @click="handleCompletePay">
            <div class="option-icon pay">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div class="option-content">
              <h4>Compléter le paiement</h4>
              <p>Payez {{ formatCurrency(adjustmentData.adjustment_amount) }} pour que tout votre linge soit traité.</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
          
          <!-- Option 2: Réduire le linge -->
          <div class="option" @click="handleAcceptReduction">
            <div class="option-icon reduce">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <div class="option-content">
              <h4>Réduire le linge</h4>
              <p>Gardez uniquement ce qui correspond aux {{ formatCurrency(adjustmentData.initial_paid) }} déjà payés.</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        <!-- Message si délai expiré -->
        <div class="expired-message" v-else>
          <p>Le délai pour compléter le paiement est dépassé.</p>
          <p>Le livreur ne prendra que le linge correspondant au montant déjà payé ({{ formatCurrency(adjustmentData.initial_paid) }}).</p>
          <button @click="goBack" class="btn-secondary">Retour aux commandes</button>
        </div>
      </template>

      <!-- Confirmation Modal -->
      <div v-if="showConfirmModal" class="modal-overlay" @click.self="closeConfirmModal">
        <div class="modal confirm-modal">
          <h3>{{ confirmTitle }}</h3>
          <p>{{ confirmMessage }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="closeConfirmModal" :disabled="isProcessing">Annuler</button>
            <button class="btn-primary" @click="confirmAction" :disabled="isProcessing">
              <span v-if="isProcessing">Traitement...</span>
              <span v-else>Confirmer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </ClientLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClientStore } from '@/stores/client'
import ClientLayout from '@/Components/ComponentsClient/ClientLayout.vue'

const route = useRoute()
const router = useRouter()
const clientStore = useClientStore()

// State
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const adjustmentData = ref<any>(null)
const isProcessing = ref(false)

// Confirmation modal
const showConfirmModal = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const pendingAction = ref<'pay' | 'reduce' | null>(null)

// Methods
function goBack() {
  router.back()
}

async function loadAdjustmentStatus() {
  isLoading.value = true
  loadError.value = null
  
  try {
    const orderId = route.params.orderId as string
    const data = await clientStore.fetchAdjustmentStatus(orderId)
    
    if (data) {
      adjustmentData.value = data
    } else {
      loadError.value = 'Impossible de charger les informations d\'ajustement.'
    }
  } catch (err: any) {
    loadError.value = err.message || 'Erreur lors du chargement'
  } finally {
    isLoading.value = false
  }
}

function handleCompletePay() {
  confirmTitle.value = 'Compléter le paiement'
  confirmMessage.value = `Vous allez payer ${formatCurrency(adjustmentData.value.adjustment_amount)} supplémentaires pour que tout votre linge soit traité.`
  pendingAction.value = 'pay'
  showConfirmModal.value = true
}

function handleAcceptReduction() {
  confirmTitle.value = 'Réduire le linge'
  confirmMessage.value = `Le livreur ne prendra que le linge correspondant aux ${formatCurrency(adjustmentData.value.initial_paid)} déjà payés. Le reste vous sera restitué.`
  pendingAction.value = 'reduce'
  showConfirmModal.value = true
}

function closeConfirmModal() {
  showConfirmModal.value = false
  pendingAction.value = null
}

async function confirmAction() {
  if (!pendingAction.value) return
  
  isProcessing.value = true
  const orderId = route.params.orderId as string
  
  try {
    if (pendingAction.value === 'pay') {
      const result = await clientStore.completeAdjustment(orderId)
      if (result.success && result.data?.payment?.checkout_url) {
        // Rediriger vers la page de paiement
        window.location.href = result.data.payment.checkout_url
      } else {
        alert(result.error || 'Erreur lors de l\'initiation du paiement')
      }
    } else if (pendingAction.value === 'reduce') {
      const result = await clientStore.acceptReduction(orderId)
      if (result.success) {
        alert(result.data?.message || 'Réduction acceptée')
        router.push({ name: 'client-orders' })
      } else {
        alert(result.error || 'Erreur lors de l\'acceptation')
      }
    }
  } catch (err: any) {
    alert(err.message || 'Une erreur est survenue')
  } finally {
    isProcessing.value = false
    closeConfirmModal()
  }
}

function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '0 FCFA'
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

function formatTime(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Lifecycle
onMounted(() => {
  loadAdjustmentStatus()
})
</script>

<style scoped>
.order-adjustment {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  padding-bottom: 100px;
}

.adjustment-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.adjustment-header h1 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
}

/* Loading & Error States */
.loading-state,
.error-state,
.no-adjustment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f5f5f5;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.success-icon {
  color: #10b981;
  margin-bottom: 1rem;
}

.no-adjustment h2 {
  margin: 0 0 0.5rem 0;
  color: #10b981;
}

.no-adjustment p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

/* Alert Card */
.alert-card {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.alert-icon {
  color: #f59e0b;
  margin-bottom: 0.5rem;
}

.alert-card h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #92400e;
}

.alert-card p {
  margin: 0;
  color: #92400e;
  font-size: 0.9rem;
}

/* Details Card */
.details-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.details-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.comparison {
  margin-bottom: 1rem;
}

.comparison-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comparison-item {
  flex: 1;
  text-align: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
}

.comparison-item .label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.comparison-item .value {
  font-weight: 600;
  font-size: 1rem;
}

.comparison-item .value.highlight {
  color: #dc2626;
}

.comparison-arrow {
  color: #9ca3af;
}

.amounts {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.9rem;
}

.amount-row.highlight {
  font-weight: 600;
  font-size: 1rem;
  border-top: 1px dashed #e5e7eb;
  padding-top: 0.75rem;
  margin-top: 0.5rem;
}

.adjustment-amount {
  color: #dc2626;
}

/* Deadline Card */
.deadline-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #1d4ed8;
}

.deadline-card.expired {
  background: #fef2f2;
  border-color: #dc2626;
  color: #991b1b;
}

.deadline-label {
  display: block;
  font-size: 0.8rem;
  opacity: 0.8;
}

.deadline-value {
  font-weight: 600;
  font-size: 0.95rem;
}

/* Options Card */
.options-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.options-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 0.75rem;
}

.option:last-child {
  margin-bottom: 0;
}

.option:hover {
  background: #f3f4f6;
}

.option-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-icon.pay {
  background: #dcfce7;
  color: #16a34a;
}

.option-icon.reduce {
  background: #fef3c7;
  color: #d97706;
}

.option-content {
  flex: 1;
}

.option-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.option-content p {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
}

/* Expired Message */
.expired-message {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.expired-message p {
  margin: 0 0 1rem 0;
  color: #6b7280;
}

/* Buttons */
.btn-primary {
  width: 100%;
  padding: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Modal */
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
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
}

.confirm-modal h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.confirm-modal p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.modal-actions .btn-secondary,
.modal-actions .btn-primary {
  flex: 1;
  padding: 0.75rem;
}

/* Responsive */
@media (max-width: 480px) {
  .order-adjustment {
    padding: 0.75rem;
  }
  
  .adjustment-header h1 {
    font-size: 1.1rem;
  }
  
  .option {
    padding: 0.75rem;
  }
  
  .option-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
