<template>
  <DashboardLayout>
    <div class="settings-page">
      <div class="page-header">
        <h1 class="page-title">Paramètres</h1>
        <p class="page-description">Personnalisez votre expérience sur la plateforme</p>
      </div>

      <!-- Notifications -->
      <div v-if="visibleSections.notifications" class="settings-card">
        <div class="settings-header">
          <div class="settings-title">
            <span class="title-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </span>
            Notifications
          </div>
          <p class="card-description">Gérez tous vos paramètres de notification</p>
        </div>
        <div class="settings-content">
          <!-- Types de notifications -->
          <div class="settings-section">
            <h3 class="section-title">Types de notifications</h3>
            <div v-for="item in notificationTypes" :key="item.key" class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ item.label }}</label>
                <p class="setting-description">{{ item.description }}</p>
              </div>
              <div class="toggle-container">
                <input 
                  type="checkbox" 
                  :id="`notification-${item.key}`"
                  v-model="settings.notifications.types[item.key]"
                  class="toggle-input"
                >
                <label :for="`notification-${item.key}`" class="toggle-label">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- Canaux de notification -->
          <div class="settings-section">
            <h3 class="section-title">Canaux de notification</h3>
            <div v-for="channel in notificationChannels" :key="channel.key" class="setting-item">
              <div class="setting-info">
                <label class="setting-label">{{ channel.label }}</label>
                <p class="setting-description">{{ channel.description }}</p>
              </div>
              <div class="toggle-container">
                <input 
                  type="checkbox" 
                  :id="`channel-${channel.key}`"
                  v-model="settings.notifications.channels[channel.key]"
                  class="toggle-input"
                >
                <label :for="`channel-${channel.key}`" class="toggle-label">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <!-- Fréquence des notifications -->
          <div class="settings-section">
            <h3 class="section-title">Fréquence des rappels pour commandes en attente</h3>
            <p class="section-description">Choisissez à quelle fréquence vous souhaitez recevoir des rappels pour les commandes en attente</p>
            <div class="form-group">
              <label class="form-label">Fréquence des rappels</label>
              <div class="radio-group">
                <label v-for="option in frequencyOptions" :key="option.value" class="radio-label">
                  <input
                    type="radio"
                    :value="option.value"
                    v-model="settings.notifications.frequency"
                    class="radio-input"
                  />
                  <span class="radio-custom"></span>
                  <span class="radio-text">{{ option.label }}</span>
                </label>
              </div>
              <p class="helper-text">Par défaut: Quotidiennement. Vous pouvez personnaliser la fréquence selon vos préférences.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Availability -->
      <div v-if="visibleSections.availability" class="settings-card">
        <div class="settings-header">
          <div class="settings-title">
            <span class="title-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            Disponibilité
          </div>
          <p class="card-description">Gérez votre disponibilité et vos capacités</p>
        </div>
        <div class="settings-content">
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Acceptation automatique</label>
              <p class="setting-description">Accepter automatiquement les commandes sans validation manuelle</p>
            </div>
            <div class="toggle-container">
              <input 
                type="checkbox" 
                id="auto-accept"
                v-model="settings.availability.autoAccept"
                class="toggle-input"
              >
              <label for="auto-accept" class="toggle-label">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Mode pause</label>
              <p class="setting-description">Mettre temporairement votre compte en pause</p>
            </div>
            <div class="toggle-container">
              <input 
                type="checkbox" 
                id="pause-mode"
                v-model="settings.availability.pauseMode"
                class="toggle-input"
              >
              <label for="pause-mode" class="toggle-label">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Nombre maximum de commandes par jour</label>
            <div class="input-with-toggle">
              <div class="toggle-buttons-group">
                <button
                  v-for="option in maxOrderOptions"
                  :key="option.value"
                  :class="['toggle-button', { active: settings.availability.maxOrdersPerDay === option.value }]"
                  @click="updateMaxOrders(option.value)"
                  type="button"
                >
                  {{ option.label }}
                </button>
              </div>
              <div class="custom-input-container">
                <input
                  type="number"
                  v-model="customMaxOrders"
                  placeholder="Nombre personnalisé"
                  class="custom-input"
                  min="1"
                  max="100"
                  @blur="updateCustomMaxOrders"
                  @keyup.enter="updateCustomMaxOrders"
                />
                <span class="input-suffix">commandes/jour</span>
              </div>
            </div>
          </div>

          <!-- Plages horaires pour jours ouvrables -->
          <div class="form-group">
            <label class="form-label">Plages horaires - Jours ouvrables</label>
            <div class="time-range-group">
              <div class="time-input-container">
                <label class="time-label">Début</label>
                <input
                  type="time"
                  v-model="settings.availability.workHours.weekdays.start"
                  class="time-input"
                />
              </div>
              <span class="time-separator">à</span>
              <div class="time-input-container">
                <label class="time-label">Fin</label>
                <input
                  type="time"
                  v-model="settings.availability.workHours.weekdays.end"
                  class="time-input"
                />
              </div>
            </div>
          </div>

          <!-- Plages horaires pour weekends -->
          <div class="form-group">
            <label class="form-label">Plages horaires - Weekends</label>
            <div class="time-range-group">
              <div class="time-input-container">
                <label class="time-label">Début</label>
                <input
                  type="time"
                  v-model="settings.availability.workHours.weekends.start"
                  class="time-input"
                />
              </div>
              <span class="time-separator">à</span>
              <div class="time-input-container">
                <label class="time-label">Fin</label>
                <input
                  type="time"
                  v-model="settings.availability.workHours.weekends.end"
                  class="time-input"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Jours de travail</label>
            <div class="days-two-columns">
              <div class="days-column">
                <div
                  v-for="day in leftColumnDays"
                  :key="day.value"
                  :class="['day-toggle-item', { active: settings.availability.workingDays.includes(day.value) }]"
                  @click="toggleWorkingDay(day.value)"
                >
                  <div class="day-toggle-switch">
                    <div class="day-toggle-slider"></div>
                  </div>
                  <span class="day-label">{{ day.label }}</span>
                </div>
              </div>
              <div class="days-column">
                <div
                  v-for="day in rightColumnDays"
                  :key="day.value"
                  :class="['day-toggle-item', { active: settings.availability.workingDays.includes(day.value) }]"
                  @click="toggleWorkingDay(day.value)"
                >
                  <div class="day-toggle-switch">
                    <div class="day-toggle-slider"></div>
                  </div>
                  <span class="day-label">{{ day.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security -->
      <div v-if="visibleSections.security" class="settings-card">
        <div class="settings-header">
          <div class="settings-title">
            <span class="title-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            Sécurité
          </div>
          <p class="card-description">Protégez votre compte et vos données</p>
        </div>
        <div class="settings-content">
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Authentification à deux facteurs</label>
              <p class="setting-description">Sécurisez votre compte avec une double vérification</p>
            </div>
            <div class="toggle-container">
              <input 
                type="checkbox" 
                id="twoFactor"
                v-model="settings.security.twoFactorAuth"
                class="toggle-input"
              >
              <label for="twoFactor" class="toggle-label">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Notifications de connexion</label>
              <p class="setting-description">Être alerté en cas de nouvelle connexion</p>
            </div>
            <div class="toggle-container">
              <input 
                type="checkbox" 
                id="login-alerts"
                v-model="settings.security.loginAlerts"
                class="toggle-input"
              >
              <label for="login-alerts" class="toggle-label">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="info-box">
            <p>
              <strong>Note:</strong> La modification du mot de passe se fait dans l'onglet Profil.
              Pour toute autre question de sécurité, veuillez contacter le support.
            </p>
          </div>
        </div>
      </div>

      <!-- Frais de livraison -->
      <div v-if="visibleSections.deliveryFees" class="settings-card">
        <div class="settings-header">
          <div class="settings-title">
            <span class="title-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 3h15v13H1zM16 8h5l3 3v5h-8V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </span>
            Frais de Livraison
          </div>
          <p class="card-description">Définissez vos frais de livraison par zone</p>
        </div>
        <div class="settings-content">
          <div class="form-group">
            <label class="form-label">Ville / Commune de votre boutique</label>
            <div class="input-with-suffix">
              <select v-model="currentShopCity" class="financial-input" disabled>
                <option>{{ currentShopCity }}</option>
              </select>
              <span class="input-suffix">Défini lors de l'inscription</span>
            </div>
            <p class="helper-text">La ville est définie lors de la création de la boutique</p>
          </div>

          <div class="form-group">
            <div class="delivery-fees-header">
              <label class="form-label">Zones de livraison et tarifs</label>
              <button type="button" class="add-zone-btn" @click="showAddDeliveryZoneModal = true">
                <i class="fas fa-plus"></i>
                Ajouter une zone
              </button>
            </div>
            
            <div class="delivery-zones-list">
              <div v-if="deliveryFees.length === 0" class="empty-zones">
                <i class="fas fa-map-marked-alt"></i>
                <p>Aucune zone de livraison configurée</p>
                <button type="button" class="primary-btn-small" @click="showAddDeliveryZoneModal = true">
                  Ajouter votre première zone
                </button>
              </div>
              
              <div v-else class="zones-grid">
                <div v-for="fee in deliveryFees" :key="fee.id" class="zone-card">
                  <div class="zone-info">
                    <div class="zone-name">
                      <i class="fas fa-map-pin"></i>
                      {{ fee.toCommune }}
                    </div>
                    <div class="zone-fee">{{ fee.fee }} FCFA</div>
                  </div>
                  <button type="button" class="zone-delete" @click="removeDeliveryZone(fee.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paramètres Financiers -->
      <div v-if="visibleSections.financial" class="settings-card">
        <div class="settings-header">
          <div class="settings-title">
            <span class="title-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="12" cy="12" r="2" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
            </span>
            Paramètres Financiers
          </div>
          <p class="card-description">Gérez vos paramètres de paiement et tarifs</p>
        </div>
        <div class="settings-content">
          <div class="form-group">
            <label class="form-label">Montant minimum de commande</label>
            <div class="input-with-suffix">
              <input
                type="number"
                v-model.number="settings.financial.minOrderAmount"
                min="0"
                class="financial-input"
              />
              <span class="input-suffix">FCFA</span>
            </div>
            <p class="helper-text">Montant minimum requis pour accepter une commande</p>
          </div>

          <div class="form-group">
            <label class="form-label">Méthodes de paiement acceptées</label>
            <div class="payment-methods-grid">
              <div
                v-for="method in paymentMethods"
                :key="method.key"
                :class="['payment-method-item', { active: settings.financial.paymentMethods[method.key] }]"
                @click="togglePaymentMethod(method.key)"
              >
                <div class="payment-method-icon">
                  <img v-if="method.icon" :src="method.icon" :alt="method.label" class="payment-icon-img" />
                  <div v-else class="payment-icon-fallback">{{ method.fallbackIcon }}</div>
                </div>
                <span class="payment-method-label">{{ method.label }}</span>
                <div class="payment-method-check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="save-section">
        <button @click="saveSettings" class="save-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="save-icon">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Enregistrer tous les paramètres
        </button>
      </div>

      <!-- Modal pour ajouter une zone de livraison -->
      <div v-if="showAddDeliveryZoneModal" class="modal-overlay" @click="showAddDeliveryZoneModal = false">
        <div class="modern-modal" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Ajouter une zone de livraison</h3>
            <button class="modal-close" @click="showAddDeliveryZoneModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <div class="form-field">
              <label>Commune / Quartier de destination</label>
              <input v-model="newDeliveryZone.commune" placeholder="Ex: Cocody, Marcory, Yopougon..." />
            </div>
            <div class="form-field">
              <label>Frais de livraison (FCFA)</label>
              <input v-model.number="newDeliveryZone.fee" type="number" min="0" placeholder="Ex: 1000" />
            </div>
          </div>
          <div class="modal-actions">
            <button class="BtnGlobal2" @click="showAddDeliveryZoneModal = false">Annuler</button>
            <button class="BtnGlobal2" @click="addDeliveryZone">Ajouter</button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import DashboardLayout from '@/DashboardGeneral/Components/DashboardLayout.vue'
import { useAuth } from '@/DashboardGeneral/Components/useAuth'

// Types
type NotificationTypeKey = 'newOrders' | 'orderUpdates' | 'payments' | 'promotions' | 'reminders'
type NotificationChannelKey = 'email' | 'sms' | 'push'
type PaymentMethodKey = 'orange_money' | 'moov_money' | 'mtn_money' | 'wave' | 'cash' | 'bank_transfer'

interface DeliveryFee {
  id: string
  shopId: string
  fromCommune: string
  toCommune: string
  fee: number
  city: string
}

// Reactive data
const settings = ref({
  notifications: {
    types: {
      newOrders: true,
      orderUpdates: true,
      payments: true,
      promotions: false,
      reminders: true
    },
    channels: {
      email: true,
      sms: true,
      push: true
    },
    frequency: 'realtime'
  },
  availability: {
    autoAccept: false,
    pauseMode: false,
    maxOrdersPerDay: '10',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workHours: {
      weekdays: {
        start: '08:00',
        end: '18:00'
      },
      weekends: {
        start: '09:00',
        end: '16:00'
      }
    }
  },
  security: {
    twoFactorAuth: false,
    loginAlerts: true
  },
  financial: {
    minOrderAmount: 2000,
    paymentMethods: {
      orange_money: true,
      moov_money: true,
      mtn_money: true,
      wave: true,
      cash: true,
      bank_transfer: false
    }
  }
})

const customMaxOrders = ref('')
const showAddDeliveryZoneModal = ref(false)
const deliveryFees = ref<DeliveryFee[]>([])
const newDeliveryZone = ref({ commune: '', fee: 0 })

// Auth et permissions
const { isManager, activeShop } = useAuth()
const currentShopCity = computed(() => activeShop.value?.city || 'Abidjan')

// Sections visibles selon rôle
const visibleSections = computed(() => {
  if (isManager.value) {
    return {
      notifications: false,
      availability: false,
      security: false,
      financial: false,
      deliveryFees: true,
    }
  }
  
  return {
    notifications: true,
    availability: true,
    security: true,
    financial: true,
    deliveryFees: true,
  }
})

// Configuration data
const notificationTypes = [
  {
    key: 'newOrders' as NotificationTypeKey,
    label: 'Nouvelles commandes',
    description: 'Recevez une notification pour chaque nouvelle commande',
  },
  {
    key: 'orderUpdates' as NotificationTypeKey,
    label: 'Mises à jour des commandes',
    description: 'Notifications sur les changements de statut',
  },
  {
    key: 'payments' as NotificationTypeKey,
    label: 'Paiements',
    description: 'Alertes pour les paiements reçus',
  },
  {
    key: 'promotions' as NotificationTypeKey,
    label: 'Promotions et offres',
    description: 'Notifications sur les offres spéciales',
  },
  {
    key: 'reminders' as NotificationTypeKey,
    label: 'Rappels',
    description: 'Rappels pour les commandes en attente',
  },
]

const notificationChannels = [
  {
    key: 'email' as NotificationChannelKey,
    label: 'Notifications par email',
    description: 'Recevez les notifications par email',
  },
  {
    key: 'sms' as NotificationChannelKey,
    label: 'Notifications par SMS',
    description: 'Recevez les notifications par SMS',
  },
  {
    key: 'push' as NotificationChannelKey,
    label: 'Notifications push',
    description: 'Recevez les notifications sur votre appareil',
  },
]

const frequencyOptions = [
  { value: 'realtime', label: 'Temps réel' },
  { value: 'hourly', label: 'Horaire (toutes les heures)' },
  { value: 'daily', label: 'Journalier (une fois par jour)' },
  { value: 'weekly', label: 'Hebdomadaire (une fois par semaine)' },
]

const daysOfWeek = [
  { value: 'monday', label: 'Lundi' },
  { value: 'tuesday', label: 'Mardi' },
  { value: 'wednesday', label: 'Mercredi' },
  { value: 'thursday', label: 'Jeudi' },
  { value: 'friday', label: 'Vendredi' },
  { value: 'saturday', label: 'Samedi' },
  { value: 'sunday', label: 'Dimanche' },
]

const paymentMethods = [
  { 
    key: 'orange_money' as PaymentMethodKey, 
    label: 'Orange Money', 
    icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOGvevFkT-gPnGlgXcKPmSkOJWzNolIXXhWA&s',
    fallbackIcon: '🟠'
  },
  { 
    key: 'moov_money' as PaymentMethodKey, 
    label: 'Moov Money', 
    icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTO90yUKP5HlFWwUQp2iqCEDYMSns8aabJDwQ&s',
    fallbackIcon: '🔵'
  },
  { 
    key: 'mtn_money' as PaymentMethodKey, 
    label: 'MTN Money', 
    icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdG3TuXmWFO5c9IYS5R77veFJQb7yt9gnaOw&s',
    fallbackIcon: '🟡'
  },
  { 
    key: 'wave' as PaymentMethodKey, 
    label: 'Wave', 
    icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyG7P_ElGLq8IRKmG8cFSWBMkAeSZFxafnyg&s',
    fallbackIcon: '🌊'
  },
  { 
    key: 'cash' as PaymentMethodKey, 
    label: 'Espèces', 
    icon: null,
    fallbackIcon: '💵'
  },
  { 
    key: 'bank_transfer' as PaymentMethodKey, 
    label: 'Virement bancaire', 
    icon: null,
    fallbackIcon: '🏦'
  },
]

const maxOrderOptions = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '20', label: '20' },
  { value: 'unlimited', label: 'Illimité' },
]

// Computed
const leftColumnDays = computed(() => daysOfWeek.slice(0, 4))
const rightColumnDays = computed(() => daysOfWeek.slice(4))

// Methods
const updateNotificationType = (key: NotificationTypeKey, value: boolean) => {
  settings.value.notifications.types[key] = value
}

const updateNotificationChannel = (key: NotificationChannelKey, value: boolean) => {
  settings.value.notifications.channels[key] = value
}

const updateAvailability = (key: 'autoAccept' | 'pauseMode', value: boolean) => {
  settings.value.availability[key] = value
}

const updateSecurity = (key: 'twoFactorAuth' | 'loginAlerts', value: boolean) => {
  settings.value.security[key] = value
}

const toggleWorkingDay = (day: string) => {
  const index = settings.value.availability.workingDays.indexOf(day)
  if (index > -1) {
    settings.value.availability.workingDays.splice(index, 1)
  } else {
    settings.value.availability.workingDays.push(day)
  }
}

const togglePaymentMethod = (method: PaymentMethodKey) => {
  settings.value.financial.paymentMethods[method] = !settings.value.financial.paymentMethods[method]
}

const updateMaxOrders = (value: string) => {
  settings.value.availability.maxOrdersPerDay = value
  if (value !== 'unlimited') {
    customMaxOrders.value = value
  } else {
    customMaxOrders.value = ''
  }
}

const updateCustomMaxOrders = () => {
  if (customMaxOrders.value && parseInt(customMaxOrders.value) > 0) {
    settings.value.availability.maxOrdersPerDay = customMaxOrders.value
  }
}

const addDeliveryZone = () => {
  if (newDeliveryZone.value.commune.trim() && newDeliveryZone.value.fee > 0) {
    deliveryFees.value.push({
      id: Date.now().toString(),
      shopId: activeShop.value?.id || 'shop_1',
      fromCommune: currentShopCity.value,
      toCommune: newDeliveryZone.value.commune.trim(),
      fee: newDeliveryZone.value.fee,
      city: currentShopCity.value,
    })
    newDeliveryZone.value = { commune: '', fee: 0 }
    showAddDeliveryZoneModal.value = false
  }
}

const removeDeliveryZone = (id: string) => {
  deliveryFees.value = deliveryFees.value.filter(f => f.id !== id)
}

const saveSettings = async () => {
  try {
    // Validation des données
    if (settings.value.financial.minOrderAmount < 0) {
      alert('Le montant minimum de commande ne peut pas être négatif')
      return
    }

    // Sauvegarde des paramètres
    console.log('Paramètres enregistrés avec succès!', settings.value)
    console.log('Frais de livraison:', deliveryFees.value)
    
    // Simulation d'une sauvegarde API
    // await api.saveSettings(settings.value)
    
    alert('Paramètres enregistrés avec succès!')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    alert('Erreur lors de la sauvegarde des paramètres')
  }
}

// Watchers
watch(() => settings.value.availability.maxOrdersPerDay, (newValue) => {
  if (!maxOrderOptions.some(option => option.value === newValue) && newValue !== 'unlimited') {
    customMaxOrders.value = newValue
  } else {
    customMaxOrders.value = ''
  }
})

// Lifecycle
onMounted(() => {
  // Charger les données existantes
  // deliveryFees.value = await api.getDeliveryFees()
})
</script>

<style scoped src="@/DashboardGeneral/Assets/Styles/Parametres.css"></style>