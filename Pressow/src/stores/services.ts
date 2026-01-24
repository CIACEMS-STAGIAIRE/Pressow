/**
 * Store Pinia pour la gestion des services du prestataire
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

// Types
export interface Service {
  id: string
  label: string
  mode_tarif: 'piece' | 'kilo' | 'forfait'
  description: string
  icone: string
}

export interface ProviderService {
  id: string
  service: Service
  prix_base: string
  delai: number
  is_available: boolean
  created: string
  updated: string
}

export interface ArticleType {
  id: string
  nom: string
  description: string
  is_active: boolean
}

export interface Matiere {
  id: string
  nom: string
  coefficient: string
  is_active: boolean
}

export interface Tariff {
  id: string
  provider_service: string
  article_type: ArticleType | null
  matiere: Matiere | null
  prix: string
  delai_specifique: number | null
  is_active: boolean
}

export interface ServiceTemplate {
  id: string
  label: string
  mode_tarif: string
  description: string
  icone: string
}

export const useServicesStore = defineStore('services', () => {
  // State
  const providerServices = ref<ProviderService[]>([])
  const articleTypes = ref<ArticleType[]>([])
  const matieres = ref<Matiere[]>([])
  const tariffs = ref<Tariff[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activeServices = computed(() => 
    providerServices.value.filter(s => s.is_available)
  )
  
  const inactiveServices = computed(() => 
    providerServices.value.filter(s => !s.is_available)
  )

  const servicesCount = computed(() => providerServices.value.length)

  // Actions
  async function fetchServices() {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get('/providers/services/')
      providerServices.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors du chargement des services'
      console.error('fetchServices error:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createService(data: {
    label?: string
    description?: string
    mode_tarif?: string
    duree_estimee?: number
    template_id?: string
    prix_base: number
    delai: number
    is_available?: boolean
  }) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.post('/providers/services/', data)
      providerServices.value.push(response.data)
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la création du service'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function updateService(serviceId: string, data: {
    prix_base?: number
    delai?: number
    is_available?: boolean
  }) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.patch(`/providers/services/${serviceId}/`, data)
      const index = providerServices.value.findIndex(s => s.id === serviceId)
      if (index !== -1) {
        providerServices.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la mise à jour'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteService(serviceId: string) {
    isLoading.value = true
    error.value = null
    try {
      await api.delete(`/providers/services/${serviceId}/`)
      providerServices.value = providerServices.value.filter(s => s.id !== serviceId)
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Erreur lors de la suppression'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function toggleServiceAvailability(serviceId: string) {
    const service = providerServices.value.find(s => s.id === serviceId)
    if (!service) return { success: false, error: 'Service non trouvé' }
    
    return updateService(serviceId, { is_available: !service.is_available })
  }

  // Article Types
  async function fetchArticleTypes() {
    try {
      const response = await api.get('/providers/catalog/article-types/')
      articleTypes.value = response.data
    } catch (err: any) {
      console.error('fetchArticleTypes error:', err)
    }
  }

  async function createArticleType(data: { nom: string; description?: string }) {
    try {
      const response = await api.post('/providers/catalog/article-types/', data)
      articleTypes.value.push(response.data)
      return { success: true, data: response.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Erreur' }
    }
  }

  // Matières
  async function fetchMatieres() {
    try {
      const response = await api.get('/providers/catalog/materials/')
      matieres.value = response.data
    } catch (err: any) {
      console.error('fetchMatieres error:', err)
    }
  }

  async function createMatiere(data: { nom: string; coefficient?: number }) {
    try {
      const response = await api.post('/providers/catalog/materials/', data)
      matieres.value.push(response.data)
      return { success: true, data: response.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Erreur' }
    }
  }

  // Tarifs
  async function fetchTariffs() {
    try {
      const response = await api.get('/providers/tariffs/')
      tariffs.value = response.data
    } catch (err: any) {
      console.error('fetchTariffs error:', err)
    }
  }

  async function createTariff(data: {
    provider_service_id: string
    article_type_id?: string
    matiere_id?: string
    prix: number
    delai_specifique?: number
  }) {
    try {
      const response = await api.post('/providers/tariffs/', data)
      tariffs.value.push(response.data)
      return { success: true, data: response.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Erreur' }
    }
  }

  async function updateTariff(tariffId: string, data: {
    prix?: number
    delai_specifique?: number
    is_active?: boolean
  }) {
    try {
      const response = await api.patch(`/providers/tariffs/${tariffId}/`, data)
      const index = tariffs.value.findIndex(t => t.id === tariffId)
      if (index !== -1) {
        tariffs.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Erreur' }
    }
  }

  async function deleteTariff(tariffId: string) {
    try {
      await api.delete(`/providers/tariffs/${tariffId}/`)
      tariffs.value = tariffs.value.filter(t => t.id !== tariffId)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.detail || 'Erreur' }
    }
  }

  // Charger toutes les données
  async function fetchAll() {
    await Promise.all([
      fetchServices(),
      fetchArticleTypes(),
      fetchMatieres(),
      fetchTariffs(),
    ])
  }

  function reset() {
    providerServices.value = []
    articleTypes.value = []
    matieres.value = []
    tariffs.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    providerServices,
    articleTypes,
    matieres,
    tariffs,
    isLoading,
    error,
    // Computed
    activeServices,
    inactiveServices,
    servicesCount,
    // Actions
    fetchServices,
    createService,
    updateService,
    deleteService,
    toggleServiceAvailability,
    fetchArticleTypes,
    createArticleType,
    fetchMatieres,
    createMatiere,
    fetchTariffs,
    createTariff,
    updateTariff,
    deleteTariff,
    fetchAll,
    reset,
  }
})
