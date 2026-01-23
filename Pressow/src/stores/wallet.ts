/**
 * Store Pinia pour le portefeuille prestataire
 * 
 * Gère le solde, l'historique des transactions,
 * et les demandes de retrait (payouts).
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/** Types de transactions */
export type TransactionType = 'order_payment' | 'commission' | 'payout' | 'refund' | 'adjustment' | 'bonus'

/** Direction de la transaction */
export type TransactionDirection = 'credit' | 'debit'

/** Statut de la transaction */
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

/** Statut du payout */
export type PayoutStatus = 'pending' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled'

/** Opérateurs Mobile Money */
export type MobileMoneyOperator = 'orange' | 'mtn' | 'moov' | 'wave'

/** Compte de payout */
export interface PayoutAccount {
  id: string
  operator: MobileMoneyOperator
  operator_display: string
  phone_number: string
  account_name: string
  status: string
}

/** Résumé du wallet */
export interface WalletSummary {
  wallet_id: string
  balance: number
  pending_balance: number
  total_earned: number
  total_withdrawn: number
  total_commission_paid: number
  orders_completed: number
  last_payout_at: string | null
  is_active: boolean
  stats: {
    week_earnings: number
    week_payouts: number
  }
  payout_account: PayoutAccount | null
}

/** Transaction du wallet */
export interface WalletTransaction {
  id: string
  type: TransactionType
  type_display: string
  direction: TransactionDirection
  amount: number
  balance_after: number
  reference: string
  description: string
  order_numero: string | null
  status: TransactionStatus
  created: string
  metadata: Record<string, any>
}

/** Pagination */
export interface Pagination {
  total: number
  limit: number
  offset: number
  has_more: boolean
}

/** Réponse des transactions */
export interface TransactionsResponse {
  transactions: WalletTransaction[]
  pagination: Pagination
}

/** Demande de payout */
export interface PayoutRequest {
  id: string
  reference: string
  amount: number
  fee: number
  net_amount: number
  status: PayoutStatus
  status_display: string
  operator: MobileMoneyOperator
  operator_display: string
  phone_number: string
  order_numero: string | null
  is_automatic: boolean
  scheduled_at: string | null
  completed_at: string | null
  error_message: string
  created: string
}

/** Réponse des payouts */
export interface PayoutsResponse {
  payouts: PayoutRequest[]
  pagination: Pagination
}

// =============================================================================
// STORE
// =============================================================================

export const useWalletStore = defineStore('wallet', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** Résumé du wallet */
  const summary = ref<WalletSummary | null>(null)
  
  /** Liste des transactions */
  const transactions = ref<WalletTransaction[]>([])
  
  /** Pagination des transactions */
  const transactionsPagination = ref<Pagination | null>(null)
  
  /** Liste des payouts */
  const payouts = ref<PayoutRequest[]>([])
  
  /** Pagination des payouts */
  const payoutsPagination = ref<Pagination | null>(null)
  
  /** État de chargement */
  const isLoading = ref(false)
  
  /** Erreurs */
  const error = ref<string | null>(null)
  
  /** Dernier payout créé (pour afficher confirmation) */
  const lastCreatedPayout = ref<PayoutRequest | null>(null)
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED
  // ═══════════════════════════════════════════════════════════════════════════
  
  /** Solde disponible */
  const balance = computed(() => summary.value?.balance ?? 0)
  
  /** Solde en attente */
  const pendingBalance = computed(() => summary.value?.pending_balance ?? 0)
  
  /** Total gagné */
  const totalEarned = computed(() => summary.value?.total_earned ?? 0)
  
  /** Total retiré */
  const totalWithdrawn = computed(() => summary.value?.total_withdrawn ?? 0)
  
  /** Commissions payées */
  const totalCommission = computed(() => summary.value?.total_commission_paid ?? 0)
  
  /** Commandes complétées */
  const ordersCompleted = computed(() => summary.value?.orders_completed ?? 0)
  
  /** Wallet actif ? */
  const isActive = computed(() => summary.value?.is_active ?? true)
  
  /** Compte de payout configuré */
  const payoutAccount = computed(() => summary.value?.payout_account ?? null)
  
  /** Peut demander un retrait ? */
  const canRequestPayout = computed(() => {
    if (!isActive.value) return false
    if (!payoutAccount.value) return false
    if (balance.value < 500) return false // Minimum 500 FCFA
    return true
  })
  
  /** Gains de la semaine */
  const weekEarnings = computed(() => summary.value?.stats.week_earnings ?? 0)
  
  /** Retraits de la semaine */
  const weekPayouts = computed(() => summary.value?.stats.week_payouts ?? 0)
  
  /** Transactions récentes (5 dernières) */
  const recentTransactions = computed(() => transactions.value.slice(0, 5))
  
  /** Payouts en cours */
  const pendingPayouts = computed(() => 
    payouts.value.filter(p => ['pending', 'scheduled', 'processing'].includes(p.status))
  )
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Récupère le résumé du wallet
   */
  async function fetchSummary(): Promise<WalletSummary> {
    isLoading.value = true
    error.value = null
    
    try {
      const { data } = await api.get<WalletSummary>('/provider/wallet/')
      summary.value = data
      return data
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors du chargement du portefeuille'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Récupère l'historique des transactions
   */
  async function fetchTransactions(
    options: {
      limit?: number
      offset?: number
      type?: TransactionType
      append?: boolean
    } = {}
  ): Promise<TransactionsResponse> {
    const { limit = 50, offset = 0, type, append = false } = options
    
    isLoading.value = true
    error.value = null
    
    try {
      const params: Record<string, any> = { limit, offset }
      if (type) params.type = type
      
      const { data } = await api.get<TransactionsResponse>('/provider/wallet/transactions/', { params })
      
      if (append && offset > 0) {
        transactions.value = [...transactions.value, ...data.transactions]
      } else {
        transactions.value = data.transactions
      }
      transactionsPagination.value = data.pagination
      
      return data
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors du chargement des transactions'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Charge plus de transactions (pagination)
   */
  async function loadMoreTransactions(): Promise<void> {
    if (!transactionsPagination.value?.has_more) return
    
    const currentOffset = transactions.value.length
    await fetchTransactions({
      offset: currentOffset,
      append: true
    })
  }
  
  /**
   * Demande un retrait
   */
  async function requestPayout(amount?: number): Promise<PayoutRequest> {
    isLoading.value = true
    error.value = null
    
    try {
      const payload: Record<string, any> = {}
      if (amount !== undefined) payload.amount = amount
      
      const { data } = await api.post<{
        success: boolean
        message: string
        payout_request: PayoutRequest
      }>('/provider/wallet/payout/', payload)
      
      lastCreatedPayout.value = data.payout_request
      
      // Rafraîchir le wallet et les payouts
      await Promise.all([
        fetchSummary(),
        fetchPayouts()
      ])
      
      return data.payout_request
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de la demande de retrait'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Récupère l'historique des payouts
   */
  async function fetchPayouts(
    options: {
      limit?: number
      offset?: number
      status?: PayoutStatus
      append?: boolean
    } = {}
  ): Promise<PayoutsResponse> {
    const { limit = 50, offset = 0, status, append = false } = options
    
    isLoading.value = true
    error.value = null
    
    try {
      const params: Record<string, any> = { limit, offset }
      if (status) params.status = status
      
      const { data } = await api.get<PayoutsResponse>('/provider/wallet/payouts/', { params })
      
      if (append && offset > 0) {
        payouts.value = [...payouts.value, ...data.payouts]
      } else {
        payouts.value = data.payouts
      }
      payoutsPagination.value = data.pagination
      
      return data
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors du chargement des retraits'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Annule un payout
   */
  async function cancelPayout(payoutId: string, reason?: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    
    try {
      await api.post(`/provider/wallet/payouts/${payoutId}/cancel/`, {
        reason: reason ?? ''
      })
      
      // Mettre à jour localement
      const payout = payouts.value.find(p => p.id === payoutId)
      if (payout) {
        payout.status = 'cancelled'
      }
      
      // Rafraîchir le wallet
      await fetchSummary()
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.detail ?? 'Erreur lors de l\'annulation'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Charge toutes les données du wallet
   */
  async function loadAll(): Promise<void> {
    await Promise.all([
      fetchSummary(),
      fetchTransactions(),
      fetchPayouts()
    ])
  }
  
  /**
   * Formate un montant en FCFA
   */
  function formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA'
  }
  
  /**
   * Réinitialise le store
   */
  function reset(): void {
    summary.value = null
    transactions.value = []
    transactionsPagination.value = null
    payouts.value = []
    payoutsPagination.value = null
    error.value = null
    isLoading.value = false
    lastCreatedPayout.value = null
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════
  
  return {
    // State
    summary,
    transactions,
    transactionsPagination,
    payouts,
    payoutsPagination,
    isLoading,
    error,
    lastCreatedPayout,
    
    // Computed
    balance,
    pendingBalance,
    totalEarned,
    totalWithdrawn,
    totalCommission,
    ordersCompleted,
    isActive,
    payoutAccount,
    canRequestPayout,
    weekEarnings,
    weekPayouts,
    recentTransactions,
    pendingPayouts,
    
    // Actions
    fetchSummary,
    fetchTransactions,
    loadMoreTransactions,
    requestPayout,
    fetchPayouts,
    cancelPayout,
    loadAll,
    formatAmount,
    reset
  }
})
