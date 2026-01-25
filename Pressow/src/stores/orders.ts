/**
 * Store Pinia pour la gestion des commandes prestataire
 * 
 * Gère la liste des commandes, les changements de statut,
 * et la validation OTP de livraison.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/** Statuts de commande */
export type OrderStatus = 'pending' | 'confirmed' | 'collected' | 'in_progress' | 'ready' | 'delivered' | 'cancelled'

/** Statuts de paiement */
export type PaymentStatus = 'pending' | 'paid_pending_verification' | 'paid' | 'adjustment_required' | 'escrow' | 'released' | 'refunded' | 'partially_refunded' | 'failed'

/** Mode de comptage */
export type CountingMode = 'client' | 'collector'

/** Statuts de payout */
export type PayoutStatus = 'not_applicable' | 'pending' | 'scheduled' | 'processing' | 'completed' | 'failed'

/** Client de la commande */
export interface OrderClient {
  id: string
  // Format backend (OrderSerializer.get_client)
  nom?: string
  phone?: string
  // Format alternatif
  first_name?: string
  last_name?: string
  phone_number?: string
  email?: string
}

/** Article d'une commande */
export interface OrderItem {
  id: string
  service_name: string
  article_type_name: string
  matiere_name?: string
  quantity: number
  unit_price: number
  total_price: number
  notes?: string
}

/** Commande complète */
export interface Order {
  id: string
  numero: string
  client: OrderClient
  
  // Adresses
  adresse_collecte: string
  latitude_collecte?: number
  longitude_collecte?: number
  adresse_livraison: string
  latitude_livraison?: number
  longitude_livraison?: number
  
  // Créneaux
  creneau_collecte: string
  creneau_livraison?: string
  
  // Dates réelles
  date_collecte?: string
  date_livraison?: string
  
  // Statut
  statut: OrderStatus
  statut_display: string
  statut_changed_at?: string
  
  // Mode de comptage
  counting_mode: CountingMode
  counting_mode_display?: string
  
  // Quantités estimées par le client
  estimated_weight?: number
  estimated_pieces?: number
  
  // Quantités vérifiées par le livreur
  verified_weight?: number
  verified_pieces?: number
  quantity_verified_at?: string
  verification_status?: {
    verified: boolean
    verified_at?: string
    estimated: {
      weight?: number
      pieces?: number
    }
    verified_values: {
      weight?: number
      pieces?: number
    }
    has_discrepancy: boolean
  }
  
  // Ajustement paiement
  initial_amount_paid?: number
  adjustment_amount?: number
  adjustment_deadline?: string
  adjustment_paid_at?: string
  credit_issued?: number
  client_accepted_reduction?: boolean
  has_adjustment?: boolean
  
  // Montants
  total_estime: number
  total_final?: number
  frais_livraison: number
  
  // Paiement
  payment_status: PaymentStatus
  payment_status_display: string
  paid_at?: string
  
  // Commission (pour le prestataire)
  commission_percent?: number
  commission_amount?: number
  payout_fee?: number
  provider_net_amount?: number
  
  // OTP Livraison
  has_delivery_otp: boolean
  delivery_otp_generated_at?: string
  delivery_otp_validated_at?: string
  is_delivery_validated: boolean
  
  // Payout
  payout_status: PayoutStatus
  payout_scheduled_at?: string
  payout_completed_at?: string
  
  // Annulation
  cancellation_reason?: string
  cancellation_notes?: string
  cancelled_at?: string
  
  // Notes
  notes_client?: string
  notes_provider?: string
  
  // Items
  items?: OrderItem[]
  
  // Dates
  created: string
  updated: string
}

/** Statut OTP */
export interface OTPStatus {
  has_otp: boolean
  otp_generated_at: string | null
  otp_validated_at: string | null
  is_validated: boolean
  is_expired: boolean
  validity_minutes: number
  can_regenerate: boolean
}

/** Filtres de recherche */
export interface OrderFilters {
  status?: OrderStatus
  payment_status?: PaymentStatus
  search?: string
  date_from?: string
  date_to?: string
}

/** Pagination */
export interface Pagination {
  total: number
  limit: number
  offset: number
  has_more: boolean
}

/** Réponse liste de commandes */
export interface OrdersResponse {
  orders: Order[]
  pagination: Pagination
}

/** Raisons d'annulation */
export const CANCELLATION_REASONS = [
  { value: 'too_busy', label: 'Trop de travail' },
  { value: 'machine_down', label: 'Machine en panne' },
  { value: 'client_request', label: 'Demande du client' },
  { value: 'no_pickup', label: 'Client absent lors du ramassage' },
  { value: 'quality_issue', label: 'Problème de qualité' },
  { value: 'other', label: 'Autre raison' },
] as const

// =============================================================================
// STORE
// =============================================================================

export const useOrdersStore = defineStore('orders', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** Liste des commandes */
  const orders = ref<Order[]>([])
  
  /** Pagination */
  const pagination = ref<Pagination | null>(null)
  
  /** Commande sélectionnée */
  const selectedOrder = ref<Order | null>(null)
  
  /** Statut OTP de la commande sélectionnée */
  const selectedOTPStatus = ref<OTPStatus | null>(null)
  
  /** Filtres actifs */
  const filters = ref<OrderFilters>({})
  
  /** État de chargement */
  const isLoading = ref(false)
  
  /** Chargement OTP en cours */
  const isOTPLoading = ref(false)
  
  /** Erreurs */
  const error = ref<string | null>(null)
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** Commandes en attente d'acceptation */
  const pendingOrders = computed(() => 
    orders.value.filter(o => o.statut === 'pending')
  )
  
  /** Commandes confirmées */
  const confirmedOrders = computed(() => 
    orders.value.filter(o => o.statut === 'confirmed')
  )
  
  /** Commandes à ramasser */
  const toCollectOrders = computed(() => 
    orders.value.filter(o => ['pending', 'confirmed'].includes(o.statut))
  )
  
  /** Commandes en cours */
  const inProgressOrders = computed(() => 
    orders.value.filter(o => ['collected', 'in_progress'].includes(o.statut))
  )
  
  /** Commandes prêtes */
  const readyOrders = computed(() => 
    orders.value.filter(o => o.statut === 'ready')
  )
  
  /** Commandes livrées */
  const deliveredOrders = computed(() => 
    orders.value.filter(o => o.statut === 'delivered')
  )
  
  /** Nombre de commandes par statut */
  const ordersCounts = computed(() => ({
    pending: pendingOrders.value.length,
    confirmed: confirmedOrders.value.length,
    to_collect: toCollectOrders.value.length,
    in_progress: inProgressOrders.value.length,
    ready: readyOrders.value.length,
    delivered: deliveredOrders.value.length,
    total: orders.value.length
  }))
  
  /** La commande sélectionnée peut-elle générer un OTP ? */
  const canGenerateOTP = computed(() => {
    if (!selectedOrder.value) return false
    const validStatuses: OrderStatus[] = ['collected', 'in_progress', 'ready']
    return (
      validStatuses.includes(selectedOrder.value.statut) &&
      !selectedOrder.value.is_delivery_validated
    )
  })
  
  /** La commande sélectionnée peut-elle valider un OTP ? */
  const canValidateOTP = computed(() => {
    if (!selectedOrder.value) return false
    return (
      selectedOrder.value.has_delivery_otp &&
      !selectedOrder.value.is_delivery_validated &&
      selectedOrder.value.statut !== 'cancelled'
    )
  })
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Récupère la liste des commandes
   */
  async function fetchOrders(
    options: {
      limit?: number
      offset?: number
      append?: boolean
    } = {}
  ): Promise<Order[]> {
    const { limit = 50, offset = 0, append = false } = options
    
    isLoading.value = true
    error.value = null
    
    try {
      const params: Record<string, any> = { limit, offset, ...filters.value }
      
      const { data } = await api.get<Order[]>('/providers/orders/', { params })
      
      // L'API retourne directement un tableau
      if (append && offset > 0) {
        orders.value = [...orders.value, ...data]
      } else {
        orders.value = data
      }
      
      return data
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors du chargement des commandes'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Récupère une commande par son ID
   */
  async function fetchOrder(orderId: string): Promise<Order> {
    isLoading.value = true
    error.value = null
    
    try {
      const { data } = await api.get<Order>(`/providers/orders/${orderId}/`)
      selectedOrder.value = data
      return data
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors du chargement de la commande'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Met à jour le statut d'une commande
   */
  async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    options?: { notes?: string; reason?: string }
  ): Promise<Order> {
    isLoading.value = true
    error.value = null
    
    try {
      const payload: Record<string, any> = { statut: newStatus }
      if (options?.notes) payload.notes = options.notes
      if (options?.reason) payload.cancellation_reason = options.reason
      
      const { data } = await api.patch<Order>(`/providers/orders/${orderId}/status/`, payload)
      
      // Mettre à jour localement
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = data
      }
      if (selectedOrder.value?.id === orderId) {
        selectedOrder.value = data
      }
      
      return data
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de la mise à jour du statut'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Accepte une commande
   */
  async function acceptOrder(orderId: string): Promise<Order> {
    return updateOrderStatus(orderId, 'confirmed')
  }
  
  /**
   * Refuse une commande
   */
  async function rejectOrder(orderId: string, reason: string, notes?: string): Promise<Order> {
    return updateOrderStatus(orderId, 'cancelled', { reason, notes })
  }
  
  /**
   * Marque comme collectée
   */
  async function markAsCollected(orderId: string): Promise<Order> {
    return updateOrderStatus(orderId, 'collected')
  }
  
  /**
   * Marque comme en cours
   */
  async function markAsInProgress(orderId: string): Promise<Order> {
    return updateOrderStatus(orderId, 'in_progress')
  }
  
  /**
   * Marque comme prête
   */
  async function markAsReady(orderId: string): Promise<Order> {
    return updateOrderStatus(orderId, 'ready')
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS OTP
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Génère un OTP de livraison
   */
  async function generateDeliveryOTP(orderId: string): Promise<OTPStatus> {
    isOTPLoading.value = true
    error.value = null
    
    try {
      const { data } = await api.post<{
        success: boolean
        message: string
        otp_status: OTPStatus
      }>(`/provider/orders/${orderId}/generate-otp/`)
      
      selectedOTPStatus.value = data.otp_status
      
      // Rafraîchir la commande
      await fetchOrder(orderId)
      
      return data.otp_status
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de la génération de l\'OTP'
      throw err
    } finally {
      isOTPLoading.value = false
    }
  }
  
  /**
   * Valide un OTP de livraison
   */
  async function validateDeliveryOTP(orderId: string, code: string): Promise<Order> {
    isOTPLoading.value = true
    error.value = null
    
    try {
      const { data } = await api.post<{
        success: boolean
        message: string
        order: Order
      }>(`/provider/orders/${orderId}/validate-otp/`, { code })
      
      // Mettre à jour localement
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = data.order
      }
      selectedOrder.value = data.order
      
      return data.order
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de la validation de l\'OTP'
      throw err
    } finally {
      isOTPLoading.value = false
    }
  }
  
  /**
   * Régénère un OTP de livraison
   */
  async function regenerateDeliveryOTP(orderId: string): Promise<OTPStatus> {
    isOTPLoading.value = true
    error.value = null
    
    try {
      const { data } = await api.post<{
        success: boolean
        message: string
        otp_status: OTPStatus
      }>(`/provider/orders/${orderId}/regenerate-otp/`)
      
      selectedOTPStatus.value = data.otp_status
      
      return data.otp_status
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de la régénération de l\'OTP'
      throw err
    } finally {
      isOTPLoading.value = false
    }
  }
  
  /**
   * Récupère le statut OTP d'une commande
   */
  async function fetchOTPStatus(orderId: string): Promise<OTPStatus> {
    try {
      const { data } = await api.get<{
        order_id: string
        order_numero: string
        order_statut: string
        otp_status: OTPStatus
      }>(`/provider/orders/${orderId}/otp-status/`)
      
      selectedOTPStatus.value = data.otp_status
      return data.otp_status
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de la récupération du statut OTP'
      throw err
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // VÉRIFICATION À LA COLLECTE
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Vérifie la quantité réelle à la collecte (livreur)
   */
  async function verifyQuantity(
    orderId: string, 
    payload: { verified_weight?: number; verified_pieces?: number; notes?: string; timeout_minutes?: number }
  ): Promise<{
    verification: {
      adjustment_needed: boolean
      adjustment_amount: number
      new_total: number
      initial_paid: number
      estimated: { weight?: number; pieces?: number }
      verified: { weight?: number; pieces?: number }
      deadline?: string
      credit_issued: number
    }
    order: Order
    message: string
  }> {
    try {
      isLoading.value = true
      error.value = null
      
      const { data } = await api.post(`/providers/orders/${orderId}/verify-quantity/`, payload)
      
      // Mettre à jour la commande dans le store
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = data.order
      }
      if (selectedOrder.value?.id === orderId) {
        selectedOrder.value = data.order
      }
      
      return data
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de la vérification'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Confirme la collecte après vérification (livreur)
   */
  async function confirmCollection(orderId: string): Promise<Order> {
    try {
      isLoading.value = true
      error.value = null
      
      const { data } = await api.post<Order>(`/providers/orders/${orderId}/confirm-collection/`)
      
      // Mettre à jour la commande dans le store
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = data
      }
      if (selectedOrder.value?.id === orderId) {
        selectedOrder.value = data
      }
      
      return data
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de la confirmation de collecte'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Applique des filtres
   */
  function setFilters(newFilters: OrderFilters): void {
    filters.value = { ...newFilters }
  }
  
  /**
   * Efface les filtres
   */
  function clearFilters(): void {
    filters.value = {}
  }
  
  /**
   * Sélectionne une commande
   */
  function selectOrder(order: Order | null): void {
    selectedOrder.value = order
    selectedOTPStatus.value = null
  }
  
  /**
   * Formate le statut pour l'affichage
   */
  function getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      pending: 'warning',
      confirmed: 'info',
      collected: 'info',
      in_progress: 'primary',
      ready: 'success',
      delivered: 'success',
      cancelled: 'error'
    }
    return colors[status] || 'default'
  }
  
  /**
   * Obtient le prochain statut possible
   */
  function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const workflow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'confirmed',
      confirmed: 'collected',
      collected: 'in_progress',
      in_progress: 'ready',
      ready: 'delivered', // Via OTP
      delivered: null,
      cancelled: null
    }
    return workflow[currentStatus]
  }
  
  /**
   * Réinitialise le store
   */
  function reset(): void {
    orders.value = []
    pagination.value = null
    selectedOrder.value = null
    selectedOTPStatus.value = null
    filters.value = {}
    error.value = null
    isLoading.value = false
    isOTPLoading.value = false
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════
  
  return {
    // State
    orders,
    pagination,
    selectedOrder,
    selectedOTPStatus,
    filters,
    isLoading,
    isOTPLoading,
    error,
    
    // Computed
    pendingOrders,
    confirmedOrders,
    toCollectOrders,
    inProgressOrders,
    readyOrders,
    deliveredOrders,
    ordersCounts,
    canGenerateOTP,
    canValidateOTP,
    
    // Actions - Commandes
    fetchOrders,
    fetchOrder,
    updateOrderStatus,
    acceptOrder,
    rejectOrder,
    markAsCollected,
    markAsInProgress,
    markAsReady,
    
    // Actions - OTP
    generateDeliveryOTP,
    validateDeliveryOTP,
    regenerateDeliveryOTP,
    fetchOTPStatus,
    
    // Actions - Vérification à la collecte
    verifyQuantity,
    confirmCollection,
    
    // Helpers
    setFilters,
    clearFilters,
    selectOrder,
    getStatusColor,
    getNextStatus,
    reset
  }
})
