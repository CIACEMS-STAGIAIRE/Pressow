<template>
  <div class="collection-verification">
    <!-- Header -->
    <div class="verification-header">
      <button class="back-btn" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1>Vérification à la collecte</h1>
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
      <button @click="loadOrder" class="retry-btn">Réessayer</button>
    </div>

    <!-- Content -->
    <template v-else-if="order">
      <!-- Order Info Card -->
      <div class="order-card">
        <div class="order-header">
          <span class="order-numero">{{ order.numero }}</span>
          <span class="order-status" :class="order.statut">{{ order.statut_display }}</span>
        </div>
        
        <div class="client-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>{{ getClientName(order.client) }}</span>
        </div>
        
        <div class="address-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{{ order.adresse_collecte }}</span>
        </div>
      </div>

      <!-- Estimation du client -->
      <div class="estimation-card">
        <h3>Estimation du client</h3>
        <div class="estimation-details">
          <div v-if="order.estimated_weight" class="estimation-item">
            <span class="label">Poids déclaré</span>
            <span class="value">{{ order.estimated_weight }} kg</span>
          </div>
          <div v-if="order.estimated_pieces" class="estimation-item">
            <span class="label">Nombre de pièces</span>
            <span class="value">{{ order.estimated_pieces }} pièces</span>
          </div>
          <div class="estimation-item">
            <span class="label">Montant payé</span>
            <span class="value amount">{{ formatCurrency(order.initial_amount_paid || order.total_estime) }}</span>
          </div>
        </div>
      </div>

      <!-- Déjà vérifié ? -->
      <div v-if="order.quantity_verified_at" class="already-verified">
        <div class="verified-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Quantité déjà vérifiée</span>
        </div>
        
        <div class="verified-details">
          <div v-if="order.verified_weight" class="verified-item">
            <span class="label">Poids vérifié</span>
            <span class="value">{{ order.verified_weight }} kg</span>
          </div>
          <div v-if="order.verified_pieces" class="verified-item">
            <span class="label">Pièces vérifiées</span>
            <span class="value">{{ order.verified_pieces }} pièces</span>
          </div>
        </div>
        
        <div v-if="order.adjustment_amount && order.adjustment_amount > 0" class="adjustment-info warning">
          <p>Complément requis : <strong>{{ formatCurrency(order.adjustment_amount) }}</strong></p>
          <p v-if="order.adjustment_deadline" class="deadline">
            Délai client : {{ formatTime(order.adjustment_deadline) }}
          </p>
        </div>
        
        <div v-if="order.credit_issued && order.credit_issued > 0" class="adjustment-info success">
          <p>Crédit accordé au client : <strong>{{ formatCurrency(order.credit_issued) }}</strong></p>
        </div>
        
        <!-- Bouton confirmer collecte si pas encore collectée -->
        <button 
          v-if="order.statut === 'confirmed' && canConfirmCollection"
          class="btn-primary confirm-btn"
          @click="handleConfirmCollection"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">Confirmation...</span>
          <span v-else>Confirmer la collecte</span>
        </button>
      </div>

      <!-- Formulaire de vérification -->
      <div v-else class="verification-form">
        <h3>Vérification réelle</h3>
        
        <!-- Mode poids -->
        <div v-if="verificationMode === 'weight'" class="form-group">
          <label for="verified-weight">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            Poids réel constaté (kg)
          </label>
          <input 
            id="verified-weight"
            type="number" 
            v-model.number="verifiedWeight"
            step="0.1"
            min="0.1"
            placeholder="Ex: 5.5"
            class="input-field"
          />
        </div>
        
        <!-- Mode pièces -->
        <div v-else class="form-group">
          <label for="verified-pieces">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Nombre de pièces constaté
          </label>
          <input 
            id="verified-pieces"
            type="number" 
            v-model.number="verifiedPieces"
            min="1"
            placeholder="Ex: 15"
            class="input-field"
          />
        </div>
        
        <!-- Notes -->
        <div class="form-group">
          <label for="notes">Notes (optionnel)</label>
          <textarea 
            id="notes"
            v-model="notes"
            placeholder="Observations sur le linge..."
            rows="3"
            class="input-field"
          ></textarea>
        </div>
        
        <!-- Délai de réponse client -->
        <div class="form-group">
          <label for="timeout">Délai de réponse client (minutes)</label>
          <select id="timeout" v-model.number="timeoutMinutes" class="input-field">
            <option :value="5">5 minutes</option>
            <option :value="10">10 minutes</option>
            <option :value="15">15 minutes</option>
            <option :value="30">30 minutes</option>
          </select>
        </div>
        
        <!-- Aperçu de l'écart -->
        <div v-if="hasInput" class="preview-card">
          <h4>Aperçu</h4>
          <div class="preview-row">
            <span>Estimation client</span>
            <span>{{ order.estimated_weight ? order.estimated_weight + ' kg' : order.estimated_pieces + ' pièces' }}</span>
          </div>
          <div class="preview-row">
            <span>Quantité vérifiée</span>
            <span>{{ verificationMode === 'weight' ? verifiedWeight + ' kg' : verifiedPieces + ' pièces' }}</span>
          </div>
          <div class="preview-row" :class="discrepancyClass">
            <span>Écart</span>
            <span>{{ discrepancyText }}</span>
          </div>
        </div>
        
        <!-- Bouton de soumission -->
        <button 
          class="btn-primary submit-btn"
          @click="handleVerify"
          :disabled="!canSubmit || isSubmitting"
        >
          <span v-if="isSubmitting">Vérification en cours...</span>
          <span v-else>Vérifier et notifier le client</span>
        </button>
      </div>

      <!-- Résultat de la vérification -->
      <div v-if="verificationResult" class="result-card" :class="resultClass">
        <div class="result-icon">
          <svg v-if="verificationResult.verification.adjustment_needed" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <svg v-else-if="verificationResult.verification.credit_issued > 0" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 8l-8 8"/>
            <path d="M8 8l8 8"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <p class="result-message">{{ verificationResult.message }}</p>
        
        <div v-if="verificationResult.verification.adjustment_needed" class="result-details">
          <p>Le client a été notifié et doit :</p>
          <ul>
            <li>Compléter le paiement de {{ formatCurrency(verificationResult.verification.adjustment_amount) }}</li>
            <li>OU réduire son linge pour correspondre au montant déjà payé</li>
          </ul>
          <p class="deadline-info">
            Délai : {{ formatTime(verificationResult.verification.deadline) }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore, type Order } from '@/stores/orders'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()

// State
const order = ref<Order | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isSubmitting = ref(false)

// Form
const verifiedWeight = ref<number | null>(null)
const verifiedPieces = ref<number | null>(null)
const notes = ref('')
const timeoutMinutes = ref(10)

// Result
const verificationResult = ref<any>(null)

// Computed
const orderId = computed(() => route.params.orderId as string)

const verificationMode = computed(() => {
  if (!order.value) return 'weight'
  return order.value.estimated_weight ? 'weight' : 'pieces'
})

const hasInput = computed(() => {
  return verificationMode.value === 'weight' 
    ? verifiedWeight.value !== null && verifiedWeight.value > 0
    : verifiedPieces.value !== null && verifiedPieces.value > 0
})

const canSubmit = computed(() => hasInput.value)

const discrepancy = computed(() => {
  if (!order.value || !hasInput.value) return 0
  
  if (verificationMode.value === 'weight') {
    return (verifiedWeight.value || 0) - (order.value.estimated_weight || 0)
  } else {
    return (verifiedPieces.value || 0) - (order.value.estimated_pieces || 0)
  }
})

const discrepancyClass = computed(() => {
  if (discrepancy.value > 0) return 'negative' // Client doit payer plus
  if (discrepancy.value < 0) return 'positive' // Client a trop payé
  return 'neutral'
})

const discrepancyText = computed(() => {
  const d = discrepancy.value
  const unit = verificationMode.value === 'weight' ? 'kg' : 'pièces'
  if (d > 0) return `+${d} ${unit} (complément requis)`
  if (d < 0) return `${d} ${unit} (crédit client)`
  return 'Aucun écart'
})

const resultClass = computed(() => {
  if (!verificationResult.value) return ''
  if (verificationResult.value.verification.adjustment_needed) return 'warning'
  if (verificationResult.value.verification.credit_issued > 0) return 'info'
  return 'success'
})

const canConfirmCollection = computed(() => {
  if (!order.value) return false
  // Peut confirmer si pas d'ajustement requis OU si client a accepté la réduction
  if (order.value.payment_status === 'adjustment_required') {
    return order.value.client_accepted_reduction
  }
  return order.value.payment_status === 'paid' || order.value.payment_status === 'escrow'
})

// Methods
function goBack() {
  router.back()
}

async function loadOrder() {
  isLoading.value = true
  loadError.value = null
  
  try {
    const data = await ordersStore.fetchOrder(orderId.value)
    order.value = data
    
    // Pré-remplir avec l'estimation si disponible
    if (data.estimated_weight) {
      verifiedWeight.value = data.estimated_weight
    }
    if (data.estimated_pieces) {
      verifiedPieces.value = data.estimated_pieces
    }
  } catch (err: any) {
    loadError.value = err.response?.data?.detail || 'Erreur lors du chargement de la commande'
  } finally {
    isLoading.value = false
  }
}

async function handleVerify() {
  if (!canSubmit.value || !order.value) return
  
  isSubmitting.value = true
  
  try {
    const payload: any = {
      notes: notes.value,
      timeout_minutes: timeoutMinutes.value
    }
    
    if (verificationMode.value === 'weight') {
      payload.verified_weight = verifiedWeight.value
    } else {
      payload.verified_pieces = verifiedPieces.value
    }
    
    const result = await ordersStore.verifyQuantity(orderId.value, payload)
    verificationResult.value = result
    order.value = result.order
    
  } catch (err: any) {
    alert(err.response?.data?.detail || 'Erreur lors de la vérification')
  } finally {
    isSubmitting.value = false
  }
}

async function handleConfirmCollection() {
  if (!order.value) return
  
  isSubmitting.value = true
  
  try {
    const updatedOrder = await ordersStore.confirmCollection(orderId.value)
    order.value = updatedOrder
    
    // Rediriger vers la liste des commandes
    router.push({ name: 'commandes' })
  } catch (err: any) {
    alert(err.response?.data?.detail || 'Erreur lors de la confirmation')
  } finally {
    isSubmitting.value = false
  }
}

function getClientName(client: any): string {
  if (!client) return 'Client inconnu'
  if (client.nom) return client.nom
  if (client.first_name || client.last_name) {
    return `${client.first_name || ''} ${client.last_name || ''}`.trim()
  }
  return client.phone || client.phone_number || 'Client'
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
  loadOrder()
})
</script>

<style scoped>
.collection-verification {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  padding-bottom: 100px;
}

.verification-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.verification-header h1 {
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
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 8px;
  cursor: pointer;
}

/* Loading & Error States */
.loading-state,
.error-state {
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
  border: 3px solid var(--bg-secondary, #f5f5f5);
  border-top-color: var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color, #3b82f6);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Order Card */
.order-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.order-numero {
  font-weight: 600;
  font-size: 1.1rem;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.order-status.confirmed {
  background: #dbeafe;
  color: #1d4ed8;
}

.order-status.collected {
  background: #e0e7ff;
  color: #4338ca;
}

.client-info,
.address-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Estimation Card */
.estimation-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.estimation-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: var(--text-secondary, #666);
}

.estimation-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.estimation-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 8px;
}

.estimation-item .label {
  color: var(--text-secondary, #666);
}

.estimation-item .value {
  font-weight: 600;
}

.estimation-item .value.amount {
  color: var(--primary-color, #3b82f6);
}

/* Already Verified */
.already-verified {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #059669;
  font-weight: 600;
  margin-bottom: 1rem;
}

.verified-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.verified-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #ecfdf5;
  border-radius: 8px;
}

.adjustment-info {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.adjustment-info.warning {
  background: #fef3c7;
  border: 1px solid #f59e0b;
}

.adjustment-info.success {
  background: #d1fae5;
  border: 1px solid #10b981;
}

.adjustment-info p {
  margin: 0;
}

.adjustment-info .deadline {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
}

/* Verification Form */
.verification-form {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.verification-form h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
}

textarea.input-field {
  resize: vertical;
}

/* Preview Card */
.preview-card {
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.preview-card h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.preview-row:last-child {
  border-bottom: none;
  font-weight: 600;
}

.preview-row.negative {
  color: #dc2626;
}

.preview-row.positive {
  color: #059669;
}

.preview-row.neutral {
  color: var(--text-secondary, #666);
}

/* Buttons */
.btn-primary {
  width: 100%;
  padding: 1rem;
  background: var(--primary-color, #3b82f6);
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

.confirm-btn {
  margin-top: 1rem;
}

/* Result Card */
.result-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.result-card.warning {
  border: 2px solid #f59e0b;
  background: #fffbeb;
}

.result-card.success {
  border: 2px solid #10b981;
  background: #ecfdf5;
}

.result-card.info {
  border: 2px solid #3b82f6;
  background: #eff6ff;
}

.result-icon {
  margin-bottom: 1rem;
}

.result-card.warning .result-icon {
  color: #f59e0b;
}

.result-card.success .result-icon {
  color: #10b981;
}

.result-card.info .result-icon {
  color: #3b82f6;
}

.result-message {
  font-weight: 500;
  margin-bottom: 1rem;
}

.result-details {
  text-align: left;
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
  padding: 1rem;
}

.result-details ul {
  margin: 0.5rem 0;
  padding-left: 1.25rem;
}

.result-details li {
  margin: 0.25rem 0;
}

.deadline-info {
  margin-top: 0.75rem;
  font-weight: 600;
  color: #f59e0b;
}

/* Responsive */
@media (max-width: 480px) {
  .collection-verification {
    padding: 0.75rem;
  }
  
  .verification-header h1 {
    font-size: 1.1rem;
  }
}
</style>
</template>
