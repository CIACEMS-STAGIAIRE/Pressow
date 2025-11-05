<template>
  <div class="map-picker-container">
    <!-- Champ de recherche avec suggestions -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Rechercher une adresse ou un lieu..."
          @input="handleSearchInput"
          @focus="showSuggestions = true"
        />
        <i class="fas fa-search search-icon"></i>
        <button
          v-if="searchQuery"
          type="button"
          class="clear-search-btn"
          @click="clearSearch"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Liste des suggestions -->
      <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-list">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="suggestion-item"
          @click="selectSuggestion(suggestion)"
        >
          <i class="fas fa-map-marker-alt suggestion-icon"></i>
          <div class="suggestion-content">
            <div class="suggestion-name">{{ suggestion.name }}</div>
            <div class="suggestion-address">{{ suggestion.display_name }}</div>
          </div>
        </div>
      </div>
      
      <!-- Message si aucun résultat -->
      <div v-if="showSuggestions && searchQuery && suggestions.length === 0 && !isSearching" class="no-results">
        <i class="fas fa-exclamation-circle"></i>
        Aucun résultat trouvé
      </div>
      
      <!-- Indicateur de chargement -->
      <div v-if="isSearching" class="search-loading">
        <i class="fas fa-spinner fa-spin"></i>
        Recherche en cours...
      </div>
    </div>

    <div class="map-wrapper" ref="mapContainer" style="height: 400px; width: 100%; border-radius: 12px; overflow: hidden;"></div>
    <button
      type="button"
      class="locate-me-btn"
      @click="locateUser"
      :disabled="isLocating"
    >
      <i class="fas fa-crosshairs"></i>
      {{ isLocating ? 'Localisation...' : 'Me localiser' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Props du composant
const props = defineProps({
  initialLat: {
    type: Number,
    default: 5.3600 // Abidjan par défaut
  },
  initialLng: {
    type: Number,
    default: -4.0083
  },
  initialAddress: {
    type: String,
    default: ''
  }
})

// Événements émis par le composant
const emit = defineEmits(['update:location'])

// Références réactives pour les éléments du DOM et l'état
const mapContainer = ref(null)
const isLocating = ref(false)
const searchQuery = ref('')
const suggestions = ref([])
const showSuggestions = ref(false)
const isSearching = ref(false)
let map = null // Instance de la carte Leaflet
let marker = null // Instance du marqueur Leaflet
let searchTimeout = null

// Rate limiting pour Nominatim
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1000 // 1 seconde entre chaque requête
let pendingRequest = null

// Définition de l'icône personnalisée pour le marqueur Leaflet
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

/**
 * Hook d'exécution après le montage du composant.
 * Initialise la carte Leaflet.
 */
onMounted(() => {
  initMap()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

/**
 * Initialise la carte Leaflet.
 * Crée une instance de carte, ajoute les tuiles OpenStreetMap et place un marqueur initial.
 */
const initMap = () => {
  if (!mapContainer.value) return // S'assure que l'élément DOM est disponible

  // Création de l'instance de carte Leaflet
  map = L.map(mapContainer.value).setView([props.initialLat, props.initialLng], 13)

  // Ajout de la couche de tuiles OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)

  // Ajout du marqueur initial avec l'icône personnalisée et la possibilité de le déplacer
  marker = L.marker([props.initialLat, props.initialLng], {
    icon: customIcon,
    draggable: true
  }).addTo(map)

  // Ajout d'une popup initiale si une adresse est fournie, sinon un message par défaut
  if (props.initialAddress) {
    marker.bindPopup(props.initialAddress).openPopup()
  } else {
    marker.bindPopup('Déplacez le marqueur pour choisir votre position')
  }

  // Écouteur d'événement pour le déplacement du marqueur
  marker.on('dragend', async () => {
    const position = marker.getLatLng()
    await updateLocationDebounced(position.lat, position.lng)
  })

  // Écouteur d'événement pour les clics sur la carte
  map.on('click', async (e) => {
    marker.setLatLng(e.latlng) // Déplace le marqueur à la position du clic
    await updateLocationDebounced(e.latlng.lat, e.latlng.lng) // Met à jour la localisation et l'adresse
  })
}

/**
 * Gestion de la recherche en temps réel
 */
const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  // Debounce de 300ms
  searchTimeout = setTimeout(async () => {
    if (searchQuery.value.trim().length >= 3) {
      await performSearch(searchQuery.value)
    } else {
      suggestions.value = []
    }
  }, 300)
}

/**
 * Effectue la recherche via l'API Nominatim (forward geocoding)
 */
const performSearch = async (query) => {
  if (!query.trim()) return
  
  isSearching.value = true
  suggestions.value = []
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MapPicker/1.0'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    suggestions.value = data.map(item => ({
      name: item.name || item.display_name.split(',')[0],
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      city: item.address?.city || item.address?.town || item.address?.village || ''
    }))
    
    showSuggestions.value = true
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
  } finally {
    isSearching.value = false
  }
}

/**
 * Sélectionne une suggestion et met à jour la carte
 */
const selectSuggestion = (suggestion) => {
  // Centrer la carte sur la suggestion
  map.setView([suggestion.lat, suggestion.lon], 15)
  marker.setLatLng([suggestion.lat, suggestion.lon])
  
  // Mettre à jour l'affichage
  searchQuery.value = suggestion.display_name
  showSuggestions.value = false
  
  // Mettre à jour la localisation
  updateLocation(suggestion.lat, suggestion.lon)
}

/**
 * Efface la recherche
 */
const clearSearch = () => {
  searchQuery.value = ''
  suggestions.value = []
  showSuggestions.value = false
}

/**
 * Gestion du clic en dehors pour fermer les suggestions
 */
const handleClickOutside = (event) => {
  const searchContainer = document.querySelector('.search-container')
  if (searchContainer && !searchContainer.contains(event.target)) {
    showSuggestions.value = false
  }
}

/**
 * Fonction debounced pour éviter trop d'appels API
 */
const updateLocationDebounced = (() => {
  let timeout = null
  return (lat, lng) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      updateLocation(lat, lng)
    }, 500) // Attendre 500ms après le dernier événement
  }
})()

/**
 * Met à jour la position du marqueur et récupère l'adresse correspondante via géocodage inverse.
 * Émet un événement 'update:location' avec les nouvelles coordonnées et l'adresse.
 * @param {number} lat - La latitude.
 * @param {number} lng - La longitude.
 */
const updateLocation = async (lat, lng) => {
  try {
    // Rate limiting
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      // Annuler la requête en attente
      if (pendingRequest) {
        clearTimeout(pendingRequest)
      }

      // Planifier une nouvelle requête après le délai minimum
      pendingRequest = setTimeout(() => {
        updateLocation(lat, lng)
      }, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      return
    }

    lastRequestTime = now

    // Appel à l'API Nominatim avec retry logic
    const data = await fetchWithRetry(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      3 // Nombre max de tentatives
    )

    if (data) {
      // Récupération de l'adresse affichable ou des coordonnées si l'adresse n'est pas trouvée
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

      // Mise à jour de la popup du marqueur
      marker.bindPopup(address).openPopup()

      // Émission de l'événement avec les détails de la localisation
      emit('update:location', {
        lat,
        lng,
        address,
        city: data.address?.city || data.address?.town || data.address?.village || '' // Récupération de la ville/village
      })
    } else {
      // En cas d'échec complet, émettre les coordonnées brutes
      emitFallbackLocation(lat, lng)
    }
  } catch (error) {
    console.error('Erreur lors du géocodage:', error)
    emitFallbackLocation(lat, lng)
  }
}

/**
 * Fonction de retry avec backoff exponentiel
 */
const fetchWithRetry = async (url, maxRetries, retryDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MapPicker/1.0' // Nominatim requiert un User-Agent
        }
      })

      // Si 503 ou 429 (rate limit), on retry
      if (response.status === 503 || response.status === 429) {
        if (attempt < maxRetries - 1) {
          console.warn(`Tentative ${attempt + 1}/${maxRetries} échouée (${response.status}). Nouvelle tentative dans ${retryDelay}ms...`)
          await sleep(retryDelay)
          retryDelay *= 2 // Backoff exponentiel
          continue
        }
        throw new Error(`Service temporairement indisponible (${response.status})`)
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const text = await response.text()

      // Vérifier si la réponse commence par "Query took" (erreur serveur)
      if (text.startsWith('Query took') || text.startsWith('<!DOCTYPE')) {
        throw new Error('Réponse invalide du serveur')
      }

      return JSON.parse(text)
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error
      }
      console.warn(`Tentative ${attempt + 1}/${maxRetries} échouée:`, error.message)
      await sleep(retryDelay)
      retryDelay *= 2
    }
  }
  return null
}

/**
 * Helper pour attendre
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Émet les coordonnées brutes en cas d'échec de géocodage
 */
const emitFallbackLocation = (lat, lng) => {
  const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  marker.bindPopup(address).openPopup()
  emit('update:location', {
    lat,
    lng,
    address,
    city: ''
  })
}

/**
 * Tente de localiser l'utilisateur en utilisant la géolocalisation du navigateur.
 * Met à jour la carte et le marqueur à la position de l'utilisateur et émet l'événement de localisation.
 */
const locateUser = () => {
  // Vérifie si la géolocalisation est supportée par le navigateur
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée par votre navigateur")
    return
  }

  isLocating.value = true // Active l'état de chargement

  // Demande la position actuelle de l'utilisateur
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords

      // Centre la carte et déplace le marqueur à la position de l'utilisateur
      map.setView([latitude, longitude], 15)
      marker.setLatLng([latitude, longitude])

      await updateLocation(latitude, longitude) // Met à jour les informations de localisation
      isLocating.value = false // Désactive l'état de chargement
    },
    (error) => {
      console.error('Erreur de géolocalisation:', error)
      alert("Impossible d'obtenir votre position. Veuillez vérifier vos paramètres de localisation.")
      isLocating.value = false // Désactive l'état de chargement en cas d'erreur
    },
    {
      enableHighAccuracy: true, // Active la haute précision
      timeout: 10000, // Délai d'attente de 10 secondes
      maximumAge: 0 // Ne pas utiliser de position mise en cache
    }
  )
}

/**
 * Surveille les changements dans les props `initialLat` et `initialLng`.
 * Si la carte et le marqueur sont initialisés, centre la carte et déplace le marqueur.
 */
watch(
  () => [props.initialLat, props.initialLng],
  ([newLat, newLng]) => {
    if (map && marker) {
      map.setView([newLat, newLng], 13)
      marker.setLatLng([newLat, newLng])
    }
  }
)
</script>

<style scoped>
.map-picker-container {
  position: relative;
  width: 100%;
}

.search-container {
  position: relative;
  margin-bottom: 16px;
  z-index: 1001;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 12px 45px 12px 40px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 16px;
  pointer-events: none;
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  background: #f1f5f9;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.clear-search-btn:hover {
  background: #e2e8f0;
  color: #334155;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: #f8fafc;
}

.suggestion-icon {
  color: #3b82f6;
  margin-right: 12px;
  margin-top: 4px;
  font-size: 14px;
}

.suggestion-content {
  flex: 1;
}

.suggestion-name {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 4px;
}

.suggestion-address {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

.no-results i {
  margin-right: 8px;
  color: #94a3b8;
}

.search-loading {
  padding: 16px;
  text-align: center;
  color: #3b82f6;
  font-size: 14px;
}

.search-loading i {
  margin-right: 8px;
}

.map-wrapper {
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.locate-me-btn {
  position: absolute;
  bottom: 22rem;
  right: 10px;
  z-index: 1000;
  background: white;
  border: 2px solid #3b82f6;
  color: #3b82f6;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.locate-me-btn:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.locate-me-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.locate-me-btn i {
  font-size: 16px;
}
</style>