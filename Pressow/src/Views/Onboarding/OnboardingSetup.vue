<template>
  <div class="onboarding-page">
    <!-- Header -->
    <header class="onboarding-header">
      <router-link to="/" class="logo-link">
        <img src="@/Assets/logo_v2_r.png" alt="Presso" class="logo" />
      </router-link>
      <div class="header-info">
        <span class="welcome-text">Bienvenue sur Presso</span>
        <span class="user-name">{{ authStore.user?.first_name || 'Gérant' }}</span>
      </div>
    </header>

    <!-- Main Content -->
    <main class="onboarding-main">
      <!-- Stepper Progress -->
      <div class="stepper-container">
        <div class="stepper">
          <div 
            v-for="(step, index) in steps" 
            :key="step.id"
            :class="['step', { 
              'step-active': currentStep === index + 1,
              'step-completed': currentStep > index + 1
            }]"
          >
            <div class="step-number">
              <i v-if="currentStep > index + 1" class="fas fa-check"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-info">
              <span class="step-title">{{ step.title }}</span>
              <span class="step-description">{{ step.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="step-content">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Chargement...</p>
        </div>

        <!-- Étape 1: Identité du Pressing -->
        <div v-else-if="currentStep === 1" class="form-card">
          <div class="card-header">
            <div class="card-icon identity-icon">
              <i class="fas fa-store"></i>
            </div>
            <div class="card-title">
              <h2>Identité de votre Pressing</h2>
              <p>Ces informations seront visibles par vos clients</p>
            </div>
          </div>

          <form @submit.prevent="submitStep1" class="form-body">
            <div class="form-group">
              <label for="business_name">Nom de votre pressing *</label>
              <input 
                id="business_name"
                v-model="identityForm.business_name"
                type="text"
                placeholder="Ex: Pressing Excellence"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="ville">Ville *</label>
                <input 
                  id="ville"
                  v-model="identityForm.ville"
                  type="text"
                  placeholder="Ex: Abidjan"
                  required
                />
              </div>
              <div class="form-group">
                <label for="quartier">Quartier / Commune</label>
                <input 
                  id="quartier"
                  v-model="identityForm.quartier"
                  type="text"
                  placeholder="Ex: Cocody"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="adresse">Adresse complète *</label>
              <textarea 
                id="adresse"
                v-model="identityForm.adresse"
                placeholder="Rue, numéro, repères..."
                rows="2"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label for="zone_couverture">Zone de couverture</label>
              <input 
                id="zone_couverture"
                v-model="identityForm.zone_couverture"
                type="text"
                placeholder="Ex: Cocody, Riviera, Angré..."
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="rayon_km">Rayon de livraison (km)</label>
                <input 
                  id="rayon_km"
                  v-model.number="identityForm.rayon_km"
                  type="number"
                  min="1"
                  max="50"
                  step="0.5"
                />
              </div>
              <div class="form-group location-group">
                <label>Localisation GPS</label>
                <button type="button" class="btn-location" :class="{ 'btn-location-success': hasLocation }" @click="getGeolocation">
                  <i :class="isLocating ? 'fas fa-spinner fa-spin' : (hasLocation ? 'fas fa-check-circle' : 'fas fa-map-marker-alt')"></i>
                  {{ isLocating ? 'Localisation...' : (hasLocation ? 'Position enregistrée' : 'Obtenir ma position') }}
                </button>
                
                <!-- Carte interactive -->
                <div v-if="showMap" class="map-container">
                  <div class="map-header">
                    <span><i class="fas fa-map-marked-alt"></i> Ajustez votre position si nécessaire</span>
                    <button type="button" class="btn-close-map" @click="showMap = false">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div ref="mapRef" class="map-view"></div>
                  <div class="map-coords">
                    <i class="fas fa-map-pin"></i>
                    <span>{{ identityForm.latitude }}, {{ identityForm.longitude }}</span>
                    <a 
                      :href="`https://www.google.com/maps?q=${identityForm.latitude},${identityForm.longitude}`" 
                      target="_blank" 
                      class="map-link"
                      title="Voir sur Google Maps"
                    >
                      <i class="fas fa-external-link-alt"></i>
                    </a>
                  </div>
                  <p class="map-hint">
                    <i class="fas fa-hand-pointer"></i> 
                    Déplacez le marqueur rouge pour ajuster votre position exacte
                  </p>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i> Enregistrement...
                </span>
                <span v-else>
                  Continuer <i class="fas fa-arrow-right"></i>
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- Étape 2: Services & Tarifs -->
        <div v-else-if="currentStep === 2" class="form-card">
          <div class="card-header">
            <div class="card-icon services-icon">
              <i class="fas fa-concierge-bell"></i>
            </div>
            <div class="card-title">
              <h2>Services & Tarifs</h2>
              <p>Configurez au moins un service pour commencer</p>
            </div>
          </div>

          <form @submit.prevent="submitStep2" class="form-body">
            <!-- Services List -->
            <div class="services-list">
              <div 
                v-for="(service, index) in servicesForm" 
                :key="index"
                class="service-item"
              >
                <div class="service-header">
                  <span class="service-number">Service {{ index + 1 }}</span>
                  <button 
                    v-if="servicesForm.length > 1"
                    type="button" 
                    class="btn-remove"
                    @click="removeService(index)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div class="service-fields">
                  <div class="form-group">
                    <label>Nom du service *</label>
                    <input 
                      v-model="service.label"
                      type="text"
                      placeholder="Ex: Lavage & Repassage"
                      required
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Mode de tarification</label>
                      <select v-model="service.mode_tarif">
                        <option value="piece">Par pièce</option>
                        <option value="kg">Au kilogramme</option>
                        <option value="forfait">Forfait</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Prix de base (FCFA) *</label>
                      <input 
                        v-model.number="service.prix_base"
                        type="number"
                        min="0"
                        step="50"
                        placeholder="500"
                        required
                      />
                    </div>
                    <div class="form-group">
                      <label>Délai (heures)</label>
                      <input 
                        v-model.number="service.delai"
                        type="number"
                        min="1"
                        max="168"
                        placeholder="24"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Service Button -->
            <button type="button" class="btn-add-service" @click="addService">
              <i class="fas fa-plus"></i> Ajouter un service
            </button>

            <!-- Quick Add Common Services -->
            <div class="quick-add-section">
              <span class="quick-add-label">Ajout rapide :</span>
              <div class="quick-add-buttons">
                <button 
                  v-for="preset in servicePresets" 
                  :key="preset.label"
                  type="button"
                  class="btn-preset"
                  @click="addPresetService(preset)"
                  :disabled="isPresetAdded(preset.label)"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="goBack">
                <i class="fas fa-arrow-left"></i> Retour
              </button>
              <button type="submit" class="btn-primary" :disabled="isSubmitting || servicesForm.length === 0">
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i> Enregistrement...
                </span>
                <span v-else>
                  Continuer <i class="fas fa-arrow-right"></i>
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- Étape 3: Informations de Paiement -->
        <div v-else-if="currentStep === 3" class="form-card">
          <div class="card-header">
            <div class="card-icon payout-icon">
              <i class="fas fa-wallet"></i>
            </div>
            <div class="card-title">
              <h2>Informations de Paiement</h2>
              <p>Comment souhaitez-vous recevoir vos paiements ?</p>
            </div>
          </div>

          <form @submit.prevent="submitStep3" class="form-body">
            <div class="form-group">
              <label>Opérateur Mobile Money *</label>
              <div class="operator-grid">
                <label 
                  v-for="op in operators" 
                  :key="op.value"
                  :class="['operator-card', { 'operator-selected': payoutForm.operator === op.value }]"
                >
                  <input 
                    type="radio" 
                    v-model="payoutForm.operator" 
                    :value="op.value"
                    required
                  />
                  <div class="operator-icon" :style="{ backgroundColor: op.color }">
                    <i class="fas fa-mobile-alt"></i>
                  </div>
                  <span class="operator-name">{{ op.label }}</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="phone_number">Numéro de téléphone Mobile Money *</label>
              <div class="phone-input">
                <span class="phone-prefix">+225</span>
                <input 
                  id="phone_number"
                  v-model="payoutForm.phone_number"
                  type="tel"
                  placeholder="0712345678"
                  maxlength="10"
                  required
                />
              </div>
              <span class="input-hint">Ce numéro recevra vos paiements</span>
            </div>

            <div class="form-group">
              <label for="account_name">Nom du titulaire du compte *</label>
              <input 
                id="account_name"
                v-model="payoutForm.account_name"
                type="text"
                placeholder="Nom tel qu'il apparaît sur le compte"
                required
              />
            </div>

            <div class="info-box">
              <i class="fas fa-info-circle"></i>
              <p>Votre compte sera vérifié avant le premier retrait. Assurez-vous que les informations sont correctes.</p>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="goBack">
                <i class="fas fa-arrow-left"></i> Retour
              </button>
              <button type="submit" class="btn-primary btn-success" :disabled="isSubmitting">
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i> Finalisation...
                </span>
                <span v-else>
                  <i class="fas fa-check"></i> Terminer la configuration
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- Étape 4: Félicitations -->
        <div v-else-if="currentStep === 4" class="success-card">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2>Félicitations ! 🎉</h2>
          <p>Votre pressing est maintenant configuré et prêt à recevoir des commandes.</p>
          
          <div class="success-summary">
            <div class="summary-item">
              <i class="fas fa-store"></i>
              <span>{{ onboardingStore.businessName }}</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-concierge-bell"></i>
              <span>{{ servicesForm.length }} service(s) configuré(s)</span>
            </div>
            <div class="summary-item">
              <i class="fas fa-wallet"></i>
              <span>Compte de paiement ajouté</span>
            </div>
          </div>

          <button class="btn-primary btn-large" @click="goToDashboard">
            <i class="fas fa-arrow-right"></i> Accéder à mon Dashboard
          </button>
        </div>
      </div>
    </main>

    <!-- Notification Toast -->
    <div v-if="notification.show" :class="['toast', `toast-${notification.type}`]">
      <i :class="notification.icon"></i>
      <span>{{ notification.message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingStore, type ServiceItem, type TariffMode, type MobileMoneyOperator } from '@/stores/onboarding'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix pour les icônes Leaflet avec Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// ═══════════════════════════════════════════════════════════════════════════════
// STORES & ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

const router = useRouter()
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const isLoading = ref(true)
const isSubmitting = ref(false)
const currentStep = ref(1)

// Map
const mapRef = ref<HTMLElement | null>(null)
const showMap = ref(false)
const isLocating = ref(false)
let map: L.Map | null = null
let marker: L.Marker | null = null

// Notification
const notification = reactive({
  show: false,
  type: 'success' as 'success' | 'error' | 'warning',
  message: '',
  icon: 'fas fa-check-circle'
})

// Steps configuration
const steps = [
  { id: 1, title: 'Identité', description: 'Nom et localisation' },
  { id: 2, title: 'Services', description: 'Tarifs et délais' },
  { id: 3, title: 'Paiement', description: 'Mobile Money' }
]

// Form data - Step 1
const identityForm = reactive({
  business_name: '',
  adresse: '',
  ville: '',
  quartier: '',
  latitude: null as number | null,
  longitude: null as number | null,
  zone_couverture: '',
  rayon_km: 5
})

// Form data - Step 2
const servicesForm = ref<ServiceItem[]>([
  { label: '', mode_tarif: 'piece', prix_base: 0, delai: 24 }
])

// Service presets for quick add
const servicePresets = [
  { label: 'Lavage', mode_tarif: 'piece' as TariffMode, prix_base: 500, delai: 24 },
  { label: 'Repassage', mode_tarif: 'piece' as TariffMode, prix_base: 300, delai: 24 },
  { label: 'Lavage & Repassage', mode_tarif: 'piece' as TariffMode, prix_base: 750, delai: 48 },
  { label: 'Pressing Costume', mode_tarif: 'piece' as TariffMode, prix_base: 2000, delai: 48 },
  { label: 'Nettoyage Draps', mode_tarif: 'piece' as TariffMode, prix_base: 1500, delai: 48 }
]

// Form data - Step 3
const payoutForm = reactive({
  operator: '' as MobileMoneyOperator | '',
  phone_number: '',
  account_name: ''
})

// Operators
const operators = [
  { value: 'orange', label: 'Orange Money', color: '#FF6600' },
  { value: 'mtn', label: 'MTN MoMo', color: '#FFCC00' },
  { value: 'moov', label: 'Moov Money', color: '#0066CC' },
  { value: 'wave', label: 'Wave', color: '#1DC8F2' }
]

// ═══════════════════════════════════════════════════════════════════════════════
// COMPUTED
// ═══════════════════════════════════════════════════════════════════════════════

const hasLocation = computed(() => 
  identityForm.latitude !== null && identityForm.longitude !== null
)

// ═══════════════════════════════════════════════════════════════════════════════
// METHODS
// ═══════════════════════════════════════════════════════════════════════════════

function showNotification(type: 'success' | 'error' | 'warning', message: string) {
  notification.type = type
  notification.message = message
  notification.icon = type === 'success' ? 'fas fa-check-circle' : 
                      type === 'error' ? 'fas fa-exclamation-circle' : 
                      'fas fa-exclamation-triangle'
  notification.show = true
  
  setTimeout(() => {
    notification.show = false
  }, 4000)
}

async function getGeolocation() {
  if (!navigator.geolocation) {
    showNotification('error', 'La géolocalisation n\'est pas supportée par votre navigateur')
    return
  }

  isLocating.value = true
  showNotification('warning', 'Recherche de votre position GPS...')

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      // Arrondir à 6 décimales (précision ~11cm, suffisante pour une adresse)
      identityForm.latitude = Math.round(position.coords.latitude * 1000000) / 1000000
      identityForm.longitude = Math.round(position.coords.longitude * 1000000) / 1000000
      
      // Afficher la précision obtenue
      const accuracy = Math.round(position.coords.accuracy)
      showNotification('success', `Position GPS enregistrée (précision: ±${accuracy}m). Ajustez si nécessaire.`)
      
      isLocating.value = false
      showMap.value = true
      
      // Attendre que le DOM soit mis à jour puis initialiser la carte
      await nextTick()
      setTimeout(() => initMap(), 100)
    },
    (error) => {
      isLocating.value = false
      let message = 'Impossible d\'obtenir votre position'
      if (error.code === 1) {
        message = 'Accès à la géolocalisation refusé. Autorisez l\'accès dans les paramètres du navigateur.'
      } else if (error.code === 2) {
        message = 'Position indisponible. Vérifiez que le GPS est activé.'
      } else if (error.code === 3) {
        message = 'Délai dépassé. Réessayez dans un endroit avec meilleure réception.'
      }
      showNotification('error', message)
    },
    {
      // Options pour une meilleure précision
      enableHighAccuracy: true,  // Force l'utilisation du GPS (pas WiFi)
      timeout: 15000,            // 15 secondes max pour obtenir la position
      maximumAge: 0              // Pas de cache, position fraîche
    }
  )
}

/**
 * Initialise la carte Leaflet avec un marqueur draggable
 */
function initMap() {
  if (!mapRef.value || identityForm.latitude === null || identityForm.longitude === null) return
  
  // Nettoyer la carte existante si elle existe
  if (map) {
    map.remove()
    map = null
  }
  
  const lat = identityForm.latitude
  const lng = identityForm.longitude
  
  // Créer la carte
  map = L.map(mapRef.value).setView([lat, lng], 17)
  
  // Ajouter les tuiles OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)
  
  // Créer une icône personnalisée rouge
  const redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
  
  // Ajouter un marqueur draggable
  marker = L.marker([lat, lng], { 
    draggable: true,
    icon: redIcon
  }).addTo(map)
  
  // Mettre à jour les coordonnées quand le marqueur est déplacé
  marker.on('dragend', () => {
    if (marker) {
      const pos = marker.getLatLng()
      identityForm.latitude = Math.round(pos.lat * 1000000) / 1000000
      identityForm.longitude = Math.round(pos.lng * 1000000) / 1000000
      showNotification('success', 'Position ajustée')
    }
  })
  
  // Permettre aussi de cliquer sur la carte pour déplacer le marqueur
  map.on('click', (e: L.LeafletMouseEvent) => {
    if (marker && map) {
      marker.setLatLng(e.latlng)
      identityForm.latitude = Math.round(e.latlng.lat * 1000000) / 1000000
      identityForm.longitude = Math.round(e.latlng.lng * 1000000) / 1000000
      showNotification('success', 'Position ajustée')
    }
  })
}

function addService() {
  servicesForm.value.push({
    label: '',
    mode_tarif: 'piece',
    prix_base: 0,
    delai: 24
  })
}

function removeService(index: number) {
  if (servicesForm.value.length > 1) {
    servicesForm.value.splice(index, 1)
  }
}

function addPresetService(preset: typeof servicePresets[0]) {
  // Vérifier si le service existe déjà
  if (isPresetAdded(preset.label)) return

  // Si le premier service est vide, le remplacer
  const firstService = servicesForm.value[0]
  if (servicesForm.value.length === 1 && firstService && !firstService.label) {
    servicesForm.value[0] = { ...preset }
  } else {
    servicesForm.value.push({ ...preset })
  }
}

function isPresetAdded(label: string): boolean {
  return servicesForm.value.some(s => s.label.toLowerCase() === label.toLowerCase())
}

function goBack() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function goToDashboard() {
  router.push({ name: 'dashboard' })
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORM SUBMISSIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function submitStep1() {
  if (!identityForm.business_name || !identityForm.adresse || !identityForm.ville) {
    showNotification('error', 'Veuillez remplir tous les champs obligatoires')
    return
  }

  isSubmitting.value = true

  try {
    await onboardingStore.submitIdentity({
      business_name: identityForm.business_name,
      adresse: identityForm.adresse,
      ville: identityForm.ville,
      quartier: identityForm.quartier,
      latitude: identityForm.latitude,
      longitude: identityForm.longitude,
      zone_couverture: identityForm.zone_couverture,
      rayon_km: identityForm.rayon_km
    })

    showNotification('success', 'Identité enregistrée avec succès')
    currentStep.value = 2
  } catch (err: any) {
    showNotification('error', err.response?.data?.detail || 'Erreur lors de l\'enregistrement')
  } finally {
    isSubmitting.value = false
  }
}

async function submitStep2() {
  // Valider les services
  const validServices = servicesForm.value.filter(s => s.label && s.prix_base > 0)
  
  if (validServices.length === 0) {
    showNotification('error', 'Veuillez configurer au moins un service')
    return
  }

  isSubmitting.value = true

  try {
    await onboardingStore.submitServices(validServices)

    showNotification('success', 'Services enregistrés avec succès')
    currentStep.value = 3
  } catch (err: any) {
    showNotification('error', err.response?.data?.detail || 'Erreur lors de l\'enregistrement')
  } finally {
    isSubmitting.value = false
  }
}

async function submitStep3() {
  if (!payoutForm.operator || !payoutForm.phone_number || !payoutForm.account_name) {
    showNotification('error', 'Veuillez remplir tous les champs')
    return
  }

  isSubmitting.value = true

  try {
    await onboardingStore.submitPayout({
      operator: payoutForm.operator as MobileMoneyOperator,
      phone_number: payoutForm.phone_number,
      account_name: payoutForm.account_name
    })

    showNotification('success', 'Configuration terminée !')
    currentStep.value = 4
  } catch (err: any) {
    showNotification('error', err.response?.data?.detail || 'Erreur lors de l\'enregistrement')
  } finally {
    isSubmitting.value = false
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════════

onMounted(async () => {
  try {
    await onboardingStore.fetchStatus()
    
    // Définir l'étape actuelle basée sur le statut
    const status = onboardingStore.status
    if (status) {
      if (status.completed) {
        currentStep.value = 4
      } else {
        currentStep.value = (status.current_step || 0) + 1
        if (currentStep.value > 3) currentStep.value = 3
      }
    }
  } catch (err) {
    console.error('Erreur chargement statut onboarding:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════════ */
/* BASE STYLES */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.onboarding-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #E3F2FB 0%, #ffffff 50%, #f0f9ff 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* HEADER */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.onboarding-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.logo-link {
  display: flex;
  align-items: center;
}

.logo {
  height: 48px;
}

.header-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.welcome-text {
  font-size: 13px;
  color: #6B7280;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #1F2937;
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* MAIN CONTENT */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.onboarding-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px;
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* STEPPER */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.stepper-container {
  margin-bottom: 40px;
}

.stepper {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border-radius: 16px;
  border: 2px solid #E5E7EB;
  transition: all 0.3s ease;
  flex: 1;
  max-width: 250px;
}

.step-active {
  border-color: #039AE3;
  background: linear-gradient(135deg, #E3F2FB 0%, #ffffff 100%);
  box-shadow: 0 4px 16px rgba(3, 154, 227, 0.15);
}

.step-completed {
  border-color: #10B981;
  background: #ECFDF5;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  background: #E5E7EB;
  color: #6B7280;
  transition: all 0.3s ease;
}

.step-active .step-number {
  background: #039AE3;
  color: white;
}

.step-completed .step-number {
  background: #10B981;
  color: white;
}

.step-info {
  display: flex;
  flex-direction: column;
}

.step-title {
  font-weight: 600;
  font-size: 14px;
  color: #1F2937;
}

.step-description {
  font-size: 12px;
  color: #6B7280;
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* FORM CARD */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.form-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 32px;
  background: linear-gradient(135deg, #039AE3 0%, #0B61B0 100%);
  color: white;
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: rgba(255, 255, 255, 0.2);
}

.card-title h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.card-title p {
  font-size: 14px;
  opacity: 0.9;
}

.form-body {
  padding: 32px;
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* FORM ELEMENTS */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #039AE3;
  box-shadow: 0 0 0 4px rgba(3, 154, 227, 0.1);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #9CA3AF;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.input-hint {
  display: block;
  font-size: 12px;
  color: #6B7280;
  margin-top: 6px;
}

/* Phone Input */
.phone-input {
  display: flex;
  align-items: stretch;
}

.phone-prefix {
  padding: 14px 16px;
  background: #F3F4F6;
  border: 2px solid #E5E7EB;
  border-right: none;
  border-radius: 12px 0 0 12px;
  font-weight: 600;
  color: #374151;
}

.phone-input input {
  border-radius: 0 12px 12px 0;
}

/* Location Button */
.btn-location {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  background: #F0F9FF;
  border: 2px dashed #039AE3;
  border-radius: 12px;
  color: #039AE3;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
}

.btn-location:hover {
  background: #E0F2FE;
}

.btn-location-success {
  background: #ECFDF5;
  border-color: #10B981;
  color: #059669;
}

.btn-location-success:hover {
  background: #D1FAE5;
}

/* Affichage des coordonnées GPS */
.location-coords {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 10px 14px;
  background: #F0FDF4;
  border-radius: 8px;
  font-size: 13px;
  color: #065F46;
}

.location-coords i {
  color: #10B981;
}

.location-coords span {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
}

.map-link {
  margin-left: auto;
  color: #039AE3;
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.map-link:hover {
  background: #E0F2FE;
  color: #0B61B0;
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* CARTE INTERACTIVE */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.map-container {
  margin-top: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;
  background: white;
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #039AE3 0%, #0B61B0 100%);
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.map-header i {
  margin-right: 8px;
}

.btn-close-map {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close-map:hover {
  background: rgba(255, 255, 255, 0.3);
}

.map-view {
  height: 300px;
  width: 100%;
}

.map-coords {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #F0FDF4;
  font-size: 13px;
  color: #065F46;
  border-top: 1px solid #E5E7EB;
}

.map-coords i {
  color: #10B981;
}

.map-coords span {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
}

.map-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #FEF3C7;
  font-size: 12px;
  color: #92400E;
  margin: 0;
}

.map-hint i {
  color: #F59E0B;
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* SERVICES SECTION */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.services-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.service-item {
  padding: 20px;
  background: #F9FAFB;
  border-radius: 16px;
  border: 1px solid #E5E7EB;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.service-number {
  font-weight: 600;
  color: #039AE3;
}

.btn-remove {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #FEE2E2;
  color: #EF4444;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-remove:hover {
  background: #FCA5A5;
}

.service-fields .form-group {
  margin-bottom: 16px;
}

.service-fields .form-row {
  grid-template-columns: repeat(3, 1fr);
}

.btn-add-service {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: transparent;
  border: 2px dashed #039AE3;
  border-radius: 12px;
  color: #039AE3;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
}

.btn-add-service:hover {
  background: #F0F9FF;
}

/* Quick Add */
.quick-add-section {
  margin-bottom: 24px;
}

.quick-add-label {
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  display: block;
  margin-bottom: 12px;
}

.quick-add-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-preset {
  padding: 8px 16px;
  background: #E0F2FE;
  border: none;
  border-radius: 20px;
  color: #0369A1;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-preset:hover:not(:disabled) {
  background: #BAE6FD;
}

.btn-preset:disabled {
  background: #E5E7EB;
  color: #9CA3AF;
  cursor: not-allowed;
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* OPERATORS GRID */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.operator-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.operator-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.operator-card:hover {
  border-color: #039AE3;
  background: #F0F9FF;
}

.operator-card input {
  display: none;
}

.operator-selected {
  border-color: #039AE3;
  background: #E0F2FE;
  box-shadow: 0 4px 12px rgba(3, 154, 227, 0.2);
}

.operator-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.operator-name {
  font-weight: 600;
  color: #374151;
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* INFO BOX */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.info-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #FEF3C7;
  border-radius: 12px;
  margin-bottom: 24px;
}

.info-box i {
  color: #F59E0B;
  font-size: 20px;
  flex-shrink: 0;
}

.info-box p {
  font-size: 14px;
  color: #92400E;
  margin: 0;
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* FORM ACTIONS */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #039AE3 0%, #0B61B0 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(3, 154, 227, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(3, 154, 227, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary.btn-success {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-secondary {
  background: #F3F4F6;
  color: #374151;
}

.btn-secondary:hover {
  background: #E5E7EB;
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* SUCCESS CARD */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.success-card {
  background: white;
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.success-icon {
  font-size: 80px;
  color: #10B981;
  margin-bottom: 24px;
}

.success-card h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 12px;
}

.success-card > p {
  font-size: 16px;
  color: #6B7280;
  margin-bottom: 40px;
}

.success-summary {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 40px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #F0FDF4;
  border-radius: 12px;
}

.summary-item i {
  color: #10B981;
  font-size: 20px;
}

.summary-item span {
  font-weight: 600;
  color: #065F46;
}

.btn-large {
  padding: 18px 40px;
  font-size: 17px;
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* LOADING STATE */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  background: white;
  border-radius: 24px;
}

.loading-state i {
  font-size: 48px;
  color: #039AE3;
  margin-bottom: 16px;
}

.loading-state p {
  color: #6B7280;
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* TOAST NOTIFICATION */
/* ═══════════════════════════════════════════════════════════════════════════════ */

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast-success {
  background: #10B981;
  color: white;
}

.toast-error {
  background: #EF4444;
  color: white;
}

.toast-warning {
  background: #F59E0B;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* RESPONSIVE */
/* ═══════════════════════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .onboarding-header {
    padding: 16px 20px;
  }

  .logo {
    height: 40px;
  }

  .onboarding-main {
    padding: 24px 16px;
  }

  .stepper {
    flex-direction: column;
  }

  .step {
    max-width: none;
  }

  .card-header {
    padding: 24px;
  }

  .card-title h2 {
    font-size: 20px;
  }

  .form-body {
    padding: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .service-fields .form-row {
    grid-template-columns: 1fr;
  }

  .operator-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .success-summary {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
