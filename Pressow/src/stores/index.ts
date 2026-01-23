/**
 * Export centralisé de tous les stores Pinia
 */

// Stores d'authentification et onboarding
export { useAuthStore } from './auth'
export { useOnboardingStore } from './onboarding'

// Stores du dashboard prestataire
export { useDashboardStore } from './dashboard'
export { useWalletStore } from './wallet'
export { useOrdersStore } from './orders'

// Types réexportés pour faciliter l'utilisation
export type {
  // Onboarding
  OnboardingStatus,
  IdentityData,
  ServiceItem,
  PayoutData,
  PayoutAccount as OnboardingPayoutAccount,
  OpenStatus,
} from './onboarding'

export type {
  // Dashboard
  DashboardData,
  DashboardStats,
  PeriodStats,
  ChecklistItem,
  PendingOrder,
  ProviderInfo,
  WalletSummary as DashboardWalletSummary,
  ShareLink,
  DetailedStats,
} from './dashboard'

export type {
  // Wallet
  WalletSummary,
  WalletTransaction,
  TransactionType,
  TransactionDirection,
  TransactionStatus,
  PayoutRequest,
  PayoutStatus,
  PayoutAccount,
} from './wallet'

export type {
  // Orders
  Order,
  OrderStatus,
  PaymentStatus,
  PayoutStatus as OrderPayoutStatus,
  OrderClient,
  OrderItem,
  OTPStatus,
  OrderFilters,
} from './orders'

// Constantes
export { CANCELLATION_REASONS } from './orders'
