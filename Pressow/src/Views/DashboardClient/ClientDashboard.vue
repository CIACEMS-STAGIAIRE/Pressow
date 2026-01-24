<template>
  <div class="client-dashboard">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>Trouvez un pressing près de chez vous</h1>
        <p>Faites nettoyer vos vêtements en quelques clics</p>

        <!-- Location Search -->
        <div class="location-search">
          <div class="search-input-container">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <input
              type="text"
              v-model="searchAddress"
              placeholder="Entrez votre adresse..."
              @keyup.enter="searchByAddress"
            />
          </div>
          <button class="locate-btn" @click="locateMe" :disabled="isLocating">
            <svg v-if="!isLocating" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3"></circle>
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
            </svg>
            <span v-else class="spinner-small"></span>
            Me localiser
          </button>
        </div>

        <p v-if="locationError" class="location-error">{{ locationError }}</p>
      </div>
    </section>

    <!-- Loading State -->
    <section v-if="clientStore.isLoading" class="loading-section">
      <div class="spinner"></div>
      <p>Recherche des pressings...</p>
    </section>

    <!-- Nearby Pressings -->
    <section v-else-if="clientStore.nearbyProviders.length > 0" class="pressings-section">
      <div class="section-header">
        <h2>Pressings disponibles</h2>
        <span class="count">{{ clientStore.nearbyProviders.length }} résultats</span>
      </div>

      <div class="pressings-grid">
        <div
          v-for="pressing in clientStore.nearbyProviders"
          :key="pressing.id"
          class="pressing-card"
          @click="goToPressing(pressing.id)"
        >
          <div class="pressing-image">
            <img
              v-if="pressing.photo"
              :src="pressing.photo"
              :alt="pressing.nom_commercial"
            />
            <div v-else class="pressing-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21,15 16,10 5,21"></polyline>
              </svg>
            </div>
            <span v-if="pressing.is_open" class="open-badge">Ouvert</span>
            <span v-else class="closed-badge">Fermé</span>
          </div>

          <div class="pressing-info">
            <h3>{{ pressing.nom_commercial }}</h3>
            <p class="pressing-address">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {{ pressing.ville }}
            </p>

            <div class="pressing-meta">
              <div class="rating">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#F9A13B" stroke="#F9A13B" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>{{ pressing.note_moyenne.toFixed(1) }}</span>
              </div>
              <span class="services-count">{{ pressing.services_count }} services</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Empty State -->
    <section v-else-if="hasSearched" class="empty-section">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      <h3>Aucun pressing trouvé</h3>
      <p>Essayez d'élargir votre zone de recherche</p>
    </section>

    <!-- How it works -->
    <section v-else class="how-it-works">
      <h2>Comment ça marche ?</h2>
      
      <div class="steps">
        <div class="step">
          <div class="step-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h4>1. Trouvez</h4>
          <p>Recherchez un pressing près de chez vous</p>
        </div>

        <div class="step">
          <div class="step-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h4>2. Commandez</h4>
          <p>Sélectionnez vos articles et validez</p>
        </div>

        <div class="step">
          <div class="step-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <h4>3. Recevez</h4>
          <p>Vos vêtements sont ramassés et livrés propres</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClientStore } from '@/stores/client'

const router = useRouter()
const clientStore = useClientStore()

const searchAddress = ref('')
const isLocating = ref(false)
const locationError = ref('')
const hasSearched = ref(false)

async function locateMe() {
  isLocating.value = true
  locationError.value = ''
  
  try {
    const location = await clientStore.getCurrentPosition()
    if (location) {
      await clientStore.fetchNearbyProviders(location.lat, location.lng)
      hasSearched.value = true
    } else {
      locationError.value = 'Impossible de récupérer votre position. Veuillez autoriser la géolocalisation.'
    }
  } catch (err) {
    locationError.value = 'Erreur lors de la localisation'
  } finally {
    isLocating.value = false
  }
}

async function searchByAddress() {
  if (!searchAddress.value.trim()) return
  
  // TODO: Utiliser un service de géocodage (Nominatim, Google Places)
  // Pour le MVP, on utilise une position par défaut (Abidjan)
  const defaultLocation = { lat: 5.3600, lng: -4.0083 }
  await clientStore.fetchNearbyProviders(defaultLocation.lat, defaultLocation.lng)
  hasSearched.value = true
}

function goToPressing(pressingId: string) {
  router.push(`/client/pressing/${pressingId}`)
}

onMounted(() => {
  clientStore.init()
  
  // Si on a déjà une position, charger les pressings
  if (clientStore.currentLocation) {
    clientStore.fetchNearbyProviders(
      clientStore.currentLocation.lat,
      clientStore.currentLocation.lng
    )
    hasSearched.value = true
  }
})
</script>

<style scoped>
.client-dashboard {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #37A1EF 0%, #2b8dd4 100%);
  padding: 60px 20px;
  text-align: center;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
}

.hero-content > p {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 32px 0;
}

.location-search {
  display: flex;
  gap: 12px;
  background: white;
  padding: 8px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.search-input-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
}

.search-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.search-input-container input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #374151;
}

.search-input-container input::placeholder {
  color: #9ca3af;
}

.locate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #37A1EF;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.locate-btn:hover:not(:disabled) {
  background: #2b8dd4;
}

.locate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.location-error {
  color: #fef2f2;
  font-size: 0.875rem;
  margin-top: 12px;
}

/* Loading */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #6b7280;
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

/* Pressings Section */
.pressings-section {
  padding: 32px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.count {
  font-size: 0.875rem;
  color: #6b7280;
}

.pressings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.pressing-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.pressing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.pressing-image {
  position: relative;
  height: 160px;
  background: #f3f4f6;
}

.pressing-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pressing-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;
}

.open-badge,
.closed-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.open-badge {
  background: #10b981;
  color: white;
}

.closed-badge {
  background: #ef4444;
  color: white;
}

.pressing-info {
  padding: 16px;
}

.pressing-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.pressing-address {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.pressing-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.services-count {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Empty State */
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 16px 0 8px;
}

.empty-section p {
  color: #6b7280;
  margin: 0;
}

/* How it works */
.how-it-works {
  padding: 60px 20px;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.how-it-works h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 40px 0;
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-icon {
  width: 64px;
  height: 64px;
  background: rgba(55, 161, 239, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #37A1EF;
  margin-bottom: 16px;
}

.step h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.step p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 1.5rem;
  }

  .location-search {
    flex-direction: column;
  }

  .search-input-container {
    padding: 12px 16px;
  }

  .locate-btn {
    justify-content: center;
  }

  .steps {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
