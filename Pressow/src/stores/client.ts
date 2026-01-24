/**
 * Store Pinia pour l'application Client Pressow
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

// Types
export interface CartItem {
  providerId: string
  providerName: string
  providerServiceId: string
  serviceName: string
  articleTypeId?: string
  articleTypeName?: string
  matiereId?: string
  matiereName?: string
  prix: number
  quantity: number
}

export interface NearbyProvider {
  id: string
  nom_commercial: string
  photo: string | null
  ville: string
  adresse: string
  latitude: number
  longitude: number
  note_moyenne: number
  services_count: number
  is_open: boolean
}

export interface ProviderService {
  id: string
  service: {
    id: string
    label: string
    mode_tarif: 'piece' | 'kilo' | 'forfait'
    description: string
  }
  prix_base: string
  delai: number
  is_available: boolean
}

export interface ClientOrder {
  id: string
  numero: string
  statut: string
  statut_display: string
  payment_status: string
  payment_status_display: string
  total_estime: number
  provider: {
    id: string
    nom_commercial: string
    phone: string
  }
  adresse_collecte: string
  adresse_livraison: string
  created: string
  items: any[]
  has_delivery_otp: boolean
  is_delivery_validated: boolean
}

export const useClientStore = defineStore('client', () => {
  // State
  const cart = ref<CartItem[]>([])
  const nearbyProviders = ref<NearbyProvider[]>([])
  const clientOrders = ref<ClientOrder[]>([])
  const selectedProvider = ref<NearbyProvider | null>(null)
  const providerServices = ref<ProviderService[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentLocation = ref<{ lat: number; lng: number } | null>(null)

  // Computed
  const cartTotal = computed(() =>
    cart.value.reduce((sum, item) => sum + item.prix * item.quantity, 0)
  )

  const cartItemsCount = computed(() =>
    cart.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const cartByProvider = computed(() => {
    const grouped: Record<string, CartItem[]> = {}
    cart.value.forEach((item) => {
      if (!grouped[item.providerId]) {
        grouped[item.providerId] = []
      }
      grouped[item.providerId].push(item)
    })
    return grouped
  })

  const pendingOrders = computed(() =>
    clientOrders.value.filter((o) =>
      ['pending', 'confirmed', 'collected', 'in_progress', 'ready'].includes(o.statut)
    )
  )

  const completedOrders = computed(() =>
    clientOrders.value.filter((o) => ['delivered', 'cancelled'].includes(o.statut))
  )

  // Actions - Providers
  async function fetchNearbyProviders(lat: number, lng: number, radius: number = 10) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get('/catalog/providers/nearby/', {
        params: { lat, lng, radius },
      })
      nearbyProviders.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la recherche'
      console.error('fetchNearbyProviders error:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProviderServices(providerId: string) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get(`/catalog/providers/${providerId}/services/`)
      providerServices.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du chargement des services'
      console.error('fetchProviderServices error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Actions - Cart
  function addToCart(item: CartItem) {
    const existing = cart.value.find(
      (i) =>
        i.providerServiceId === item.providerServiceId &&
        i.articleTypeId === item.articleTypeId &&
        i.matiereId === item.matiereId
    )
    if (existing) {
      existing.quantity += item.quantity
    } else {
      cart.value.push({ ...item })
    }
    saveCart()
  }

  function updateCartItemQuantity(index: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(index)
    } else {
      cart.value[index].quantity = quantity
      saveCart()
    }
  }

  function removeFromCart(index: number) {
    cart.value.splice(index, 1)
    saveCart()
  }

  function clearCart() {
    cart.value = []
    saveCart()
  }

  function clearCartForProvider(providerId: string) {
    cart.value = cart.value.filter((item) => item.providerId !== providerId)
    saveCart()
  }

  function saveCart() {
    localStorage.setItem('presso_client_cart', JSON.stringify(cart.value))
  }

  function loadCart() {
    const saved = localStorage.getItem('presso_client_cart')
    if (saved) {
      try {
        cart.value = JSON.parse(saved)
      } catch {
        cart.value = []
      }
    }
  }

  // Actions - Orders
  async function createOrder(orderData: {
    provider_id: string
    items: Array<{
      provider_service_id: string
      article_type_id?: string
      matiere_id?: string
      quantity: number
    }>
    adresse_collecte: string
    latitude_collecte?: number
    longitude_collecte?: number
    adresse_livraison?: string
    latitude_livraison?: number
    longitude_livraison?: number
    creneau_collecte?: string
    creneau_livraison?: string
    notes_client?: string
  }) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.post('/orders/', orderData)
      // Vider le panier pour ce prestataire
      clearCartForProvider(orderData.provider_id)
      // Recharger les commandes
      await fetchClientOrders()
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la création de commande'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchClientOrders() {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get('/orders/')
      clientOrders.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du chargement des commandes'
      console.error('fetchClientOrders error:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchOrderDetail(orderId: string) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get(`/orders/${orderId}/`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du chargement de la commande'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchOrderDeliveryCode(orderId: string) {
    try {
      const response = await api.get(`/orders/${orderId}/delivery-code/`)
      return response.data
    } catch (err: any) {
      console.error('fetchOrderDeliveryCode error:', err)
      return null
    }
  }

  // Location
  function setCurrentLocation(lat: number, lng: number) {
    currentLocation.value = { lat, lng }
    localStorage.setItem('presso_client_location', JSON.stringify(currentLocation.value))
  }

  function loadCurrentLocation() {
    const saved = localStorage.getItem('presso_client_location')
    if (saved) {
      try {
        currentLocation.value = JSON.parse(saved)
      } catch {
        currentLocation.value = null
      }
    }
  }

  async function getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setCurrentLocation(location.lat, location.lng)
          resolve(location)
        },
        () => {
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      )
    })
  }

  // Reset
  function reset() {
    cart.value = []
    nearbyProviders.value = []
    clientOrders.value = []
    selectedProvider.value = null
    providerServices.value = []
    isLoading.value = false
    error.value = null
  }

  // Initialize
  function init() {
    loadCart()
    loadCurrentLocation()
  }

  return {
    // State
    cart,
    nearbyProviders,
    clientOrders,
    selectedProvider,
    providerServices,
    isLoading,
    error,
    currentLocation,
    // Computed
    cartTotal,
    cartItemsCount,
    cartByProvider,
    pendingOrders,
    completedOrders,
    // Actions - Providers
    fetchNearbyProviders,
    fetchProviderServices,
    // Actions - Cart
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    clearCartForProvider,
    // Actions - Orders
    createOrder,
    fetchClientOrders,
    fetchOrderDetail,
    fetchOrderDeliveryCode,
    // Location
    setCurrentLocation,
    getCurrentPosition,
    // Utils
    reset,
    init,
  }
})
