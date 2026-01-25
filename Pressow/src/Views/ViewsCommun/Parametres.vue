<template>
  <DashboardLayout>
    <div class="settings-page">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Paramètres</h1>
        <p class="page-description">Personnalisez votre expérience sur la plateforme</p>
      </div>

      <!-- Section Notifications -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            Notifications
          </div>
          <p class="card-description">Gérez vos paramètres de notification</p>
        </div>
        <div class="card-content">
          <!-- Types de notifications -->
          <div class="settings-section">
            <h4 class="section-title">Types de notifications</h4>
            <div v-for="item in notificationTypes" :key="item.key" class="setting-item">
              <div class="setting-info">
                <span class="setting-label">{{ item.label }}</span>
                <span class="setting-description">{{ item.description }}</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.types[item.key]" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Canaux -->
          <div class="settings-section">
            <h4 class="section-title">Canaux de notification</h4>
            <div v-for="channel in notificationChannels" :key="channel.key" class="setting-item">
              <div class="setting-info">
                <span class="setting-label">{{ channel.label }}</span>
                <span class="setting-description">{{ channel.description }}</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.channels[channel.key]" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Disponibilité -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Disponibilité
          </div>
          <p class="card-description">Gérez votre disponibilité et vos capacités</p>
        </div>
        <div class="card-content">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Acceptation automatique</span>
              <span class="setting-description">Accepter automatiquement les commandes sans validation</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.availability.autoAccept" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Mode pause</span>
              <span class="setting-description">Mettre temporairement votre compte en pause</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.availability.pauseMode" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Commandes max par jour -->
          <div class="form-group">
            <label class="form-label">Nombre maximum de commandes par jour</label>
            <div class="max-orders-grid">
              <button 
                v-for="option in maxOrderOptions" 
                :key="option.value"
                type="button"
                :class="['option-btn', { active: settings.availability.maxOrdersPerDay === option.value }]"
                @click="settings.availability.maxOrdersPerDay = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- Horaires -->
          <div class="form-group">
            <label class="form-label">Horaires d'ouverture - Jours ouvrables</label>
            <div class="time-range">
              <div class="time-input-group">
                <span class="time-label">Début</span>
                <input type="time" v-model="settings.availability.workHours.weekdays.start" class="time-input" />
              </div>
              <span class="time-separator">à</span>
              <div class="time-input-group">
                <span class="time-label">Fin</span>
                <input type="time" v-model="settings.availability.workHours.weekdays.end" class="time-input" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Horaires d'ouverture - Weekends</label>
            <div class="time-range">
              <div class="time-input-group">
                <span class="time-label">Début</span>
                <input type="time" v-model="settings.availability.workHours.weekends.start" class="time-input" />
              </div>
              <span class="time-separator">à</span>
              <div class="time-input-group">
                <span class="time-label">Fin</span>
                <input type="time" v-model="settings.availability.workHours.weekends.end" class="time-input" />
              </div>
            </div>
          </div>

          <!-- Jours de travail -->
          <div class="form-group">
            <label class="form-label">Jours de travail</label>
            <div class="days-grid">
              <button 
                v-for="day in daysOfWeek" 
                :key="day.value"
                type="button"
                :class="['day-btn', { active: settings.availability.workingDays.includes(day.value) }]"
                @click="toggleDay(day.value)"
              >
                {{ day.short }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Sécurité -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Sécurité
          </div>
          <p class="card-description">Protégez votre compte et vos données</p>
        </div>
        <div class="card-content">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Authentification à deux facteurs</span>
              <span class="setting-description">Sécurisez votre compte avec une double vérification</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.security.twoFactorAuth" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Alertes de connexion</span>
              <span class="setting-description">Être alerté en cas de nouvelle connexion</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="settings.security.loginAlerts" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="info-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <p>La modification du mot de passe se fait dans l'onglet <strong>Profil</strong>.</p>
          </div>
        </div>
      </div>

      <!-- Section Financier -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="6" width="20" height="12" rx="2"></rect>
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M6 12h.01M18 12h.01"></path>
            </svg>
            Paramètres Financiers
          </div>
          <p class="card-description">Gérez vos paramètres de paiement</p>
        </div>
        <div class="card-content">
          <div class="form-group">
            <label class="form-label">Montant minimum de commande</label>
            <div class="input-with-suffix">
              <input 
                type="number" 
                v-model.number="settings.financial.minOrderAmount" 
                min="0" 
                class="form-input"
                placeholder="500"
              />
              <span class="input-suffix">FCFA</span>
            </div>
            <span class="form-hint">Montant minimum requis pour accepter une commande</span>
          </div>
        </div>
      </div>

      <!-- Bouton Enregistrer -->
      <div class="save-section">
        <button @click="saveSettings" class="btn-save" :disabled="isSaving">
          <svg v-if="!isSaving" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          <span v-if="isSaving" class="spinner"></span>
          {{ isSaving ? 'Enregistrement...' : 'Enregistrer tous les paramètres' }}
        </button>
      </div>

      <!-- Toast -->
      <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
        {{ toast.message }}
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import DashboardLayout from '@/Components/ComponentsCommun/DashboardLayout.vue'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type NotificationTypeKey = 'newOrders' | 'orderUpdates' | 'payments' | 'reminders'
type NotificationChannelKey = 'email' | 'sms' | 'push'

// ═══════════════════════════════════════════════════════════════════════════════
// ÉTATS
// ═══════════════════════════════════════════════════════════════════════════════

const isSaving = ref(false)

const toast = reactive({
  show: false,
  type: 'success' as 'success' | 'error',
  message: ''
})

const settings = reactive({
  notifications: {
    types: {
      newOrders: true,
      orderUpdates: true,
      payments: true,
      reminders: true
    } as Record<NotificationTypeKey, boolean>,
    channels: {
      email: true,
      sms: true,
      push: true
    } as Record<NotificationChannelKey, boolean>
  },
  availability: {
    autoAccept: false,
    pauseMode: false,
    maxOrdersPerDay: '10',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workHours: {
      weekdays: { start: '08:00', end: '18:00' },
      weekends: { start: '09:00', end: '16:00' }
    }
  },
  security: {
    twoFactorAuth: false,
    loginAlerts: true
  },
  financial: {
    minOrderAmount: 500
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const notificationTypes = [
  { key: 'newOrders' as NotificationTypeKey, label: 'Nouvelles commandes', description: 'Notification pour chaque nouvelle commande' },
  { key: 'orderUpdates' as NotificationTypeKey, label: 'Mises à jour commandes', description: 'Changements de statut des commandes' },
  { key: 'payments' as NotificationTypeKey, label: 'Paiements', description: 'Alertes pour les paiements reçus' },
  { key: 'reminders' as NotificationTypeKey, label: 'Rappels', description: 'Rappels pour commandes en attente' }
]

const notificationChannels = [
  { key: 'email' as NotificationChannelKey, label: 'Email', description: 'Notifications par email' },
  { key: 'sms' as NotificationChannelKey, label: 'SMS', description: 'Notifications par SMS' },
  { key: 'push' as NotificationChannelKey, label: 'Push', description: 'Notifications sur votre appareil' }
]

const maxOrderOptions = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: 'unlimited', label: 'Illimité' }
]

const daysOfWeek = [
  { value: 'monday', short: 'Lun' },
  { value: 'tuesday', short: 'Mar' },
  { value: 'wednesday', short: 'Mer' },
  { value: 'thursday', short: 'Jeu' },
  { value: 'friday', short: 'Ven' },
  { value: 'saturday', short: 'Sam' },
  { value: 'sunday', short: 'Dim' }
]

// ═══════════════════════════════════════════════════════════════════════════════
// MÉTHODES
// ═══════════════════════════════════════════════════════════════════════════════

const toggleDay = (day: string) => {
  const idx = settings.availability.workingDays.indexOf(day)
  if (idx > -1) {
    settings.availability.workingDays.splice(idx, 1)
  } else {
    settings.availability.workingDays.push(day)
  }
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

const saveSettings = async () => {
  isSaving.value = true
  
  try {
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Sauvegarder en localStorage pour persistance locale
    localStorage.setItem('presso_settings', JSON.stringify(settings))
    
    showToast('Paramètres enregistrés avec succès', 'success')
  } catch (error) {
    showToast('Erreur lors de la sauvegarde', 'error')
  } finally {
    isSaving.value = false
  }
}

const loadSettings = () => {
  const saved = localStorage.getItem('presso_settings')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      Object.assign(settings, parsed)
    } catch (e) {
      console.error('Erreur chargement paramètres:', e)
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════════

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════════
   CHARTE GRAPHIQUE PRESSOW - Settings Page
   ═══════════════════════════════════════════════════════════════════════════════ */

.settings-page {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* Settings Card */
.settings-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.card-title svg {
  color: #2563eb;
}

.card-description {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.card-content {
  padding: 20px 24px;
}

/* Settings Section */
.settings-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.settings-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 16px 0;
}

/* Setting Item */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f8fafc;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.setting-description {
  font-size: 12px;
  color: #94a3b8;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 48px;
  height: 26px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: #e2e8f0;
  border-radius: 13px;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  left: 3px;
  top: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background: #2563eb;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(22px);
}

/* Form Groups */
.form-group {
  margin-top: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 10px;
}

.form-hint {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 6px;
}

/* Input with Suffix */
.input-with-suffix {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  max-width: 200px;
}

.form-input {
  flex: 1;
  padding: 10px 12px;
  border: none;
  font-size: 14px;
  color: #1e293b;
  outline: none;
}

.input-suffix {
  padding: 10px 12px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  border-left: 1px solid #e2e8f0;
}

/* Max Orders Grid */
.max-orders-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.option-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.option-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

/* Time Range */
.time-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
}

.time-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  width: 120px;
}

.time-input:focus {
  outline: none;
  border-color: #2563eb;
}

.time-separator {
  color: #94a3b8;
  font-weight: 500;
  margin-top: 20px;
}

/* Days Grid */
.days-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.day-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.day-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.day-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

/* Info Box */
.info-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: #f0f9ff;
  border-radius: 8px;
  margin-top: 16px;
}

.info-box svg {
  color: #2563eb;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-box p {
  font-size: 13px;
  color: #1e40af;
  margin: 0;
  line-height: 1.5;
}

/* Save Section */
.save-section {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save:hover:not(:disabled) {
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

.toast-success {
  background: #10b981;
}

.toast-error {
  background: #ef4444;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .settings-page {
    padding: 16px;
  }

  .time-range {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .time-separator {
    display: none;
  }

  .save-section {
    justify-content: stretch;
  }

  .btn-save {
    width: 100%;
    justify-content: center;
  }
}
</style>
