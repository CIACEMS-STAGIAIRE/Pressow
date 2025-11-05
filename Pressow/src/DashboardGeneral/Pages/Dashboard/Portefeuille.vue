<template>
  <DashboardLayout>
    <div class="dashboard-layout">
    <div class="wallet-dashboard">
      <!-- En-tête du portefeuille -->
      <div class="wallet-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-wallet title-icon"></i>
            Mon Portefeuille
          </h1>
          <p class="page-subtitle">Gérez vos finances et effectuez des retraits</p>
        </div>
      </div>

      <!-- Alertes et notifications -->
      <div v-if="showPendingAlert" class="alert-section">
        <div class="alert alert-warning">
          <i class="fas fa-clock alert-icon"></i>
          <div class="alert-content">
            <h4 class="alert-title">Retrait en attente</h4>
            <p class="alert-message">Votre retrait de {{ formatCurrency(pendingWithdrawalAmount) }} FCFA est en cours de traitement</p>
          </div>
          <button class="alert-close" @click="dismissAlert">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Solde principal -->
      <div class="balance-section">
        <div class="balance-grid">
          <div class="main-balance-card card">
            <div class="card-content">
              <div class="balance-content">
                <div class="balance-info">
                  <div class="balance-label">Solde Disponible</div>
                  <div class="balance-amount">{{ formatCurrency(walletBalance) }} FCFA</div>
                  <div class="balance-trend">
                    <i class="fas fa-arrow-up trend-positive"></i>
                    <span>Solde à jour</span>
                  </div>
                </div>
                <div class="balance-icon">
                  <i class="fas fa-coins"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="quick-actions-section">
        <h2 class="section-title">
          <i class="fas fa-bolt section-icon"></i>
          Actions Rapides
        </h2>
        <div class="actions-grid">
          <div class="action-card card" @click="openWithdrawalModal">
            <div class="card-content">
              <div class="action-content">
                <div class="action-icon withdraw">
                  <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="action-info">
                  <h3 class="action-title">Retrait</h3>
                  <p class="action-description">Transférer de l'argent vers votre compte</p>
                </div>
                <div class="action-badge" v-if="hasPendingWithdrawals">
                  <i class="fas fa-clock"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="action-card card" @click="showTransactionHistory">
            <div class="card-content">
              <div class="action-content">
                <div class="action-icon history">
                  <i class="fas fa-history"></i>
                </div>
                <div class="action-info">
                  <h3 class="action-title">Historique</h3>
                  <p class="action-description">Voir toutes vos transactions</p>
                </div>
              </div>
            </div>
          </div>

          <div class="action-card card" @click="showBankAccounts">
            <div class="card-content">
              <div class="action-content">
                <div class="action-icon bank">
                  <i class="fas fa-university"></i>
                </div>
                <div class="action-info">
                  <h3 class="action-title">Comptes Bancaires</h3>
                  <p class="action-description">Gérer vos comptes liés</p>
                </div>
                <div class="action-badge" v-if="bankAccounts.length > 0">
                  {{ bankAccounts.length }}
                </div>
              </div>
            </div>
          </div>

          <div class="action-card card" @click="downloadStatement">
            <div class="card-content">
              <div class="action-content">
                <div class="action-icon statement">
                  <i class="fas fa-file-invoice-dollar"></i>
                </div>
                <div class="action-info">
                  <h3 class="action-title">Relevé</h3>
                  <p class="action-description">Télécharger votre relevé</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques financières -->
      <div class="stats-section">
        <h2 class="section-title">
          <i class="fas fa-chart-bar section-icon"></i>
          Aperçu Financier
        </h2>
        <div class="stats-grid">
          <div v-for="(stat, index) in financialStats" :key="index" class="stat-card card">
            <div class="card-content">
              <div class="stat-content">
                <div class="stat-icon-container">
                  <div :class="['stat-icon', stat.bgColor]">
                    <i :class="stat.icon"></i>
                  </div>
                </div>
                <div class="stat-info">
                  <p class="stat-label">{{ stat.title }}</p>
                  <p class="stat-value">{{ stat.value }}</p>
                  <div class="stat-trend" :class="stat.trendClass">
                    <i :class="stat.trendIcon"></i>
                    <span>{{ stat.trendValue }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dernières transactions -->
      <div class="transactions-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fas fa-exchange-alt section-icon"></i>
            Dernières Transactions
          </h2>
          <button class="view-all-btn" @click="showTransactionHistory">
            Voir tout
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div class="transactions-card card">
          <div class="card-content">
            <div class="transactions-list">
              <div 
                v-for="transaction in recentTransactions" 
                :key="transaction.id" 
                class="transaction-item" 
                :class="transaction.status"
                @click="showTransactionDetails(transaction)"
              >
                <div class="transaction-icon">
                  <i :class="transaction.icon"></i>
                </div>
                <div class="transaction-details">
                  <p class="transaction-title">{{ transaction.title }}</p>
                  <p class="transaction-date">{{ transaction.date }}</p>
                  <div v-if="transaction.status === 'pending'" class="transaction-status">
                    <i class="fas fa-clock"></i>
                    En traitement
                  </div>
                </div>
                <div class="transaction-amount" :class="transaction.type">
                  {{ transaction.amount }}
                </div>
              </div>
            </div>
            
            <div v-if="recentTransactions.length === 0" class="empty-state">
              <i class="fas fa-receipt empty-icon"></i>
              <p class="empty-text">Aucune transaction récente</p>
              <button class="btn-primary" @click="openWithdrawalModal">
                Effectuer un retrait
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Comptes bancaires liés -->
      <div class="bank-accounts-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fas fa-university section-icon"></i>
            Comptes Bancaires Liés
          </h2>
          <button class="view-all-btn" @click="showBankAccounts">
            Gérer
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="accounts-grid">
          <div 
            v-for="account in bankAccounts" 
            :key="account.id" 
            class="account-card card"
            :class="{ 'default-account': account.isDefault }"
          >
            <div class="card-content">
              <div class="account-content">
                <div class="account-icon">
                  <i :class="account.icon"></i>
                </div>
                <div class="account-info">
                  <h3 class="account-bank">{{ account.bankName }}</h3>
                  <p class="account-number">{{ account.accountNumber }}</p>
                  <p class="account-type">{{ account.accountType }}</p>
                  <div v-if="account.isDefault" class="default-badge">
                    <i class="fas fa-star"></i>
                    Compte par défaut
                  </div>
                </div>
                <div class="account-status" :class="account.status">
                  {{ account.status === 'active' ? 'Actif' : 'En attente' }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="add-account-card card" @click="addBankAccount">
            <div class="card-content">
              <div class="add-account-content">
                <i class="fas fa-plus add-icon"></i>
                <p class="add-text">Ajouter un compte</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de retrait -->
    <div v-if="showWithdrawalModal" class="modal-overlay" @click="closeWithdrawalModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Effectuer un Retrait</h3>
          <button class="modal-close" @click="closeWithdrawalModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Étapes du retrait -->
          <div class="withdrawal-steps">
            <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
              <div class="step-number">1</div>
              <span class="step-label">Montant</span>
            </div>
            <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
              <div class="step-number">2</div>
              <span class="step-label">Compte</span>
            </div>
            <div class="step" :class="{ active: currentStep === 3 }">
              <div class="step-number">3</div>
              <span class="step-label">Confirmation</span>
            </div>
          </div>

          <!-- Étape 1: Montant -->
          <div v-if="currentStep === 1" class="step-content">
            <div class="form-group">
              <label class="form-label">Montant du retrait</label>
              <div class="amount-input-container">
                <input 
                  v-model="withdrawalAmount" 
                  type="number" 
                  class="amount-input"
                  placeholder="0"
                  :max="walletBalance"
                  @input="validateAmount"
                >
                <span class="currency-suffix">FCFA</span>
              </div>
              <p class="available-balance">
                Solde disponible: {{ formatCurrency(walletBalance) }} FCFA
              </p>
              
              <!-- Montants rapides -->
              <div class="quick-amounts">
                <button 
                  v-for="amount in quickAmounts" 
                  :key="amount"
                  class="quick-amount-btn"
                  :class="{ active: withdrawalAmount === amount.toString() }"
                  @click="setQuickAmount(amount)"
                >
                  {{ formatCurrency(amount) }} FCFA
                </button>
              </div>
            </div>
            
            <!-- Résumé des frais -->
            <div class="fee-summary">
              <div class="fee-item">
                <span><i class="fas fa-money-bill"></i> Montant du retrait:</span>
                <span>{{ formatCurrency(parseInt(withdrawalAmount) || 0) }} FCFA</span>
              </div>
              <div class="fee-item">
                <span><i class="fas fa-percentage"></i> Frais de transaction:</span>
                <span>{{ formatCurrency(transactionFee) }} FCFA</span>
              </div>
              <div class="fee-item total">
                <span><i class="fas fa-calculator"></i> Total débité:</span>
                <span>{{ formatCurrency(totalDebit) }} FCFA</span>
              </div>
            </div>
          </div>

          <!-- Étape 2: Compte bancaire -->
          <div v-if="currentStep === 2" class="step-content">
            <div class="form-group">
              <label class="form-label">Compte de destination</label>
              <div class="accounts-list">
                <div 
                  v-for="account in bankAccounts" 
                  :key="account.id"
                  class="account-option"
                  :class="{ selected: selectedAccount === account.id.toString() }"
                  @click="selectedAccount = account.id.toString()"
                >
                  <div class="account-option-icon">
                    <i :class="account.icon"></i>
                  </div>
                  <div class="account-option-info">
                    <h4>{{ account.bankName }}</h4>
                    <p>{{ account.accountNumber }} • {{ account.accountType }}</p>
                  </div>
                  <div class="account-option-check">
                    <i class="fas fa-check" v-if="selectedAccount === account.id.toString()"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="add-account-prompt">
              <p><i class="fas fa-info-circle"></i> Vous ne trouvez pas votre compte ?</p>
              <button class="btn-text" @click="addBankAccount">
                <i class="fas fa-plus"></i>
                Ajouter un nouveau compte
              </button>
            </div>
          </div>

          <!-- Étape 3: Confirmation -->
          <div v-if="currentStep === 3" class="step-content">
            <div class="confirmation-content">
              <div class="confirmation-icon">
                <i class="fas fa-shield-check"></i>
              </div>
              <h4 class="confirmation-title">Confirmer le retrait</h4>
              
              <div class="confirmation-details">
                <div class="detail-item">
                  <span><i class="fas fa-money-bill-wave"></i> Montant:</span>
                  <strong>{{ formatCurrency(parseInt(withdrawalAmount)) }} FCFA</strong>
                </div>
                <div class="detail-item">
                  <span><i class="fas fa-university"></i> Compte destination:</span>
                  <span>{{ getSelectedAccount()?.bankName }} - {{ getSelectedAccount()?.accountNumber }}</span>
                </div>
                <div class="detail-item">
                  <span><i class="fas fa-percentage"></i> Frais:</span>
                  <span>{{ formatCurrency(transactionFee) }} FCFA</span>
                </div>
                <div class="detail-item total">
                  <span><i class="fas fa-calculator"></i> Total:</span>
                  <strong>{{ formatCurrency(totalDebit) }} FCFA</strong>
                </div>
                <div class="detail-item">
                  <span><i class="fas fa-clock"></i> Date de traitement:</span>
                  <span>{{ processingDate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            v-if="currentStep > 1"
            class="btn-secondary" 
            @click="previousStep"
          >
            <i class="fas fa-arrow-left"></i>
            Retour
          </button>
          
          <button 
            v-if="currentStep < 3"
            class="btn-primary" 
            :disabled="!canProceedToNextStep"
            @click="nextStep"
          >
            Continuer
            <i class="fas fa-arrow-right"></i>
          </button>
          
          <button 
            v-if="currentStep === 3"
            class="btn-primary" 
            :disabled="!canWithdraw"
            @click="processWithdrawal"
          >
            <i class="fas fa-check"></i>
            Confirmer le retrait
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de retrait -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content success-modal" @click.stop>
        <div class="success-content">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 class="success-title">Retrait effectué avec succès !</h3>
          <p class="success-message">
            Votre retrait de <strong>{{ formatCurrency(parseInt(withdrawalAmount)) }} FCFA</strong> 
            a été initié avec succès. L'argent sera viré sur votre compte 
            <strong>{{ getSelectedAccount()?.bankName }}</strong> dans les 24 heures.
          </p>
          
          <div class="success-details">
            <div class="success-detail">
              <span><i class="fas fa-hashtag"></i> Référence:</span>
              <span>{{ withdrawalReference }}</span>
            </div>
            <div class="success-detail">
              <span><i class="fas fa-calendar"></i> Date d'opération:</span>
              <span>{{ new Date().toLocaleDateString('fr-FR') }}</span>
            </div>
          </div>
          
          <div class="success-actions">
            <button class="btn-secondary" @click="downloadReceipt">
              <i class="fas fa-download"></i>
              Télécharger le reçu
            </button>
            <button class="btn-primary" @click="closeSuccessModal">
              Terminer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour ajouter un compte -->
    <div v-if="showAddAccountModal" class="modal-overlay" @click="showAddAccountModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Ajouter un compte</h3>
          <button class="modal-close" @click="showAddAccountModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Type de compte</label>
            <select v-model="newAccount.type" class="form-select">
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_account">Compte Bancaire</option>
            </select>
          </div>

          <div v-if="newAccount.type === 'mobile_money'" class="form-group">
            <label class="form-label">Fournisseur</label>
            <select v-model="newAccount.provider" class="form-select">
              <option v-for="provider in mobileProviders" :key="provider" :value="provider">
                {{ provider }}
              </option>
            </select>
            <label class="form-label">Nom / Numéro</label>
            <input 
              v-model="newAccount.phone" 
              class="form-input"
              placeholder="Nom & Numéro (ex: Jean - +225xxxxxxxx)" 
            />
          </div>

          <div v-else class="form-group">
            <label class="form-label">Nom de la banque</label>
            <input 
              v-model="newAccount.bankName" 
              class="form-input"
              placeholder="Ex: BICEC" 
            />
            <label class="form-label">Numéro de compte</label>
            <input 
              v-model="newAccount.accountNumber" 
              class="form-input"
              placeholder="000123456789" 
            />
            <label class="form-label">Nom du titulaire</label>
            <input 
              v-model="newAccount.accountHolder" 
              class="form-input"
              placeholder="Nom complet" 
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddAccountModal = false">
            Annuler
          </button>
          <button class="btn-primary" @click="saveNewAccount">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import DashboardLayout from '@/DashboardGeneral/Components/DashboardLayout.vue'

// Types
interface BankAccount {
  id: number
  bankName: string
  accountNumber: string
  accountType: string
  icon: string
  status: 'active' | 'pending'
  isDefault: boolean
}

interface Transaction {
  id: number
  title: string
  date: string
  amount: string
  type: 'withdrawal' | 'fee'
  icon: string
  status: 'completed' | 'pending' | 'failed'
}

interface FinancialStat {
  title: string
  value: string
  icon: string
  bgColor: string
  trendValue: string
  trendIcon: string
  trendClass: string
}

interface NewAccount {
  type: 'mobile_money' | 'bank_account'
  provider: string
  phone: string
  bankName: string
  accountNumber: string
  accountHolder: string
}

// Données réactives
const walletBalance = ref(1250000)
const showWithdrawalModal = ref(false)
const showSuccessModal = ref(false)
const showPendingAlert = ref(true)
const showAddAccountModal = ref(false)
const currentStep = ref(1)
const withdrawalAmount = ref('')
const selectedAccount = ref('')
const withdrawalReference = ref('')
const pendingWithdrawalAmount = ref(300000)

// Configuration
const transactionFee = 500
const quickAmounts = [50000, 100000, 200000, 500000]
const mobileProviders = ['Orange CI', 'Moov CI', 'MTN CI', 'Wave CI']

// Données des comptes bancaires
const bankAccounts = ref<BankAccount[]>([
  {
    id: 1,
    bankName: 'BICEC',
    accountNumber: '***4587',
    accountType: 'Compte Courant',
    icon: 'fas fa-university',
    status: 'active',
    isDefault: true
  },
  {
    id: 2,
    bankName: 'UBA',
    accountNumber: '***8921',
    accountType: 'Compte Épargne',
    icon: 'fas fa-piggy-bank',
    status: 'active',
    isDefault: false
  },
  {
    id: 3,
    bankName: 'SGBC',
    accountNumber: '***6345',
    accountType: 'Compte Courant',
    icon: 'fas fa-university',
    status: 'active',
    isDefault: false
  }
])

// Transactions récentes
const recentTransactions = ref<Transaction[]>([
  {
    id: 1,
    title: 'Retrait vers BICEC',
    date: '15 Nov 2023, 14:30',
    amount: '-150,000 FCFA',
    type: 'withdrawal',
    icon: 'fas fa-arrow-up',
    status: 'completed'
  },
  {
    id: 2,
    title: 'Retrait vers UBA',
    date: '12 Nov 2023, 09:15',
    amount: '-300,000 FCFA',
    type: 'withdrawal',
    icon: 'fas fa-arrow-up',
    status: 'pending'
  },
  {
    id: 3,
    title: 'Commission de service',
    date: '10 Nov 2023, 16:45',
    amount: '-2,500 FCFA',
    type: 'fee',
    icon: 'fas fa-percentage',
    status: 'completed'
  },
  {
    id: 4,
    title: 'Retrait vers SGBC',
    date: '05 Nov 2023, 11:20',
    amount: '-200,000 FCFA',
    type: 'withdrawal',
    icon: 'fas fa-arrow-up',
    status: 'completed'
  }
])

// Nouveau compte
const newAccount = ref<NewAccount>({
  type: 'mobile_money',
  provider: mobileProviders[0] ?? '',
  phone: '',
  bankName: '',
  accountNumber: '',
  accountHolder: '',
})

// Computed properties
const totalDebit = computed(() => {
  const amount = parseInt(withdrawalAmount.value) || 0
  return amount + transactionFee
})

const canWithdraw = computed(() => {
  const amount = parseInt(withdrawalAmount.value) || 0
  return amount > 0 && 
         amount <= walletBalance.value && 
         selectedAccount.value !== '' &&
         totalDebit.value <= walletBalance.value
})

const canProceedToNextStep = computed(() => {
  switch (currentStep.value) {
    case 1:
      const amount = parseInt(withdrawalAmount.value) || 0
      return amount > 0 && amount <= walletBalance.value
    case 2:
      return selectedAccount.value !== ''
    default:
      return true
  }
})

const hasPendingWithdrawals = computed(() => {
  return recentTransactions.value.some(t => t.status === 'pending')
})

const processingDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const financialStats = computed<FinancialStat[]>(() => [
  {
    title: 'Revenu Total du Mois',
    value: `${formatCurrency(1750000)} FCFA`,
    icon: 'fas fa-coins',
    bgColor: 'bg-blue-light',
    trendValue: '+12%',
    trendIcon: 'fas fa-arrow-up',
    trendClass: 'trend-positive'
  },
  {
    title: 'Transactions ce Mois',
    value: recentTransactions.value.length.toString(),
    icon: 'fas fa-exchange-alt',
    bgColor: 'bg-green-light',
    trendValue: `${recentTransactions.value.length} opérations`,
    trendIcon: 'fas fa-chart-line',
    trendClass: 'trend-neutral'
  }
])

// Méthodes
const formatCurrency = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const openWithdrawalModal = () => {
  showWithdrawalModal.value = true
  currentStep.value = 1
  withdrawalAmount.value = ''
  selectedAccount.value = ''
}

const closeWithdrawalModal = () => {
  showWithdrawalModal.value = false
  currentStep.value = 1
}

const nextStep = () => {
  if (currentStep.value < 3 && canProceedToNextStep.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const setQuickAmount = (amount: number) => {
  withdrawalAmount.value = amount.toString()
}

const validateAmount = () => {
  const amount = parseInt(withdrawalAmount.value) || 0
  if (amount > walletBalance.value) {
    withdrawalAmount.value = walletBalance.value.toString()
  }
}

const getSelectedAccount = () => {
  return bankAccounts.value.find(acc => acc.id === parseInt(selectedAccount.value))
}

const processWithdrawal = () => {
  if (!canWithdraw.value) return
  
  // Générer une référence
  withdrawalReference.value = 'WT' + Date.now().toString().slice(-8)
  
  // Mettre à jour le solde
  const amount = parseInt(withdrawalAmount.value)
  walletBalance.value -= totalDebit.value
  
  // Ajouter à l'historique des transactions
  recentTransactions.value.unshift({
    id: Date.now(),
    title: `Retrait vers ${getSelectedAccount()?.bankName}`,
    date: new Date().toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    amount: `-${formatCurrency(amount)} FCFA`,
    type: 'withdrawal',
    icon: 'fas fa-arrow-up',
    status: 'pending'
  })
  
  // Fermer le modal de retrait et ouvrir le modal de succès
  showWithdrawalModal.value = false
  showSuccessModal.value = true
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  withdrawalAmount.value = ''
  selectedAccount.value = ''
  currentStep.value = 1
}

const downloadReceipt = () => {
  const receiptContent = `
    Reçu de Retrait
    ================
    Référence: ${withdrawalReference.value}
    Montant: ${formatCurrency(parseInt(withdrawalAmount.value))} FCFA
    Frais: ${formatCurrency(transactionFee)} FCFA
    Total: ${formatCurrency(totalDebit.value)} FCFA
    Compte: ${getSelectedAccount()?.bankName} - ${getSelectedAccount()?.accountNumber}
    Date: ${new Date().toLocaleDateString('fr-FR')}
  `
  
  const blob = new Blob([receiptContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `recu-retrait-${withdrawalReference.value}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const showTransactionHistory = () => {
  window.open('/historique-transactions', '_blank')
}

const showBankAccounts = () => {
  window.open('/gestion-comptes', '_blank')
}

const addBankAccount = () => {
  showAddAccountModal.value = true
}

const saveNewAccount = () => {
  if (newAccount.value.type === 'mobile_money') {
    if (!newAccount.value.phone.trim()) {
      alert('Veuillez saisir le numéro de téléphone')
      return
    }
    
    bankAccounts.value.push({
      id: Date.now(),
      bankName: newAccount.value.provider,
      accountNumber: newAccount.value.phone,
      accountType: 'Mobile Money',
      icon: 'fas fa-mobile-alt',
      status: 'pending',
      isDefault: false,
    })
  } else {
    if (!newAccount.value.bankName.trim() || !newAccount.value.accountNumber.trim()) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    bankAccounts.value.push({
      id: Date.now(),
      bankName: newAccount.value.bankName,
      accountNumber: newAccount.value.accountNumber,
      accountType: 'Compte Bancaire',
      icon: 'fas fa-university',
      status: 'pending',
      isDefault: false,
    })
  }
  
  // Réinitialiser et fermer
  newAccount.value = {
    type: 'mobile_money',
    provider: mobileProviders[0] ?? '',
    phone: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  }
  showAddAccountModal.value = false
}

const showTransactionDetails = (transaction: Transaction) => {
  alert(`Détails de la transaction:\n${transaction.title}\n${transaction.date}\n${transaction.amount}`)
}

const downloadStatement = () => {
  const statementContent = `
    Relevé de Compte
    ================
    Solde actuel: ${formatCurrency(walletBalance.value)} FCFA
    Date: ${new Date().toLocaleDateString('fr-FR')}
    
    Dernières transactions:
    ${recentTransactions.value.map(t => `- ${t.title}: ${t.amount} (${t.date})`).join('\n')}
  `
  
  const blob = new Blob([statementContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `releve-compte-${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const dismissAlert = () => {
  showPendingAlert.value = false
}

// Cycle de vie
onMounted(() => {
  console.log('Composant Wallet monté')
})
</script>

<style scoped src="@/DashboardGeneral/Assets/Styles/Portefeuille.css"></style>