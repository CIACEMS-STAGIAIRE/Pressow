<template>
  <div class="checkout-page">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>
      <h1>Finaliser la commande</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- Empty Cart Redirect -->
    <div v-if="clientStore.cart.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      </div>
      <p>Votre panier est vide</p>
      <router-link to="/client" class="back-link">Retour à l'accueil</router-link>
    </div>

    <!-- Checkout Form -->
    <div v-else class="checkout-content">
      <!-- Step Indicator -->
      <div class="step-indicator">
        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <span class="step-number">1</span>
          <span class="step-label">Adresses</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }"></div>
        <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <span class="step-number">2</span>
          <span class="step-label">Créneau</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 2 }"></div>
        <div class="step" :class="{ active: currentStep >= 3 }">
          <span class="step-number">3</span>
          <span class="step-label">Paiement</span>
        </div>
      </div>

      <!-- Step 1: Addresses -->
      <div v-if="currentStep === 1" class="form-section">
        <h2>Adresses de collecte et livraison</h2>

        <!-- Collection Address -->
        <div class="form-group">
          <label>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Adresse de collecte
          </label>
          <textarea
            v-model="form.adresse_collecte"
            placeholder="Ex: Cocody Riviera 2, Rue des Jardins, Immeuble Soleil"
            rows="3"
            :class="{ error: errors.adresse_collecte }"
          ></textarea>
          <span v-if="errors.adresse_collecte" class="error-text">{{ errors.adresse_collecte }}</span>
        </div>

        <!-- Same address toggle -->
        <label class="checkbox-label">
          <input type="checkbox" v-model="sameAddress" />
          <span class="checkbox-custom"></span>
          Livrer à la même adresse
        </label>

        <!-- Delivery Address -->
        <div v-if="!sameAddress" class="form-group">
          <label>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            Adresse de livraison
          </label>
          <textarea
            v-model="form.adresse_livraison"
            placeholder="Ex: Plateau, Avenue Noguès, Immeuble BICICI"
            rows="3"
            :class="{ error: errors.adresse_livraison }"
          ></textarea>
          <span v-if="errors.adresse_livraison" class="error-text">{{ errors.adresse_livraison }}</span>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            Instructions (optionnel)
          </label>
          <textarea
            v-model="form.notes_client"
            placeholder="Ex: Sonner au portail, code 1234, attention vêtements fragiles..."
            rows="2"
          ></textarea>
        </div>

        <button class="next-btn" @click="goToStep(2)">
          Continuer
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Step 2: Schedule -->
      <div v-if="currentStep === 2" class="form-section">
        <h2>Créneau de collecte</h2>

        <div class="schedule-info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <p>Choisissez le moment idéal pour la collecte de vos vêtements.</p>
        </div>

        <!-- Date Selection -->
        <div class="form-group">
          <label>Date de collecte</label>
          <div class="date-options">
            <button
              v-for="(date, idx) in availableDates"
              :key="idx"
              class="date-btn"
              :class="{ active: selectedDateIndex === idx }"
              @click="selectDate(idx)"
            >
              <span class="date-day">{{ date.dayName }}</span>
              <span class="date-number">{{ date.dayNumber }}</span>
              <span class="date-month">{{ date.month }}</span>
            </button>
          </div>
        </div>

        <!-- Time Slot Selection -->
        <div class="form-group">
          <label>Créneau horaire</label>
          <div class="time-options">
            <button
              v-for="slot in timeSlots"
              :key="slot.value"
              class="time-btn"
              :class="{ active: selectedTimeSlot === slot.value }"
              @click="selectedTimeSlot = slot.value"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {{ slot.label }}
            </button>
          </div>
          <span v-if="errors.creneau" class="error-text">{{ errors.creneau }}</span>
        </div>

        <div class="step-actions">
          <button class="back-step-btn" @click="goToStep(1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            Retour
          </button>
          <button class="next-btn" @click="goToStep(3)">
            Continuer
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 3: Payment -->
      <div v-if="currentStep === 3" class="form-section">
        <h2>Récapitulatif & Paiement</h2>

        <!-- Order Summary -->
        <div class="order-recap">
          <h3>Votre commande</h3>
          
          <div v-for="(items, providerId) in clientStore.cartByProvider" :key="providerId" class="recap-provider">
            <div class="provider-name">{{ items[0]?.providerName }}</div>
            <div class="recap-items">
              <div v-for="(item, idx) in items" :key="idx" class="recap-item">
                <span class="item-name">
                  {{ item.serviceName }}
                  <small v-if="item.articleTypeName">({{ item.articleTypeName }})</small>
                </span>
                <span class="item-qty">x{{ item.quantity }}</span>
                <span class="item-price">{{ formatPrice(item.prix * item.quantity) }} FCFA</span>
              </div>
            </div>
          </div>

          <div class="recap-totals">
            <div class="total-row">
              <span>Sous-total</span>
              <span>{{ formatPrice(clientStore.cartTotal) }} FCFA</span>
            </div>
            <div class="total-row">
              <span>Frais de service (2%)</span>
              <span>{{ formatPrice(serviceFees) }} FCFA</span>
            </div>
            <div class="total-row final">
              <span>Total à payer</span>
              <span>{{ formatPrice(estimatedTotal) }} FCFA</span>
            </div>
          </div>
        </div>

        <!-- Delivery Info -->
        <div class="delivery-recap">
          <h3>Livraison</h3>
          <div class="delivery-detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <div>
              <strong>Collecte:</strong>
              <p>{{ form.adresse_collecte }}</p>
            </div>
          </div>
          <div class="delivery-detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <div>
              <strong>Livraison:</strong>
              <p>{{ sameAddress ? form.adresse_collecte : form.adresse_livraison }}</p>
            </div>
          </div>
          <div class="delivery-detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <div>
              <strong>Créneau:</strong>
              <p>{{ formatSchedule() }}</p>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="payment-section">
          <h3>Mode de paiement</h3>
          
          <div class="payment-methods">
            <button
              v-for="method in paymentMethods"
              :key="method.id"
              class="payment-method"
              :class="{ active: selectedPaymentMethod === method.id }"
              @click="selectedPaymentMethod = method.id"
            >
              <img :src="method.logo" :alt="method.name" class="payment-logo" />
              <span>{{ method.name }}</span>
              <div class="check-icon" v-if="selectedPaymentMethod === method.id">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </button>
          </div>
        </div>

        <div class="step-actions">
          <button class="back-step-btn" @click="goToStep(2)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            Retour
          </button>
          <button class="pay-btn" @click="processPayment" :disabled="isProcessing">
            <span v-if="!isProcessing">
              Payer {{ formatPrice(estimatedTotal) }} FCFA
            </span>
            <span v-else class="processing">
              <span class="spinner-small"></span>
              Traitement...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Simulation Modal -->
    <div v-if="showPaymentModal" class="modal-overlay">
      <div class="payment-modal">
        <div v-if="paymentStep === 'processing'" class="payment-status">
          <div class="payment-spinner"></div>
          <h3>Paiement en cours...</h3>
          <p>Veuillez patienter pendant que nous traitons votre paiement.</p>
        </div>

        <div v-else-if="paymentStep === 'success'" class="payment-status success">
          <div class="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3>Paiement réussi !</h3>
          <p>Votre commande a été créée avec succès.</p>
          <p class="order-number" v-if="createdOrderId">Commande n°{{ createdOrderNumber }}</p>
          <button class="view-order-btn" @click="viewOrder">
            Voir ma commande
          </button>
        </div>

        <div v-else-if="paymentStep === 'error'" class="payment-status error">
          <div class="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3>Erreur de paiement</h3>
          <p>{{ paymentError }}</p>
          <button class="retry-btn" @click="showPaymentModal = false">
            Réessayer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClientStore } from '@/stores/client'

const router = useRouter()
const clientStore = useClientStore()

// Form state
const currentStep = ref(1)
const sameAddress = ref(true)

const form = reactive({
  adresse_collecte: '',
  adresse_livraison: '',
  notes_client: '',
})

const errors = reactive({
  adresse_collecte: '',
  adresse_livraison: '',
  creneau: '',
})

// Schedule state
const selectedDateIndex = ref(0)
const selectedTimeSlot = ref('')
const availableDates = computed(() => {
  const dates = []
  const today = new Date()
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
    
    dates.push({
      date: date,
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      month: monthNames[date.getMonth()],
    })
  }
  
  return dates
})

const timeSlots = [
  { value: '08:00', label: '08h - 10h' },
  { value: '10:00', label: '10h - 12h' },
  { value: '14:00', label: '14h - 16h' },
  { value: '16:00', label: '16h - 18h' },
]

// Payment state
const selectedPaymentMethod = ref('wave')
const paymentMethods = [
  { 
    id: 'wave', 
    name: 'Wave', 
    logo: new URL('@/Assets/img/wave.png', import.meta.url).href
  },
  { 
    id: 'orange_money', 
    name: 'Orange Money', 
    logo: new URL('@/Assets/img/om.png', import.meta.url).href
  },
  { 
    id: 'mtn_momo', 
    name: 'MTN Mobile Money', 
    logo: new URL('@/Assets/img/momo.png', import.meta.url).href
  },
  { 
    id: 'moov_money', 
    name: 'Moov Money', 
    logo: new URL('@/Assets/img/moov.png', import.meta.url).href
  },
]

// Processing state
const isProcessing = ref(false)
const showPaymentModal = ref(false)
const paymentStep = ref<'processing' | 'success' | 'error'>('processing')
const paymentError = ref('')
const createdOrderId = ref('')
const createdOrderNumber = ref('')

// Computed
const serviceFees = computed(() => {
  const fees = Math.round(clientStore.cartTotal * 0.02)
  return Math.max(fees, 100)
})

const estimatedTotal = computed(() => {
  return clientStore.cartTotal + serviceFees.value
})

// Methods
function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(price))
}

function goBack() {
  router.back()
}

function selectDate(index: number) {
  selectedDateIndex.value = index
}

function validateStep(step: number): boolean {
  // Reset errors
  errors.adresse_collecte = ''
  errors.adresse_livraison = ''
  errors.creneau = ''
  
  if (step === 1) {
    if (!form.adresse_collecte.trim()) {
      errors.adresse_collecte = 'Veuillez entrer une adresse de collecte'
      return false
    }
    if (!sameAddress.value && !form.adresse_livraison.trim()) {
      errors.adresse_livraison = 'Veuillez entrer une adresse de livraison'
      return false
    }
  }
  
  if (step === 2) {
    if (!selectedTimeSlot.value) {
      errors.creneau = 'Veuillez sélectionner un créneau horaire'
      return false
    }
  }
  
  return true
}

function goToStep(step: number) {
  if (step > currentStep.value && !validateStep(currentStep.value)) {
    return
  }
  currentStep.value = step
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatSchedule(): string {
  if (selectedDateIndex.value === undefined || !selectedTimeSlot.value) return ''
  
  const date = availableDates.value[selectedDateIndex.value]
  const slot = timeSlots.find(s => s.value === selectedTimeSlot.value)
  
  return `${date.dayName} ${date.dayNumber} ${date.month} - ${slot?.label || ''}`
}

async function processPayment() {
  if (!validateStep(currentStep.value)) return
  
  isProcessing.value = true
  showPaymentModal.value = true
  paymentStep.value = 'processing'
  
  // Simuler le délai de paiement (pour le MVP)
  await new Promise(resolve => setTimeout(resolve, 2500))
  
  try {
    // Créer la commande pour chaque provider
    const providers = Object.keys(clientStore.cartByProvider)
    
    for (const providerId of providers) {
      const items = clientStore.cartByProvider[providerId]
      
      // Préparer les données de la commande
      const selectedDate = availableDates.value[selectedDateIndex.value].date
      const [hours] = selectedTimeSlot.value.split(':')
      selectedDate.setHours(parseInt(hours), 0, 0, 0)
      
      const orderData = {
        provider_id: providerId,
        items: items.map(item => ({
          provider_service_id: item.providerServiceId,
          article_type_id: item.articleTypeId,
          matiere_id: item.matiereId,
          quantity: item.quantity,
        })),
        adresse_collecte: form.adresse_collecte,
        adresse_livraison: sameAddress.value ? form.adresse_collecte : form.adresse_livraison,
        creneau_collecte: selectedDate.toISOString(),
        notes_client: form.notes_client || undefined,
      }
      
      const result = await clientStore.createOrder(orderData)
      
      if (result.success) {
        createdOrderId.value = result.data.id
        createdOrderNumber.value = result.data.numero
      } else {
        throw new Error(result.error || 'Erreur lors de la création de la commande')
      }
    }
    
    paymentStep.value = 'success'
    
  } catch (err: any) {
    console.error('Payment error:', err)
    paymentStep.value = 'error'
    paymentError.value = err.message || 'Une erreur est survenue lors du paiement'
  } finally {
    isProcessing.value = false
  }
}

function viewOrder() {
  showPaymentModal.value = false
  if (createdOrderId.value) {
    router.push(`/client/orders/${createdOrderId.value}`)
  } else {
    router.push('/client/orders')
  }
}

// Lifecycle
onMounted(() => {
  if (clientStore.cart.length === 0) {
    // Redirect to home if cart is empty
    router.replace('/client')
  }
  
  // Default time slot
  if (timeSlots.length > 0) {
    selectedTimeSlot.value = timeSlots[0].value
  }
})
</script>

<style scoped>
.checkout-page {
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

.back-btn {
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
  transition: background 0.2s;
}

.back-btn:hover {
  background: #e5e7eb;
}

.page-header h1 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  margin-bottom: 20px;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 16px 0;
}

.back-link {
  color: #37A1EF;
  text-decoration: none;
  font-weight: 500;
}

/* Checkout Content */
.checkout-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

/* Step Indicator */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  padding: 0 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #9ca3af;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s;
}

.step.active .step-number {
  background: #37A1EF;
  color: white;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.step.active .step-label {
  color: #37A1EF;
}

.step.completed .step-label {
  color: #10b981;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin: 0 8px;
  margin-bottom: 20px;
  max-width: 60px;
  transition: background 0.3s;
}

.step-line.active {
  background: #10b981;
}

/* Form Section */
.form-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-group textarea,
.form-group input[type="text"] {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.938rem;
  color: #1f2937;
  background: #f8fafc;
  resize: none;
  transition: all 0.2s;
}

.form-group textarea:focus,
.form-group input[type="text"]:focus {
  outline: none;
  border-color: #37A1EF;
  background: white;
  box-shadow: 0 0 0 3px rgba(55, 161, 239, 0.1);
}

.form-group textarea.error {
  border-color: #ef4444;
}

.error-text {
  display: block;
  font-size: 0.813rem;
  color: #ef4444;
  margin-top: 6px;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 0.938rem;
  color: #374151;
  transition: background 0.2s;
}

.checkbox-label:hover {
  background: #f1f5f9;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 22px;
  height: 22px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label input:checked + .checkbox-custom {
  background: #37A1EF;
  border-color: #37A1EF;
}

.checkbox-label input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Schedule */
.schedule-info {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(55, 161, 239, 0.08);
  border-radius: 12px;
  color: #37A1EF;
  margin-bottom: 24px;
}

.schedule-info svg {
  flex-shrink: 0;
}

.schedule-info p {
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.date-options {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 0;
  -webkit-overflow-scrolling: touch;
}

.date-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 70px;
  padding: 14px 12px;
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.date-btn:hover {
  background: #f1f5f9;
}

.date-btn.active {
  background: rgba(55, 161, 239, 0.1);
  border-color: #37A1EF;
}

.date-day {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.date-btn.active .date-day {
  color: #37A1EF;
}

.date-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.date-btn.active .date-number {
  color: #37A1EF;
}

.date-month {
  font-size: 0.75rem;
  color: #9ca3af;
}

.time-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.time-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn:hover {
  background: #f1f5f9;
}

.time-btn.active {
  background: rgba(55, 161, 239, 0.1);
  border-color: #37A1EF;
  color: #37A1EF;
}

/* Navigation Buttons */
.next-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #37A1EF;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 24px;
}

.next-btn:hover {
  background: #2b8dd4;
}

.step-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.back-step-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 20px;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 12px;
  font-size: 0.938rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-step-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

/* Order Recap */
.order-recap {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.order-recap h3,
.delivery-recap h3,
.payment-section h3 {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.recap-provider {
  margin-bottom: 12px;
}

.provider-name {
  font-size: 0.813rem;
  font-weight: 600;
  color: #37A1EF;
  margin-bottom: 8px;
}

.recap-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 0.875rem;
  border-bottom: 1px dashed #e5e7eb;
}

.recap-item:last-child {
  border-bottom: none;
}

.item-name {
  flex: 1;
  color: #374151;
}

.item-name small {
  color: #9ca3af;
}

.item-qty {
  color: #6b7280;
}

.item-price {
  font-weight: 500;
  color: #1f2937;
}

.recap-totals {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.total-row span:last-child {
  color: #374151;
  font-weight: 500;
}

.total-row.final {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.total-row.final span:last-child {
  color: #37A1EF;
  font-size: 1.125rem;
}

/* Delivery Recap */
.delivery-recap {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.delivery-detail {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.delivery-detail:last-child {
  border-bottom: none;
}

.delivery-detail svg {
  flex-shrink: 0;
  color: #37A1EF;
  margin-top: 2px;
}

.delivery-detail strong {
  display: block;
  font-size: 0.813rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 2px;
}

.delivery-detail p {
  font-size: 0.875rem;
  color: #1f2937;
  margin: 0;
}

/* Payment Section */
.payment-section {
  margin-bottom: 20px;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-method:hover {
  background: #f1f5f9;
}

.payment-method.active {
  background: rgba(55, 161, 239, 0.08);
  border-color: #37A1EF;
}

.payment-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
}

.payment-method span {
  flex: 1;
  font-size: 0.938rem;
  font-weight: 500;
  color: #374151;
}

.check-icon {
  width: 24px;
  height: 24px;
  background: #37A1EF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

/* Pay Button */
.pay-btn {
  flex: 1;
  padding: 16px 24px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.pay-btn:hover:not(:disabled) {
  background: #059669;
}

.pay-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.processing {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Payment Modal */
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

.payment-modal {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.payment-status h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 20px 0 8px;
}

.payment-status p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.payment-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #37A1EF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #d1fae5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
  margin: 0 auto;
}

.error-icon {
  width: 80px;
  height: 80px;
  background: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  margin: 0 auto;
}

.order-number {
  margin-top: 12px;
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 8px;
  font-weight: 600;
  color: #37A1EF;
}

.view-order-btn {
  margin-top: 24px;
  padding: 14px 32px;
  background: #37A1EF;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.view-order-btn:hover {
  background: #2b8dd4;
}

.retry-btn {
  margin-top: 24px;
  padding: 14px 32px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    top: 64px;
  }
  
  .step-actions {
    flex-direction: column;
  }
  
  .back-step-btn {
    order: 2;
    justify-content: center;
  }
  
  .pay-btn,
  .next-btn {
    order: 1;
  }
}

@media (max-width: 480px) {
  .time-options {
    grid-template-columns: 1fr;
  }
}
</style>
