/**
 * Store Pinia pour le tableau de bord prestataire
 * 
 * Gère les statistiques, la checklist de configuration,
 * et les commandes en attente affichées sur le dashboard.
 */
import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import api from '@/services/api'

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/** Statistiques pour une période */
export interface PeriodStats {
  total_orders: number
  pending_orders?: number
  delivered_orders: number
  revenue: number
}

/** Statistiques globales */
export interface DashboardStats {
  today: PeriodStats
  week: PeriodStats
  month: PeriodStats
}

/** Élément de la checklist */
export interface ChecklistItem {
  id: string
  label: string
  description: string
  completed: boolean
  required: boolean
  verified?: boolean
  count?: number
}

/** Commande en attente (résumé) */
export interface PendingOrder {
  id: string
  numero: string
  client_name: string
  total: number
  statut: string
  statut_display: string
  created: string
}

/** Infos du provider pour le dashboard */
export interface ProviderInfo {
  id: string
  name: string
  is_open: boolean
  type: string
  type_display: string
  photo?: string | null
  ville?: string
  adresse?: string
}

/** Résumé du wallet pour le dashboard */
export interface WalletSummary {
  balance: number
  pending_balance: number
  total_earned: number
}

/** Réponse complète du dashboard */
export interface DashboardData {
  provider: ProviderInfo
  stats: DashboardStats
  wallet: WalletSummary
  pending_orders: PendingOrder[]
  checklist: ChecklistItem[]
}

/** Lien de partage */
export interface ShareLink {
  shop_url: string
  whatsapp_url: string
  whatsapp_message: string
  qr_code_data: string
}

/** Stats détaillées par période */
export interface DetailedStats {
  period: string
  start_date: string
  end_date: string
  orders: {
    total: number
    by_status: Record<string, { count: number; total: number }>
  }
  revenue: {
    total: number
    commission_paid: number
    orders_count: number
  }
  rates: {
    conversion: number
    cancellation: number
  }
}

// =============================================================================
// STORE
// =============================================================================

export const useDashboardStore = defineStore('dashboard', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** Données du dashboard */
  const data = ref<DashboardData | null>(null)
  
  /** Lien de partage */
  const shareLink = ref<ShareLink | null>(null)
  
  /** Stats détaillées */
  const detailedStats = ref<DetailedStats | null>(null)
  
  /** État de chargement */
  const isLoading = ref(false)
  
  /** Erreurs */
  const error = ref<string | null>(null)
  
  /** Dernier rafraîchissement */
  const lastRefresh = ref<Date | null>(null)
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** Info du prestataire */
  const provider = computed(() => data.value?.provider ?? null)
  
  /** Statistiques */
  const stats = computed(() => data.value?.stats ?? null)
  
  /** Résumé du wallet */
  const wallet = computed(() => data.value?.wallet ?? null)
  
  /** Commandes en attente */
  const pendingOrders = computed(() => data.value?.pending_orders ?? [])
  
  /** Checklist de configuration */
  const checklist = computed(() => data.value?.checklist ?? [])
  
  /** Progression de la checklist (%) */
  const checklistProgress = computed(() => {
    const items = checklist.value
    if (items.length === 0) return 0
    const completed = items.filter(item => item.completed).length
    return Math.round((completed / items.length) * 100)
  })
  
  /** Items requis non complétés */
  const requiredIncomplete = computed(() => 
    checklist.value.filter(item => item.required && !item.completed)
  )
  
  /** Tous les éléments requis sont-ils complétés ? */
  const allRequiredCompleted = computed(() => 
    requiredIncomplete.value.length === 0
  )
  
  /** Le pressing est-il ouvert ? */
  const isOpen = computed(() => provider.value?.is_open ?? false)
  
  /** Nombre de commandes en attente */
  const pendingOrdersCount = computed(() => pendingOrders.value.length)
  
  /** Revenu d'aujourd'hui */
  const todayRevenue = computed(() => stats.value?.today.revenue ?? 0)
  
  /** Revenu de la semaine */
  const weekRevenue = computed(() => stats.value?.week.revenue ?? 0)
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Récupère les données du dashboard
   */
  async function fetchDashboard(): Promise<DashboardData> {
    isLoading.value = true
    error.value = null
    
    try {
      const { data: responseData } = await api.get<DashboardData>('/provider/dashboard/')
      data.value = responseData
      lastRefresh.value = new Date()
      return responseData
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors du chargement du tableau de bord'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Récupère les statistiques détaillées pour une période
   */
  async function fetchDetailedStats(period: 'today' | 'week' | 'month' | 'year' = 'week'): Promise<DetailedStats> {
    isLoading.value = true
    error.value = null
    
    try {
      const { data: responseData } = await api.get<DetailedStats>('/provider/dashboard/stats/', {
        params: { period }
      })
      detailedStats.value = responseData
      return responseData
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors du chargement des statistiques'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Récupère le lien de partage
   */
  async function fetchShareLink(): Promise<ShareLink> {
    try {
      const { data: responseData } = await api.get<ShareLink>('/provider/share-link/')
      shareLink.value = responseData
      return responseData
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors du chargement du lien de partage'
      throw err
    }
  }
  
  /**
   * Rafraîchit les données si elles sont périmées (> 5 minutes)
   */
  async function refreshIfStale(): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    if (!lastRefresh.value || lastRefresh.value < fiveMinutesAgo) {
      await fetchDashboard()
    }
  }
  
  /**
   * Partage sur WhatsApp
   */
  function shareOnWhatsApp(): void {
    if (shareLink.value?.whatsapp_url) {
      window.open(shareLink.value.whatsapp_url, '_blank')
    }
  }
  
  /**
   * Copie le lien de la boutique
   */
  async function copyShopLink(): Promise<boolean> {
    if (!shareLink.value?.shop_url) {
      await fetchShareLink()
    }
    
    if (shareLink.value?.shop_url) {
      try {
        await navigator.clipboard.writeText(shareLink.value.shop_url)
        return true
      } catch {
        return false
      }
    }
    return false
  }
  
  /**
   * Réinitialise le store
   */
  function reset(): void {
    data.value = null
    shareLink.value = null
    detailedStats.value = null
    error.value = null
    isLoading.value = false
    lastRefresh.value = null
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════
  
  return {
    // State
    data,
    shareLink,
    detailedStats,
    isLoading,
    error,
    lastRefresh,
    
    // Computed
    provider,
    stats,
    wallet,
    pendingOrders,
    checklist,
    checklistProgress,
    requiredIncomplete,
    allRequiredCompleted,
    isOpen,
    pendingOrdersCount,
    todayRevenue,
    weekRevenue,
    
    // Actions
    fetchDashboard,
    fetchDetailedStats,
    fetchShareLink,
    refreshIfStale,
    shareOnWhatsApp,
    copyShopLink,
    reset
  }
})
