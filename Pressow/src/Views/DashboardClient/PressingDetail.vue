<template>
  <div class="pressing-detail">
    <!-- Header avec bouton retour -->
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>
      <h1>{{ provider?.nom_commercial || 'Chargement...' }}</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement des services...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadProvider">Réessayer</button>
    </div>

    <!-- Content -->
    <div v-else class="content">
      <!-- Provider Info Card -->
      <div class="provider-card">
        <div class="provider-image">
          <img v-if="provider?.photo" :src="provider.photo" :alt="provider.nom_commercial" />
          <div v-else class="provider-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21,15 16,10 5,21"></polyline>
            </svg>
          </div>
          <span v-if="provider?.is_open" class="status-badge open">Ouvert</span>
          <span v-else class="status-badge closed">Fermé</span>
        </div>
        
        <div class="provider-info">
          <h2>{{ provider?.nom_commercial }}</h2>
          <p class="address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {{ provider?.ville }} {{ provider?.adresse ? `- ${provider.adresse}` : '' }}
          </p>
          <div class="meta">
            <div class="rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#F9A13B" stroke="#F9A13B" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>{{ provider?.note_moyenne?.toFixed(1) || '4.5' }}</span>
            </div>
            <span class="separator">•</span>
            <span class="services-count">{{ services.length }} services</span>
          </div>
        </div>
      </div>

      <!-- Services List -->
      <section class="services-section">
        <h3>Services disponibles</h3>
        
        <div v-if="services.length === 0" class="empty-services">
          <p>Aucun service disponible pour le moment</p>
        </div>
        
        <div v-else class="services-list">
          <div
            v-for="service in services"
            :key="service.id"
            class="service-card"
            @click="openServiceModal(service)"
          >
            <div class="service-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <div class="service-content">
              <h4>{{ service.service.label }}</h4>
              <p class="service-description">{{ service.service.description || 'Service de pressing professionnel' }}</p>
              <div class="service-meta">
                <span class="price">À partir de {{ formatPrice(service.prix_base) }} FCFA</span>
                <span class="delay">{{ service.delai }} jour{{ service.delai > 1 ? 's' : '' }}</span>
              </div>
            </div>
            <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </div>
        </div>
      </section>
    </div>

    <!-- Service Detail Modal -->
    <div v-if="selectedService" class="modal-overlay" @click.self="closeServiceModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ selectedService.service.label }}</h3>
          <button class="close-btn" @click="closeServiceModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Loading tariffs -->
          <div v-if="isLoadingDetails" class="loading-details">
            <div class="spinner-small"></div>
            <span>Chargement des tarifs...</span>
          </div>

          <template v-else>
            <!-- Mode tarif info -->
            <div class="tarif-mode-info">
              <span v-if="selectedService.service.mode_tarif === 'piece'" class="mode-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path>
                </svg>
                Tarif à la pièce
              </span>
              <span v-else-if="selectedService.service.mode_tarif === 'kilo'" class="mode-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Tarif au kilo
              </span>
              <span v-else class="mode-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Forfait
              </span>
            </div>

            <!-- Message d'erreur si service non configuré -->
            <div v-if="serviceConfigError" class="service-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ serviceConfigError }}</span>
            </div>

            <!-- Sélection type d'article (si disponible) -->
            <div v-if="serviceDetails?.article_types?.length > 0" class="selection-group">
              <label>Type d'article <span class="required">*</span></label>
              <div class="options-grid">
                <button
                  v-for="type in serviceDetails.article_types"
                  :key="type.id"
                  class="option-btn"
                  :class="{ active: selectedArticleType?.id === type.id }"
                  @click="selectArticleType(type)"
                >
                  {{ type.nom }}
                </button>
              </div>
            </div>

            <!-- Sélection matière (si disponible) -->
            <div v-if="serviceDetails?.matieres?.length > 0" class="selection-group">
              <label>Matière</label>
              <div class="options-grid">
                <button
                  v-for="matiere in serviceDetails.matieres"
                  :key="matiere.id"
                  class="option-btn"
                  :class="{ active: selectedMatiere?.id === matiere.id }"
                  @click="selectMatiere(matiere)"
                >
                  {{ matiere.nom }}
                </button>
              </div>
            </div>

            <!-- Prix calculé -->
            <div class="price-display">
              <span class="label">Prix unitaire</span>
              <span class="amount">{{ formatPrice(calculatedPrice) }} FCFA</span>
            </div>

            <!-- Quantité -->
            <div class="quantity-section">
              <label>Quantité</label>
              <div class="quantity-control">
                <button class="qty-btn" @click="decreaseQuantity" :disabled="quantity <= 1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <span class="qty-value">{{ quantity }}</span>
                <button class="qty-btn" @click="increaseQuantity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Total -->
            <div class="total-section">
              <span class="label">Total</span>
              <span class="total-amount">{{ formatPrice(calculatedPrice * quantity) }} FCFA</span>
            </div>
          </template>
        </div>

        <div class="modal-footer">
          <button class="add-to-cart-btn" @click="addToCart" :disabled="!canAddToCart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>

    <!-- Cart Floating Button -->
    <router-link v-if="clientStore.cartItemsCount > 0" to="/client/cart" class="cart-fab">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <span class="cart-count">{{ clientStore.cartItemsCount }}</span>
      <span class="cart-total">{{ formatPrice(clientStore.cartTotal) }} FCFA</span>
    </router-link>

    <!-- Toast notification -->
    <Transition name="toast">
      <div v-if="showToast" class="toast" :class="toastType">
        <svg v-if="toastType === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClientStore, type ProviderService, type CartItem } from '@/stores/client'
import api from '@/services/api'

interface ArticleType {
  id: string
  nom: string
  description?: string
}

interface Matiere {
  id: string
  nom: string
  supplement?: number
}

interface Tariff {
  id: string
  article_type: ArticleType
  matiere?: Matiere
  prix: string
}

interface ServiceDetails {
  service: any
  provider_service: any
  article_types: ArticleType[]
  matieres: Matiere[]
  tariffs: Tariff[]
}

interface NearbyProvider {
  id: string
  nom_commercial: string
  photo: string | null
  ville: string
  adresse: string
  note_moyenne: number
  is_open: boolean
}

const route = useRoute()
const router = useRouter()
const clientStore = useClientStore()

// State
const provider = ref<NearbyProvider | null>(null)
const services = ref<ProviderService[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Service modal state
const selectedService = ref<ProviderService | null>(null)
const serviceDetails = ref<ServiceDetails | null>(null)
const isLoadingDetails = ref(false)
const selectedArticleType = ref<ArticleType | null>(null)
const selectedMatiere = ref<Matiere | null>(null)
const quantity = ref(1)

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Computed
const providerId = computed(() => route.params.id as string)

const calculatedPrice = computed(() => {
  if (!selectedService.value) return 0
  
  const basePrice = parseFloat(selectedService.value.prix_base) || 0
  
  if (serviceDetails.value?.tariffs && selectedArticleType.value) {
    // Chercher le tarif correspondant
    const tariff = serviceDetails.value.tariffs.find(t => 
      t.article_type?.id === selectedArticleType.value?.id &&
      (!selectedMatiere.value || t.matiere?.id === selectedMatiere.value?.id)
    )
    if (tariff) {
      return parseFloat(tariff.prix) || basePrice
    }
  }
  
  return basePrice
})

const canAddToCart = computed(() => {
  if (!selectedService.value) return false
  if (isLoadingDetails.value) return false
  
  // Un type d'article DOIT être sélectionné (sauf mode forfait)
  // Car le backend exige article_type_id pour calculer le prix
  if (selectedService.value.service.mode_tarif !== 'forfait') {
    // Si pas de types d'articles disponibles = tarifs non configurés
    if (!serviceDetails.value?.article_types?.length) {
      return false
    }
    // Un type d'article doit être sélectionné
    if (!selectedArticleType.value) {
      return false
    }
  }
  
  return true
})

// Message d'erreur si service non configuré
const serviceConfigError = computed(() => {
  if (!serviceDetails.value) return null
  if (selectedService.value?.service.mode_tarif === 'forfait') return null
  
  if (!serviceDetails.value.article_types?.length) {
    return 'Ce service n\'a pas encore de tarifs configurés par le prestataire.'
  }
  return null
})

// Methods
function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('fr-FR').format(Math.round(num || 0))
}

function goBack() {
  router.back()
}

async function loadProvider() {
  isLoading.value = true
  error.value = null
  
  try {
    // Charger les infos du provider depuis nearbyProviders ou via API
    const existingProvider = clientStore.nearbyProviders.find(p => p.id === providerId.value)
    if (existingProvider) {
      provider.value = existingProvider
    }
    
    // Charger les services
    const response = await api.get(`/catalog/providers/${providerId.value}/services/`)
    services.value = response.data
    
    // Si pas de provider info, créer un objet minimal
    if (!provider.value && services.value.length > 0) {
      provider.value = {
        id: providerId.value,
        nom_commercial: 'Pressing',
        photo: null,
        ville: '',
        adresse: '',
        note_moyenne: 4.5,
        is_open: true,
      }
    }
  } catch (err: any) {
    console.error('Error loading provider:', err)
    error.value = err.response?.data?.detail || 'Erreur lors du chargement des services'
  } finally {
    isLoading.value = false
  }
}

async function openServiceModal(service: ProviderService) {
  selectedService.value = service
  selectedArticleType.value = null
  selectedMatiere.value = null
  quantity.value = 1
  serviceDetails.value = null
  isLoadingDetails.value = true
  
  try {
    const response = await api.get(`/catalog/providers/${providerId.value}/services/${service.id}/details/`)
    serviceDetails.value = response.data
    
    // Sélectionner automatiquement le premier type d'article si disponible
    if (serviceDetails.value?.article_types?.length > 0) {
      selectedArticleType.value = serviceDetails.value.article_types[0]
    }
  } catch (err) {
    console.error('Error loading service details:', err)
    // Utiliser le prix de base si erreur
    serviceDetails.value = {
      service: service.service,
      provider_service: service,
      article_types: [],
      matieres: [],
      tariffs: [],
    }
  } finally {
    isLoadingDetails.value = false
  }
}

function closeServiceModal() {
  selectedService.value = null
  serviceDetails.value = null
}

function selectArticleType(type: ArticleType) {
  selectedArticleType.value = type
  // Réinitialiser la matière si elle n'est plus valide
  if (selectedMatiere.value) {
    const validMatiere = serviceDetails.value?.tariffs.find(
      t => t.article_type?.id === type.id && t.matiere?.id === selectedMatiere.value?.id
    )
    if (!validMatiere) {
      selectedMatiere.value = null
    }
  }
}

function selectMatiere(matiere: Matiere) {
  selectedMatiere.value = selectedMatiere.value?.id === matiere.id ? null : matiere
}

function increaseQuantity() {
  quantity.value++
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function addToCart() {
  if (!canAddToCart.value || !selectedService.value || !provider.value) return
  
  const cartItem: CartItem = {
    providerId: provider.value.id,
    providerName: provider.value.nom_commercial,
    providerServiceId: selectedService.value.id,
    serviceName: selectedService.value.service.label,
    articleTypeId: selectedArticleType.value?.id,
    articleTypeName: selectedArticleType.value?.nom,
    matiereId: selectedMatiere.value?.id,
    matiereName: selectedMatiere.value?.nom,
    prix: calculatedPrice.value,
    quantity: quantity.value,
  }
  
  clientStore.addToCart(cartItem)
  
  // Show toast
  showToastMessage('Article ajouté au panier', 'success')
  
  // Close modal
  closeServiceModal()
}

function showToastMessage(message: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

// Lifecycle
onMounted(() => {
  loadProvider()
})

// Watch for route changes
watch(() => route.params.id, () => {
  loadProvider()
})
</script>

<style scoped>
.pressing-detail {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 100px;
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
  flex: 1;
  text-align: center;
}

.header-spacer {
  width: 40px;
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

@keyframes spin {
  to { transform: rotate(360deg); }
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

/* Content */
.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* Provider Card */
.provider-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.provider-image {
  position: relative;
  height: 180px;
  background: #f3f4f6;
}

.provider-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.provider-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;
}

.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.open {
  background: #10b981;
  color: white;
}

.status-badge.closed {
  background: #ef4444;
  color: white;
}

.provider-info {
  padding: 16px;
}

.provider-info h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.address {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.separator {
  color: #d1d5db;
}

.services-count {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Services Section */
.services-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.services-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.empty-services {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.services-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.service-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.service-card:hover {
  background: #f1f5f9;
}

.service-icon {
  width: 48px;
  height: 48px;
  background: rgba(55, 161, 239, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #37A1EF;
  flex-shrink: 0;
}

.service-content {
  flex: 1;
  min-width: 0;
}

.service-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.service-description {
  font-size: 0.813rem;
  color: #6b7280;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price {
  font-size: 0.875rem;
  font-weight: 600;
  color: #37A1EF;
}

.delay {
  font-size: 0.75rem;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
}

.chevron {
  color: #9ca3af;
  flex-shrink: 0;
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
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  background: white;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 10px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.loading-details {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #6b7280;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #37A1EF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.tarif-mode-info {
  margin-bottom: 20px;
}

.mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(55, 161, 239, 0.1);
  color: #37A1EF;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
}

/* Message d'erreur service non configuré */
.service-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin-bottom: 16px;
}

.service-error svg {
  color: #ef4444;
  flex-shrink: 0;
  margin-top: 2px;
}

.service-error span {
  font-size: 0.875rem;
  color: #b91c1c;
  line-height: 1.4;
}

.selection-group {
  margin-bottom: 20px;
}

.selection-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 10px;
}

.selection-group label .required {
  color: #ef4444;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-btn {
  padding: 10px 16px;
  background: #f3f4f6;
  border: 2px solid transparent;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.option-btn:hover {
  background: #e5e7eb;
}

.option-btn.active {
  background: rgba(55, 161, 239, 0.1);
  border-color: #37A1EF;
  color: #37A1EF;
}

.price-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 20px;
}

.price-display .label {
  font-size: 0.875rem;
  color: #6b7280;
}

.price-display .amount {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.quantity-section {
  margin-bottom: 20px;
}

.quantity-section label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 10px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 8px 16px;
  width: fit-content;
}

.qty-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: none;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #37A1EF;
  color: white;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  min-width: 30px;
  text-align: center;
}

.total-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(135deg, rgba(55, 161, 239, 0.1), rgba(55, 161, 239, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(55, 161, 239, 0.2);
}

.total-section .label {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #37A1EF;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

.add-to-cart-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: #37A1EF;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #2b8dd4;
}

.add-to-cart-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* Cart Floating Button */
.cart-fab {
  position: fixed;
  bottom: 80px;
  left: 20px;
  right: 20px;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #1f2937;
  color: white;
  border-radius: 16px;
  text-decoration: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 100;
  transition: all 0.2s;
}

.cart-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.cart-count {
  background: #37A1EF;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}

.cart-total {
  flex: 1;
  text-align: right;
  font-weight: 600;
}

/* Toast */
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: #1f2937;
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1100;
}

.toast.success {
  background: #10b981;
}

.toast.error {
  background: #ef4444;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    top: 64px;
  }
  
  .provider-image {
    height: 150px;
  }
  
  .modal-content {
    max-height: 90vh;
    border-radius: 20px 20px 0 0;
  }
  
  .cart-fab {
    bottom: 80px;
    left: 16px;
    right: 16px;
  }
}

@media (min-width: 769px) {
  .modal-overlay {
    align-items: center;
  }
  
  .modal-content {
    border-radius: 20px;
    max-height: 80vh;
  }
}
</style>
