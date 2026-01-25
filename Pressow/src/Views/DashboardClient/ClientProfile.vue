<template>
  <div class="profile-page">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>
      <h1>Mon profil</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- Profile Content -->
    <div class="profile-content">
      <!-- Avatar Section -->
      <div class="avatar-section">
        <div class="avatar">
          <span class="avatar-text">{{ userInitials }}</span>
        </div>
        <div class="user-primary-info">
          <h2>{{ fullName }}</h2>
          <p class="user-role">Client</p>
        </div>
      </div>

      <!-- Profile Form -->
      <form @submit.prevent="saveProfile" class="profile-form">
        <div class="form-section">
          <h3>Informations personnelles</h3>
          
          <div class="form-group">
            <label for="first_name">Prénom</label>
            <input
              type="text"
              id="first_name"
              v-model="form.first_name"
              placeholder="Votre prénom"
              :class="{ error: errors.first_name }"
            />
            <span v-if="errors.first_name" class="error-text">{{ errors.first_name }}</span>
          </div>

          <div class="form-group">
            <label for="last_name">Nom</label>
            <input
              type="text"
              id="last_name"
              v-model="form.last_name"
              placeholder="Votre nom"
              :class="{ error: errors.last_name }"
            />
            <span v-if="errors.last_name" class="error-text">{{ errors.last_name }}</span>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              placeholder="votre@email.com"
              :class="{ error: errors.email }"
            />
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>
        </div>

        <div class="form-section">
          <h3>Contact</h3>
          
          <div class="form-group">
            <label for="phone">Numéro de téléphone</label>
            <div class="phone-input-group">
              <span class="phone-prefix">+225</span>
              <input
                type="tel"
                id="phone"
                v-model="form.phone"
                placeholder="07 00 00 00 00"
                disabled
              />
            </div>
            <span class="field-hint">Le numéro de téléphone ne peut pas être modifié</span>
          </div>
        </div>

        <div class="form-section">
          <h3>Adresse par défaut</h3>
          
          <div class="form-group">
            <label for="address">Adresse complète</label>
            <textarea
              id="address"
              v-model="form.address"
              placeholder="Ex: Cocody Riviera 2, Rue des Jardins, Immeuble Soleil"
              rows="3"
            ></textarea>
            <span class="field-hint">Cette adresse sera pré-remplie lors de vos commandes</span>
          </div>
        </div>

        <!-- Save Button -->
        <button type="submit" class="save-btn" :disabled="isSaving">
          <span v-if="!isSaving">Enregistrer les modifications</span>
          <span v-else class="saving">
            <span class="spinner-small"></span>
            Enregistrement...
          </span>
        </button>
      </form>

      <!-- Additional Sections -->
      <div class="additional-sections">
        <!-- Change Password -->
        <div class="section-card">
          <div class="section-header" @click="togglePasswordSection">
            <div class="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div class="section-info">
              <h4>Changer le mot de passe</h4>
              <p>Sécurisez votre compte</p>
            </div>
            <svg class="chevron" :class="{ rotated: showPasswordSection }" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
          
          <div v-if="showPasswordSection" class="section-content">
            <div class="form-group">
              <label for="current_password">Mot de passe actuel</label>
              <div class="password-input-wrapper">
                <input
                  :type="showCurrentPassword ? 'text' : 'password'"
                  id="current_password"
                  v-model="passwordForm.current"
                  placeholder="••••••••"
                />
                <button type="button" class="password-toggle" @click="showCurrentPassword = !showCurrentPassword">
                  <svg v-if="!showCurrentPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label for="new_password">Nouveau mot de passe</label>
              <div class="password-input-wrapper">
                <input
                  :type="showNewPassword ? 'text' : 'password'"
                  id="new_password"
                  v-model="passwordForm.new_password"
                  placeholder="••••••••"
                />
                <button type="button" class="password-toggle" @click="showNewPassword = !showNewPassword">
                  <svg v-if="!showNewPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label for="confirm_password">Confirmer le mot de passe</label>
              <div class="password-input-wrapper">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirm_password"
                  v-model="passwordForm.confirm"
                  placeholder="••••••••"
                />
                <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                  <svg v-if="!showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>
            <button type="button" class="change-password-btn" @click="changePassword" :disabled="isChangingPassword">
              <span v-if="!isChangingPassword">Changer le mot de passe</span>
              <span v-else class="saving">
                <span class="spinner-small"></span>
                Modification...
              </span>
            </button>
          </div>
        </div>

        <!-- Statistics -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon orders">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.totalOrders }}</span>
              <span class="stat-label">Commandes</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon pending">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.pendingOrders }}</span>
              <span class="stat-label">En cours</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon completed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.completedOrders }}</span>
              <span class="stat-label">Livrées</span>
            </div>
          </div>
        </div>

        <!-- Logout Section -->
        <button class="logout-btn" @click="showLogoutConfirm = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16,17 21,12 16,7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Se déconnecter
        </button>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutConfirm" class="modal-overlay" @click.self="showLogoutConfirm = false">
      <div class="confirm-modal">
        <div class="confirm-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F9A13B" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16,17 21,12 16,7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>
        <h3>Se déconnecter ?</h3>
        <p>Vous devrez vous reconnecter pour accéder à votre compte.</p>
        <div class="confirm-actions">
          <button class="cancel-btn" @click="showLogoutConfirm = false">Annuler</button>
          <button class="confirm-btn" @click="handleLogout">Se déconnecter</button>
        </div>
      </div>
    </div>

    <!-- Toast notification -->
    <Transition name="toast">
      <div v-if="showToast" class="toast" :class="toastType">
        <svg v-if="toastType === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/client'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const clientStore = useClientStore()

// Form state
const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
})

const errors = reactive({
  first_name: '',
  last_name: '',
  email: '',
})

const passwordForm = reactive({
  current: '',
  new_password: '',
  confirm: '',
})

// UI state
const isSaving = ref(false)
const isChangingPassword = ref(false)
const showPasswordSection = ref(false)
const showLogoutConfirm = ref(false)

// Password visibility toggles
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Computed
const userInitials = computed(() => {
  const first = form.first_name?.charAt(0) || ''
  const last = form.last_name?.charAt(0) || ''
  return (first + last).toUpperCase() || 'U'
})

const fullName = computed(() => {
  if (form.first_name && form.last_name) {
    return `${form.first_name} ${form.last_name}`
  }
  return form.first_name || form.last_name || 'Utilisateur'
})

const stats = computed(() => {
  return {
    totalOrders: clientStore.clientOrders.length,
    pendingOrders: clientStore.pendingOrders.length,
    completedOrders: clientStore.completedOrders.length,
  }
})

// Methods
function goBack() {
  router.back()
}

function loadUserData() {
  const user = authStore.user
  if (user) {
    form.first_name = user.first_name || ''
    form.last_name = user.last_name || ''
    form.email = user.email || ''
    form.phone = formatPhoneForDisplay(user.phone || '')
    // L'adresse est stockée localement (pas dans le modèle User)
    form.address = localStorage.getItem('presso_default_address') || ''
  }
}

function formatPhoneForDisplay(phone: string): string {
  // Remove +225 prefix if present
  let cleaned = phone.replace(/^\+225/, '').replace(/\D/g, '')
  // Format: XX XX XX XX XX
  return cleaned.match(/.{1,2}/g)?.join(' ') || cleaned
}

function validateForm(): boolean {
  // Reset errors
  errors.first_name = ''
  errors.last_name = ''
  errors.email = ''
  
  let isValid = true
  
  if (!form.first_name.trim()) {
    errors.first_name = 'Le prénom est requis'
    isValid = false
  }
  
  if (!form.last_name.trim()) {
    errors.last_name = 'Le nom est requis'
    isValid = false
  }
  
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Adresse email invalide'
    isValid = false
  }
  
  return isValid
}

async function saveProfile() {
  if (!validateForm()) return
  
  isSaving.value = true
  
  try {
    const response = await api.patch('/auth/profile/', {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim() || null,
    })
    
    // Update local auth store
    if (authStore.user) {
      authStore.user.first_name = form.first_name.trim()
      authStore.user.last_name = form.last_name.trim()
      authStore.user.email = form.email.trim()
    }
    
    // Save address to localStorage
    if (form.address.trim()) {
      localStorage.setItem('presso_default_address', form.address.trim())
    }
    
    showToastMessage('Profil mis à jour avec succès', 'success')
  } catch (err: any) {
    console.error('Save profile error:', err)
    const errorMessage = err.response?.data?.detail || 'Erreur lors de la mise à jour'
    showToastMessage(errorMessage, 'error')
  } finally {
    isSaving.value = false
  }
}

function togglePasswordSection() {
  showPasswordSection.value = !showPasswordSection.value
  if (!showPasswordSection.value) {
    passwordForm.current = ''
    passwordForm.new_password = ''
    passwordForm.confirm = ''
  }
}

async function changePassword() {
  if (!passwordForm.current || !passwordForm.new_password || !passwordForm.confirm) {
    showToastMessage('Veuillez remplir tous les champs', 'error')
    return
  }
  
  if (passwordForm.new_password !== passwordForm.confirm) {
    showToastMessage('Les mots de passe ne correspondent pas', 'error')
    return
  }
  
  if (passwordForm.new_password.length < 6) {
    showToastMessage('Le mot de passe doit contenir au moins 6 caractères', 'error')
    return
  }
  
  isChangingPassword.value = true
  
  try {
    await api.post('/auth/change-password/', {
      current_password: passwordForm.current,
      new_password: passwordForm.new_password,
    })
    
    showToastMessage('Mot de passe modifié avec succès', 'success')
    
    // Reset form and close section
    passwordForm.current = ''
    passwordForm.new_password = ''
    passwordForm.confirm = ''
    showPasswordSection.value = false
  } catch (err: any) {
    console.error('Change password error:', err)
    const errorMessage = err.response?.data?.detail || 'Erreur lors du changement de mot de passe'
    showToastMessage(errorMessage, 'error')
  } finally {
    isChangingPassword.value = false
  }
}

async function handleLogout() {
  showLogoutConfirm.value = false
  
  try {
    await authStore.logout()
  } catch (error) {
    console.error('Logout error:', error)
    authStore.clearSession()
  }
  
  router.push('/connexion')
}

function showToastMessage(message: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Lifecycle
onMounted(() => {
  loadUserData()
  clientStore.fetchClientOrders()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 40px;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 64px;
  z-index: 50;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 10px;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #e5e7eb;
}

.page-header h1 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

/* Profile Content */
.profile-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

/* Avatar Section */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  background: white;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #37A1EF, #2b8dd4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.avatar-text {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
}

.user-primary-info {
  text-align: center;
}

.user-primary-info h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.user-role {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Profile Form */
.profile-form {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 24px;
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.form-section h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 16px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.938rem;
  color: #1f2937;
  background: #f8fafc;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #37A1EF;
  background: white;
  box-shadow: 0 0 0 3px rgba(55, 161, 239, 0.1);
}

.form-group input:disabled {
  background: #e5e7eb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-group input.error {
  border-color: #ef4444;
}

.error-text {
  display: block;
  font-size: 0.813rem;
  color: #ef4444;
  margin-top: 6px;
}

.field-hint {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 6px;
}

/* Password Input Wrapper */
.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  padding-right: 50px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.password-toggle:hover {
  background: #f3f4f6;
  color: #37A1EF;
}

.phone-input-group {
  display: flex;
  align-items: center;
  gap: 0;
}

.phone-prefix {
  padding: 14px 14px;
  background: #e5e7eb;
  border: 1px solid #e5e7eb;
  border-right: none;
  border-radius: 12px 0 0 12px;
  font-size: 0.938rem;
  color: #6b7280;
}

.phone-input-group input {
  border-radius: 0 12px 12px 0;
}

.save-btn {
  width: 100%;
  padding: 16px;
  background: #37A1EF;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 24px;
}

.save-btn:hover:not(:disabled) {
  background: #2b8dd4;
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.saving {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner-small {
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

/* Additional Sections */
.additional-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.section-header:hover {
  background: #f8fafc;
}

.section-icon {
  width: 44px;
  height: 44px;
  background: rgba(55, 161, 239, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #37A1EF;
}

.section-info {
  flex: 1;
}

.section-info h4 {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 2px 0;
}

.section-info p {
  font-size: 0.813rem;
  color: #6b7280;
  margin: 0;
}

.chevron {
  color: #9ca3af;
  transition: transform 0.2s;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.section-content {
  padding: 0 16px 16px;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.change-password-btn {
  width: 100%;
  padding: 14px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 12px;
  font-size: 0.938rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}

.change-password-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.change-password-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 44px;
  height: 44px;
  margin: 0 auto 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.orders {
  background: rgba(55, 161, 239, 0.1);
  color: #37A1EF;
}

.stat-icon.pending {
  background: rgba(249, 161, 59, 0.1);
  color: #F9A13B;
}

.stat-icon.completed {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Logout Button */
.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #fecaca;
}

/* Confirm Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.confirm-modal {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.confirm-icon {
  width: 64px;
  height: 64px;
  background: rgba(249, 161, 59, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.confirm-modal h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.confirm-modal p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.confirm-btn {
  background: #F9A13B;
  color: white;
}

.confirm-btn:hover {
  background: #e89430;
}

/* Toast */
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: #1f2937;
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1100;
}

.toast.success {
  background: #10b981;
}

.toast.error {
  background: #ef4444;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    top: 64px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 400px) {
  .stat-card {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
}
</style>
