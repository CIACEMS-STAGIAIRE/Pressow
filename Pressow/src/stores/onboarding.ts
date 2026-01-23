/**
 * Store Pinia pour l'onboarding des prestataires
 * 
 * Gère l'état du parcours de configuration initiale obligatoire
 * avant qu'un pressing ne soit visible sur la marketplace.
 */
import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import api from '@/services/api'

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/** Étapes de l'onboarding */
export type OnboardingStep = 0 | 1 | 2 | 3 | 4

/** Opérateurs Mobile Money supportés */
export type MobileMoneyOperator = 'orange' | 'mtn' | 'moov' | 'wave'

/** Modes de tarification */
export type TariffMode = 'kg' | 'piece' | 'forfait'

/** Statut d'un compte de paiement */
export type PayoutAccountStatus = 'pending' | 'verified' | 'rejected' | 'suspended'

/** Statut de l'onboarding */
export interface OnboardingStatus {
  completed: boolean
  current_step: OnboardingStep
  steps: {
    identity: boolean
    services: boolean
    payout: boolean
  }
  started_at: string | null
  completed_at: string | null
  provider_id: string
  business_name: string
  is_open: boolean
}

/** Données de l'étape 1 : Identité */
export interface IdentityData {
  business_name: string
  adresse: string
  ville: string
  quartier?: string
  latitude?: number | null
  longitude?: number | null
  zone_couverture?: string
  rayon_km?: number
  logo?: File | null
  storefront_photo?: File | null
}

/** Données d'un service */
export interface ServiceItem {
  template_id?: string | null
  label: string
  mode_tarif: TariffMode
  prix_base: number
  delai: number // en heures
}

/** Données de l'étape 2 : Services */
export interface ServicesData {
  services: ServiceItem[]
}

/** Données de l'étape 3 : Paiement */
export interface PayoutData {
  operator: MobileMoneyOperator
  phone_number: string
  account_name: string
}

/** Compte de paiement */
export interface PayoutAccount {
  id: string
  operator: MobileMoneyOperator
  operator_display: string
  phone_number: string
  account_name: string
  is_primary: boolean
  status: PayoutAccountStatus
  status_display: string
  verified_at: string | null
  created: string
  updated: string
}

/** État ouvert/fermé du pressing */
export interface OpenStatus {
  is_open: boolean
  closed_reason: string
  onboarding_completed: boolean
}

// =============================================================================
// STORE
// =============================================================================

export const useOnboardingStore = defineStore('onboarding', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** Statut actuel de l'onboarding */
  const status = ref<OnboardingStatus | null>(null)
  
  /** Données temporaires du formulaire (pour sauvegarder entre les étapes) */
  const formData = reactive<{
    identity: Partial<IdentityData>
    services: ServiceItem[]
    payout: Partial<PayoutData>
  }>({
    identity: {},
    services: [],
    payout: {}
  })
  
  /** Comptes de paiement */
  const payoutAccounts = ref<PayoutAccount[]>([])
  
  /** État de chargement */
  const isLoading = ref(false)
  
  /** Erreurs */
  const error = ref<string | null>(null)
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** L'onboarding est-il terminé ? */
  const isCompleted = computed(() => status.value?.completed ?? false)
  
  /** Étape actuelle */
  const currentStep = computed(() => status.value?.current_step ?? 0)
  
  /** Le pressing est-il ouvert ? */
  const isOpen = computed(() => status.value?.is_open ?? false)
  
  /** Nom commercial */
  const businessName = computed(() => status.value?.business_name ?? '')
  
  /** ID du provider */
  const providerId = computed(() => status.value?.provider_id ?? '')
  
  /** Compte de paiement principal */
  const primaryPayoutAccount = computed(() => 
    payoutAccounts.value.find(acc => acc.is_primary) ?? null
  )
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Récupère le statut d'onboarding depuis l'API
   */
  async function fetchStatus(): Promise<OnboardingStatus> {
    isLoading.value = true
    error.value = null
    
    try {
      const { data } = await api.get<OnboardingStatus>('/provider/onboarding/status/')
      status.value = data
      return data
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de la récupération du statut'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Étape 1 : Enregistre l'identité du pressing
   */
  async function submitIdentity(data: IdentityData): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      // Créer un FormData pour gérer les fichiers
      const formDataObj = new FormData()
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formDataObj.append(key, value)
          } else {
            formDataObj.append(key, String(value))
          }
        }
      })
      
      await api.post('/provider/onboarding/identity/', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      // Sauvegarder localement
      formData.identity = data
      
      // Rafraîchir le statut
      await fetchStatus()
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de l\'enregistrement de l\'identité'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Étape 2 : Enregistre les services et tarifs
   */
  async function submitServices(services: ServiceItem[]): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      await api.post('/provider/onboarding/services/', { services })
      
      // Sauvegarder localement
      formData.services = services
      
      // Rafraîchir le statut
      await fetchStatus()
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de l\'enregistrement des services'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Étape 3 : Enregistre le compte de paiement
   */
  async function submitPayout(data: PayoutData): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      await api.post('/provider/onboarding/payout/', data)
      
      // Sauvegarder localement
      formData.payout = data
      
      // Rafraîchir le statut et les comptes
      await Promise.all([
        fetchStatus(),
        fetchPayoutAccounts()
      ])
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de l\'enregistrement du compte de paiement'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Récupère les comptes de paiement
   */
  async function fetchPayoutAccounts(): Promise<PayoutAccount[]> {
    try {
      const { data } = await api.get<PayoutAccount[]>('/provider/payout-accounts/')
      payoutAccounts.value = data
      return data
    } catch (err: any) {
      console.error('Erreur récupération comptes paiement:', err)
      return []
    }
  }
  
  /**
   * Ajoute un compte de paiement
   */
  async function addPayoutAccount(data: PayoutData): Promise<PayoutAccount> {
    isLoading.value = true
    error.value = null
    
    try {
      const { data: newAccount } = await api.post<PayoutAccount>('/provider/payout-accounts/', data)
      payoutAccounts.value.push(newAccount)
      return newAccount
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de l\'ajout du compte'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Supprime un compte de paiement
   */
  async function deletePayoutAccount(accountId: string): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      await api.delete(`/provider/payout-accounts/${accountId}/`)
      payoutAccounts.value = payoutAccounts.value.filter(acc => acc.id !== accountId)
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de la suppression du compte'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Définit un compte comme principal
   */
  async function setPrimaryPayoutAccount(accountId: string): Promise<void> {
    try {
      await api.patch(`/provider/payout-accounts/${accountId}/`, { is_primary: true })
      
      // Mettre à jour localement
      payoutAccounts.value.forEach(acc => {
        acc.is_primary = acc.id === accountId
      })
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de la mise à jour'
      throw err
    }
  }
  
  /**
   * Toggle l'état ouvert/fermé du pressing
   */
  async function toggleOpenStatus(isOpen: boolean, closedReason?: string): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      const { data } = await api.post<OpenStatus>('/provider/status/', {
        is_open: isOpen,
        closed_reason: closedReason ?? ''
      })
      
      // Mettre à jour le statut local
      if (status.value) {
        status.value.is_open = data.is_open
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors du changement de statut'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Récupère l'état ouvert/fermé
   */
  async function fetchOpenStatus(): Promise<OpenStatus> {
    try {
      const { data } = await api.get<OpenStatus>('/provider/status/')
      
      if (status.value) {
        status.value.is_open = data.is_open
      }
      
      return data
    } catch (err: any) {
      throw err
    }
  }
  
  /**
   * Réinitialise le store
   */
  function reset(): void {
    status.value = null
    formData.identity = {}
    formData.services = []
    formData.payout = {}
    payoutAccounts.value = []
    error.value = null
    isLoading.value = false
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════
  
  return {
    // State
    status,
    formData,
    payoutAccounts,
    isLoading,
    error,
    
    // Computed
    isCompleted,
    currentStep,
    isOpen,
    businessName,
    providerId,
    primaryPayoutAccount,
    
    // Actions
    fetchStatus,
    submitIdentity,
    submitServices,
    submitPayout,
    fetchPayoutAccounts,
    addPayoutAccount,
    deletePayoutAccount,
    setPrimaryPayoutAccount,
    toggleOpenStatus,
    fetchOpenStatus,
    reset
  }
})
