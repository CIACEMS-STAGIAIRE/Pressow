<template>
  <div class="reset-password-page">
    <!-- Header avec logo -->
    <header class="reset-header">
      <router-link to="/" class="logo-link">
        <img src="/logo_v2_r.png" alt="Pressow" class="logo" />
      </router-link>
    </header>

    <!-- Contenu principal -->
    <main class="reset-main">
      <div class="reset-container">
        <!-- Étape 1: Demande de réinitialisation -->
        <div v-if="currentStep === 'request'" class="step-content">
          <div class="step-header">
            <div class="step-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h1 class="step-title">Mot de passe oublié ?</h1>
            <p class="step-description">
              Entrez votre numéro de téléphone ou votre adresse email pour recevoir un code de réinitialisation.
            </p>
          </div>

          <form @submit.prevent="handleRequestReset" class="reset-form">
            <!-- Sélection de la méthode -->
            <div class="method-selector">
              <button 
                type="button" 
                :class="['method-btn', { active: selectedMethod === 'sms' }]"
                @click="selectedMethod = 'sms'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Par SMS
              </button>
              <button 
                type="button" 
                :class="['method-btn', { active: selectedMethod === 'email' }]"
                @click="selectedMethod = 'email'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Par Email
              </button>
            </div>

            <!-- Champ téléphone -->
            <div v-if="selectedMethod === 'sms'" class="form-field">
              <label for="phone">Numéro de téléphone</label>
              <div class="phone-input-group">
                <span class="phone-prefix">+225</span>
                <input 
                  id="phone" 
                  type="tel" 
                  v-model="identifier" 
                  placeholder="07 XX XX XX XX"
                  required
                  pattern="[0-9]{8,10}"
                  maxlength="10"
                  autocomplete="tel"
                />
              </div>
            </div>

            <!-- Champ email -->
            <div v-else class="form-field">
              <label for="email">Adresse email</label>
              <input 
                id="email" 
                type="email" 
                v-model="identifier" 
                placeholder="exemple@email.com"
                required
                autocomplete="email"
              />
            </div>

            <button type="submit" class="btn-primary" :disabled="isLoading || !identifier">
              <span v-if="isLoading" class="spinner"></span>
              {{ isLoading ? 'Envoi en cours...' : 'Recevoir le code' }}
            </button>
          </form>

          <div class="back-link">
            <router-link to="/Connexion">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Retour à la connexion
            </router-link>
          </div>
        </div>

        <!-- Étape 2: Vérification du code -->
        <div v-if="currentStep === 'verify'" class="step-content">
          <div class="step-header">
            <div class="step-icon step-icon-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1 class="step-title">Vérification</h1>
            <p class="step-description">
              Un code de vérification a été envoyé {{ selectedMethod === 'email' ? 'à' : 'au' }} 
              <strong>{{ maskedIdentifier }}</strong>
            </p>
          </div>

          <form @submit.prevent="handleVerifyCode" class="reset-form">
            <div class="form-field">
              <label for="code">Code de vérification</label>
              <input 
                id="code" 
                type="text" 
                v-model="verificationCode" 
                placeholder="Entrez le code à 6 chiffres"
                required
                pattern="[0-9]{6}"
                maxlength="6"
                autocomplete="one-time-code"
                class="code-input"
              />
            </div>

            <div class="resend-section">
              <span v-if="countdown > 0" class="countdown">
                Renvoyer le code dans {{ countdown }}s
              </span>
              <button 
                v-else 
                type="button" 
                class="btn-link" 
                @click="handleResendCode" 
                :disabled="isLoading"
              >
                Renvoyer le code
              </button>
            </div>

            <button type="submit" class="btn-primary" :disabled="isLoading || verificationCode.length !== 6">
              <span v-if="isLoading" class="spinner"></span>
              {{ isLoading ? 'Vérification...' : 'Vérifier le code' }}
            </button>
          </form>

          <div class="back-link">
            <button type="button" class="btn-text" @click="goBackToRequest">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Utiliser un autre identifiant
            </button>
          </div>
        </div>

        <!-- Étape 3: Nouveau mot de passe -->
        <div v-if="currentStep === 'finalize'" class="step-content">
          <div class="step-header">
            <div class="step-icon step-icon-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h1 class="step-title">Nouveau mot de passe</h1>
            <p class="step-description">
              Choisissez un mot de passe sécurisé pour protéger votre compte.
            </p>
          </div>

          <form @submit.prevent="handleFinalize" class="reset-form">
            <div class="form-field">
              <label for="newPassword">Nouveau mot de passe</label>
              <div class="password-input-wrapper">
                <input 
                  id="newPassword" 
                  :type="showNewPassword ? 'text' : 'password'" 
                  v-model="newPassword" 
                  placeholder="Minimum 8 caractères"
                  required
                  minlength="8"
                  autocomplete="new-password"
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
              <!-- Indicateur de force -->
              <div class="password-strength">
                <div class="strength-bar">
                  <div 
                    class="strength-fill" 
                    :class="passwordStrengthClass"
                    :style="{ width: `${passwordStrengthPercent}%` }"
                  ></div>
                </div>
                <span class="strength-text">{{ passwordStrengthText }}</span>
              </div>
            </div>

            <div class="form-field">
              <label for="confirmPassword">Confirmer le mot de passe</label>
              <div class="password-input-wrapper">
                <input 
                  id="confirmPassword" 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  v-model="confirmPassword" 
                  placeholder="Répétez le mot de passe"
                  required
                  minlength="8"
                  autocomplete="new-password"
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
              <span v-if="confirmPassword && newPassword !== confirmPassword" class="field-error">
                Les mots de passe ne correspondent pas
              </span>
            </div>

            <button 
              type="submit" 
              class="btn-primary" 
              :disabled="isLoading || !isPasswordValid"
            >
              <span v-if="isLoading" class="spinner"></span>
              {{ isLoading ? 'Mise à jour...' : 'Réinitialiser le mot de passe' }}
            </button>
          </form>
        </div>

        <!-- Étape 4: Succès -->
        <div v-if="currentStep === 'success'" class="step-content">
          <div class="step-header">
            <div class="step-icon step-icon-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1 class="step-title">Mot de passe réinitialisé !</h1>
            <p class="step-description">
              Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
          </div>

          <router-link to="/Connexion" class="btn-primary btn-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            Se connecter
          </router-link>
        </div>
      </div>
    </main>

    <!-- Toast notification -->
    <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

// Router
const router = useRouter()

// États
const currentStep = ref<'request' | 'verify' | 'finalize' | 'success'>('request')
const selectedMethod = ref<'sms' | 'email'>('sms')
const identifier = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const countdown = ref(0)
const resetToken = ref('')
const sessionToken = ref('')
const maskedIdentifier = ref('')

// Visibilité des mots de passe
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Timer pour le countdown
let countdownTimer: ReturnType<typeof setInterval> | null = null

// Toast
const toast = ref({
  show: false,
  type: 'success' as 'success' | 'error' | 'info',
  message: ''
})

// Computed
const passwordStrength = computed(() => {
  const pwd = newPassword.value
  if (!pwd) return 0
  let strength = 0
  if (pwd.length >= 8) strength += 1
  if (/[A-Z]/.test(pwd)) strength += 1
  if (/[a-z]/.test(pwd)) strength += 1
  if (/[0-9]/.test(pwd)) strength += 1
  if (/[^A-Za-z0-9]/.test(pwd)) strength += 1
  return strength
})

const passwordStrengthPercent = computed(() => (passwordStrength.value / 5) * 100)

const passwordStrengthClass = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'strength-weak'
  if (s <= 2) return 'strength-fair'
  if (s <= 3) return 'strength-good'
  return 'strength-strong'
})

const passwordStrengthText = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'Faible'
  if (s <= 2) return 'Moyen'
  if (s <= 3) return 'Bon'
  return 'Fort'
})

const isPasswordValid = computed(() => {
  return newPassword.value.length >= 8 &&
    newPassword.value === confirmPassword.value &&
    passwordStrength.value >= 3
})

// Méthodes
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 4000)
}

const startCountdown = (seconds: number) => {
  countdown.value = seconds
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

const handleRequestReset = async () => {
  if (!identifier.value) {
    showToast('Veuillez renseigner votre identifiant', 'error')
    return
  }

  isLoading.value = true
  try {
    const response = await api.post('/auth/password/reset/', {
      identifier: identifier.value,
      method: selectedMethod.value
    })

    if (response.data.reset_token) {
      resetToken.value = response.data.reset_token
      maskedIdentifier.value = response.data.masked_email || response.data.masked_phone || identifier.value
      currentStep.value = 'verify'
      startCountdown(60)
      showToast(response.data.detail || 'Code envoyé !', 'success')
    } else {
      // Compte non trouvé, mais on ne le dit pas directement (sécurité)
      showToast(response.data.detail || 'Si un compte existe, un code a été envoyé.', 'info')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail ||
                     error.response?.data?.identifier?.[0] ||
                     'Erreur lors de l\'envoi du code'
    showToast(errorMsg, 'error')
  } finally {
    isLoading.value = false
  }
}

const handleVerifyCode = async () => {
  if (verificationCode.value.length !== 6) {
    showToast('Veuillez entrer le code à 6 chiffres', 'error')
    return
  }

  isLoading.value = true
  try {
    const response = await api.post('/auth/password/reset/verify/', {
      reset_token: resetToken.value,
      code: verificationCode.value
    })

    sessionToken.value = response.data.reset_session_token
    currentStep.value = 'finalize'
    showToast('Code vérifié !', 'success')
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || 'Code incorrect ou expiré'
    showToast(errorMsg, 'error')
  } finally {
    isLoading.value = false
  }
}

const handleResendCode = async () => {
  if (countdown.value > 0) return

  isLoading.value = true
  try {
    const response = await api.post('/auth/password/reset/resend/', {
      reset_token: resetToken.value
    })

    if (response.data.reset_token) {
      resetToken.value = response.data.reset_token
    }
    startCountdown(60)
    showToast('Code renvoyé !', 'success')
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || 'Erreur lors du renvoi du code'
    showToast(errorMsg, 'error')
  } finally {
    isLoading.value = false
  }
}

const handleFinalize = async () => {
  if (!isPasswordValid.value) {
    showToast('Veuillez vérifier votre mot de passe', 'error')
    return
  }

  isLoading.value = true
  try {
    await api.post('/auth/password/reset/finalize/', {
      reset_session_token: sessionToken.value,
      new_password: newPassword.value,
      new_password_confirm: confirmPassword.value
    })

    currentStep.value = 'success'
    showToast('Mot de passe réinitialisé avec succès !', 'success')
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail ||
                     error.response?.data?.new_password?.[0] ||
                     'Erreur lors de la réinitialisation'
    showToast(errorMsg, 'error')
  } finally {
    isLoading.value = false
  }
}

const goBackToRequest = () => {
  currentStep.value = 'request'
  verificationCode.value = ''
  resetToken.value = ''
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════════
   CHARTE GRAPHIQUE PRESSOW - Page Réinitialisation Mot de Passe
   ═══════════════════════════════════════════════════════════════════════════════ */

.reset-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  flex-direction: column;
}

/* Header */
.reset-header {
  padding: 24px 32px;
  display: flex;
  justify-content: center;
}

.logo-link {
  display: block;
}

.logo {
  height: 40px;
  width: auto;
}

/* Main Content */
.reset-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.reset-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 440px;
  padding: 40px;
}

/* Step Content */
.step-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.step-header {
  text-align: center;
}

.step-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
}

.step-icon-success {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #16a34a;
}

.step-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.step-description {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.step-description strong {
  color: #1e293b;
}

/* Method Selector */
.method-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.method-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.method-btn:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.method-btn.active {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

/* Form */
.reset-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-field input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  color: #1e293b;
  background: white;
  transition: all 0.2s ease;
}

.form-field input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.form-field input::placeholder {
  color: #94a3b8;
}

/* Phone Input */
.phone-input-group {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.phone-input-group:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.phone-prefix {
  display: flex;
  align-items: center;
  padding: 0 14px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 500;
  border-right: 1px solid #e2e8f0;
}

.phone-input-group input {
  border: none;
  border-radius: 0;
  flex: 1;
}

.phone-input-group input:focus {
  box-shadow: none;
}

/* Code Input */
.code-input {
  text-align: center;
  font-size: 28px !important;
  font-weight: 700;
  letter-spacing: 12px;
  padding: 18px !important;
}

/* Password Input */
.password-input-wrapper {
  position: relative;
}

.password-input-wrapper input {
  padding-right: 50px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #94a3b8;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  color: #2563eb;
  background: #f1f5f9;
}

/* Password Strength */
.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.strength-weak { background: #ef4444; }
.strength-fair { background: #f59e0b; }
.strength-good { background: #10b981; }
.strength-strong { background: #22c55e; }

.strength-text {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  min-width: 50px;
}

.field-error {
  font-size: 13px;
  color: #ef4444;
}

/* Resend Section */
.resend-section {
  text-align: center;
  padding: 8px 0;
}

.countdown {
  font-size: 14px;
  color: #94a3b8;
}

.btn-link {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
}

.btn-link:hover:not(:disabled) {
  color: #1d4ed8;
}

.btn-link:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

/* Buttons */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-success {
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
}

.btn-success:hover:not(:disabled) {
  box-shadow: 0 8px 20px rgba(22, 163, 74, 0.35);
}

.btn-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.btn-text:hover {
  color: #2563eb;
}

/* Back Link */
.back-link {
  text-align: center;
}

.back-link a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s ease;
}

.back-link a:hover {
  color: #2563eb;
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
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
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

.toast-success { background: #10b981; }
.toast-error { background: #ef4444; }
.toast-info { background: #2563eb; }

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
@media (max-width: 480px) {
  .reset-container {
    padding: 32px 24px;
    border-radius: 0;
    box-shadow: none;
    max-width: 100%;
  }

  .method-selector {
    flex-direction: column;
  }

  .step-title {
    font-size: 22px;
  }

  .code-input {
    font-size: 24px !important;
    letter-spacing: 8px;
  }
}
</style>
