<template>
  <DashboardLayout>
    <div class="profile-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Mon Profil</h1>
            <p class="page-description">Gérez vos informations personnelles et professionnelles</p>
          </div>
        </div>
      </div>

      <!-- Navigation par onglets -->
      <div class="tabs-navigation">
        <div class="tabs-container">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-button', { 'active': activeTab === tab.id }]" 
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" class="tab-icon" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Contenu -->
      <div class="tab-content">
        <!-- Onglet Informations personnelles -->
        <div v-if="activeTab === 'personal'" class="tab-panel">
          <div class="profile-grid">
            <!-- Carte profil -->
            <div class="profile-card">
              <div class="profile-avatar-section">
                <div class="avatar-container">
                  <div class="avatar-large" :class="{ 'has-image': displayPhoto }">
                    <img v-if="displayPhoto" :src="displayPhoto" alt="Photo" class="avatar-img" />
                    <span v-else class="avatar-initial">{{ userInitials }}</span>
                  </div>
                  <button type="button" class="avatar-edit-btn" @click="triggerPhotoUpload" title="Changer la photo" :disabled="isSubmitting">
                    <svg v-if="!isSubmitting" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <span v-else class="spinner-small"></span>
                  </button>
                  <input type="file" ref="photoInput" @change="handlePhotoUpload" accept="image/jpeg,image/png,image/gif,image/webp" class="hidden-input" />
                </div>
                <div class="profile-info">
                  <h2 class="user-name">{{ fullName }}</h2>
                  <p class="user-phone">{{ userPhone }}</p>
                  <div class="profile-badges">
                    <span v-if="isVerified" class="badge badge-success">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Vérifié
                    </span>
                    <span v-else class="badge badge-warning">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      Non vérifié
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Formulaire informations personnelles -->
            <div class="form-card">
              <div class="card-header">
                <h3 class="card-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Informations personnelles
                </h3>
              </div>
              <div class="card-content">
                <form @submit.prevent="handleUpdateProfile" class="profile-form">
                  <div class="form-row">
                    <div class="form-field">
                      <label for="firstName">Prénom</label>
                      <input id="firstName" v-model="profileForm.first_name" placeholder="Votre prénom" required />
                    </div>
                    <div class="form-field">
                      <label for="lastName">Nom de famille</label>
                      <input id="lastName" v-model="profileForm.last_name" placeholder="Votre nom" required />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label for="email">Adresse email</label>
                      <input id="email" type="email" v-model="profileForm.email" placeholder="exemple@email.com" />
                    </div>
                    <div class="form-field">
                      <label for="phone">Numéro de téléphone</label>
                      <div class="input-with-action">
                        <input id="phone" type="tel" v-model="profileForm.phone" disabled class="input-disabled" />
                        <button type="button" class="btn-change-phone" @click="openPhoneChangeModal" :disabled="isSubmitting">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          Modifier
                        </button>
                      </div>
                      <span class="field-hint">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        Le changement de numéro nécessite une vérification OTP sur le nouveau numéro
                      </span>
                    </div>
                  </div>

                  <div class="form-actions">
                    <button type="button" class="btn-secondary" @click="resetPersonalForm" :disabled="isSubmitting">
                      Annuler
                    </button>
                    <button type="submit" class="btn-primary" :disabled="isSubmitting">
                      <svg v-if="!isSubmitting" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Entreprise -->
        <div v-if="activeTab === 'business'" class="tab-panel">
          <div class="business-grid">
            <!-- Section Images de l'entreprise -->
            <div class="form-card">
              <div class="card-header">
                <h3 class="card-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Images de l'entreprise
                </h3>
              </div>
              <div class="card-content">
                <div class="images-grid">
                  <!-- Logo -->
                  <div class="image-upload-card">
                    <label class="image-label">Logo de l'entreprise</label>
                    <div class="image-upload-zone" @click="triggerLogoUpload">
                      <div v-if="businessImages.logo" class="image-preview">
                        <img :src="businessImages.logo" alt="Logo" />
                        <button type="button" class="image-remove-btn" @click.stop="removeLogo" title="Supprimer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                      <div v-else class="image-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <span>Cliquez pour ajouter</span>
                        <span class="image-hint">PNG, JPG (max 2MB)</span>
                      </div>
                    </div>
                    <input type="file" ref="logoInput" @change="handleLogoUpload" accept="image/jpeg,image/png,image/webp" class="hidden-input" />
                  </div>

                  <!-- Photo du local -->
                  <div class="image-upload-card">
                    <label class="image-label">Photo de la devanture</label>
                    <div class="image-upload-zone" @click="triggerStorefrontUpload">
                      <div v-if="businessImages.storefront" class="image-preview">
                        <img :src="businessImages.storefront" alt="Devanture" />
                        <button type="button" class="image-remove-btn" @click.stop="removeStorefront" title="Supprimer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                      <div v-else class="image-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span>Cliquez pour ajouter</span>
                        <span class="image-hint">PNG, JPG (max 5MB)</span>
                      </div>
                    </div>
                    <input type="file" ref="storefrontInput" @change="handleStorefrontUpload" accept="image/jpeg,image/png,image/gif,image/webp" class="hidden-input" />
                  </div>
                </div>
                <p class="images-note">Ces images seront visibles par vos clients sur votre profil public.</p>
              </div>
            </div>

            <!-- Formulaire informations -->
            <div class="form-card">
              <div class="card-header">
                <h3 class="card-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Informations de l'entreprise
                </h3>
              </div>
              <div class="card-content">
                <form @submit.prevent="handleUpdateBusiness" class="profile-form">
                  <div class="form-row">
                    <div class="form-field">
                      <label for="businessName">Nom commercial</label>
                      <input id="businessName" v-model="businessForm.nom_commercial" placeholder="Nom de votre pressing" required />
                    </div>
                    <div class="form-field">
                      <label for="ville">Ville</label>
                      <input id="ville" v-model="businessForm.ville" disabled class="input-disabled" />
                      <span class="field-hint">La ville ne peut pas être modifiée</span>
                    </div>
                  </div>

                  <div class="form-field">
                    <label for="adresse">Adresse complète</label>
                    <textarea id="adresse" v-model="businessForm.adresse" rows="2" placeholder="Votre adresse complète"></textarea>
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label for="quartier">Quartier</label>
                      <input id="quartier" v-model="businessForm.quartier" placeholder="Votre quartier" />
                    </div>
                    <div class="form-field">
                      <label for="rayon">Rayon de couverture (km)</label>
                      <input id="rayon" type="number" v-model="businessForm.rayon_km" min="0.5" max="100" step="0.5" />
                    </div>
                  </div>

                  <div class="form-field">
                    <label for="zoneCouverture">Zones desservies</label>
                    <textarea id="zoneCouverture" v-model="businessForm.zone_couverture" rows="2" placeholder="Ex: Cocody, Plateau, Yopougon..."></textarea>
                    <span class="field-hint">Listez les quartiers et communes que vous desservez</span>
                  </div>

                  <div class="form-actions">
                    <button type="button" class="btn-secondary" @click="resetBusinessForm" :disabled="isSubmitting">
                      Annuler
                    </button>
                    <button type="submit" class="btn-primary" :disabled="isSubmitting">
                      {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Mot de passe -->
        <div v-if="activeTab === 'password'" class="tab-panel">
          <div class="form-card form-card-centered">
            <div class="card-header">
              <h3 class="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Changer le mot de passe
              </h3>
            </div>
            <div class="card-content">
              <form @submit.prevent="handleChangePassword" class="profile-form">
                <div class="form-field">
                  <label for="currentPassword">Mot de passe actuel</label>
                  <div class="password-input-wrapper">
                    <input 
                      id="currentPassword" 
                      :type="showCurrentPassword ? 'text' : 'password'"
                      v-model="passwordForm.current_password" 
                      placeholder="••••••••"
                      required 
                    />
                    <button type="button" class="password-toggle" @click="showCurrentPassword = !showCurrentPassword">
                      <svg v-if="showCurrentPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="form-field">
                  <label for="newPassword">Nouveau mot de passe</label>
                  <div class="password-input-wrapper">
                    <input 
                      id="newPassword" 
                      :type="showNewPassword ? 'text' : 'password'"
                      v-model="passwordForm.new_password" 
                      placeholder="••••••••"
                      minlength="8"
                      required 
                    />
                    <button type="button" class="password-toggle" @click="showNewPassword = !showNewPassword">
                      <svg v-if="showNewPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="form-field">
                  <label for="confirmPassword">Confirmer le mot de passe</label>
                  <div class="password-input-wrapper">
                    <input 
                      id="confirmPassword" 
                      :type="showConfirmPassword ? 'text' : 'password'"
                      v-model="passwordForm.confirm_password" 
                      placeholder="••••••••"
                      minlength="8"
                      required 
                    />
                    <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                      <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Indicateur de force du mot de passe -->
                <div class="password-strength" v-if="passwordForm.new_password">
                  <div class="strength-bar">
                    <div class="strength-fill" :class="passwordStrengthClass" :style="{ width: passwordStrengthPercent + '%' }"></div>
                  </div>
                  <span class="strength-text">{{ passwordStrengthText }}</span>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-secondary" @click="resetPasswordForm">
                    Annuler
                  </button>
                  <button type="submit" class="btn-primary" :disabled="!isPasswordValid || isSubmitting">
                    {{ isSubmitting ? 'Modification...' : 'Changer le mot de passe' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast notification -->
      <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
        <span>{{ toast.message }}</span>
      </div>

      <!-- Modal de changement de numéro de téléphone -->
      <div v-if="showPhoneChangeModal" class="modal-overlay" @click.self="closePhoneChangeModal">
        <div class="modal-content phone-change-modal">
          <div class="modal-header">
            <h3 class="modal-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Changer de numéro de téléphone
            </h3>
            <button type="button" class="modal-close" @click="closePhoneChangeModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Étape 1: Demande de changement -->
            <div v-if="phoneChangeStep === 'request'" class="phone-change-step">
              <div class="step-info">
                <div class="info-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <p>Pour des raisons de sécurité, vous devez confirmer votre identité avec votre mot de passe actuel, puis vérifier le nouveau numéro par SMS.</p>
              </div>

              <form @submit.prevent="requestPhoneChange" class="phone-change-form">
                <div class="form-field">
                  <label for="phoneChangePassword">Mot de passe actuel</label>
                  <input 
                    id="phoneChangePassword" 
                    type="password" 
                    v-model="phoneChangeForm.password" 
                    placeholder="Entrez votre mot de passe"
                    required
                    autocomplete="current-password"
                  />
                </div>

                <div class="form-field">
                  <label for="newPhoneNumber">Nouveau numéro de téléphone</label>
                  <div class="phone-input-group">
                    <span class="phone-prefix">+225</span>
                    <input 
                      id="newPhoneNumber" 
                      type="tel" 
                      v-model="phoneChangeForm.newPhone" 
                      placeholder="07 XX XX XX XX"
                      required
                      pattern="[0-9]{8,10}"
                      maxlength="10"
                    />
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-secondary" @click="closePhoneChangeModal" :disabled="phoneChangeLoading">
                    Annuler
                  </button>
                  <button type="submit" class="btn-primary" :disabled="phoneChangeLoading || !phoneChangeForm.password || !phoneChangeForm.newPhone">
                    <span v-if="phoneChangeLoading" class="spinner-small"></span>
                    {{ phoneChangeLoading ? 'Envoi...' : 'Recevoir le code' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Étape 2: Vérification OTP -->
            <div v-if="phoneChangeStep === 'verify'" class="phone-change-step">
              <div class="step-info step-info-success">
                <div class="info-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <p>Un code de vérification a été envoyé au <strong>+225 {{ phoneChangeForm.newPhone }}</strong>. Entrez-le ci-dessous.</p>
              </div>

              <form @submit.prevent="confirmPhoneChange" class="phone-change-form">
                <div class="form-field">
                  <label for="otpCode">Code de vérification</label>
                  <input 
                    id="otpCode" 
                    type="text" 
                    v-model="phoneChangeForm.otpCode" 
                    placeholder="Entrez le code à 6 chiffres"
                    required
                    pattern="[0-9]{6}"
                    maxlength="6"
                    autocomplete="one-time-code"
                    class="otp-input"
                  />
                </div>

                <div class="resend-section">
                  <span v-if="phoneChangeCountdown > 0" class="countdown">
                    Renvoyer le code dans {{ phoneChangeCountdown }}s
                  </span>
                  <button 
                    v-else 
                    type="button" 
                    class="btn-link" 
                    @click="resendPhoneChangeOTP" 
                    :disabled="phoneChangeLoading"
                  >
                    Renvoyer le code
                  </button>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-secondary" @click="phoneChangeStep = 'request'" :disabled="phoneChangeLoading">
                    Retour
                  </button>
                  <button type="submit" class="btn-primary" :disabled="phoneChangeLoading || phoneChangeForm.otpCode.length !== 6">
                    <span v-if="phoneChangeLoading" class="spinner-small"></span>
                    {{ phoneChangeLoading ? 'Vérification...' : 'Confirmer le changement' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import DashboardLayout from '@/Components/ComponentsCommun/DashboardLayout.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { getImageUrl } from '@/utils/media'

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════
interface ProviderData {
  id: string
  nom_commercial: string
  type: string
  type_display: string
  adresse: string
  ville: string
  quartier: string
  photo_local_url: string | null
  rayon_km: string
  zone_couverture: string
  is_active: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORES
// ═══════════════════════════════════════════════════════════════════════════════
const authStore = useAuthStore()

// ═══════════════════════════════════════════════════════════════════════════════
// ONGLETS
// ═══════════════════════════════════════════════════════════════════════════════
const activeTab = ref('personal')

// Icônes SVG en tant que composants fonctionnels
const UserIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: 12, cy: 7, r: 4 })
])

const BuildingIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
  h('polyline', { points: '9 22 9 12 15 12 15 22' })
])

const LockIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2 }),
  h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' })
])

const tabs = [
  { id: 'personal', label: 'Informations personnelles', icon: UserIcon },
  { id: 'business', label: 'Entreprise', icon: BuildingIcon },
  { id: 'password', label: 'Mot de passe', icon: LockIcon },
]

// ═══════════════════════════════════════════════════════════════════════════════
// ÉTATS
// ═══════════════════════════════════════════════════════════════════════════════
const isLoading = ref(false)
const isSubmitting = ref(false)
const userPhoto = ref<string | null>(null)
const providerPhoto = ref<string | null>(null)
const photoInput = ref<HTMLInputElement | null>(null)
const providerPhotoInput = ref<HTMLInputElement | null>(null)
const providerData = ref<ProviderData | null>(null)

// Références pour les inputs d'upload des images entreprise
const logoInput = ref<HTMLInputElement | null>(null)
const storefrontInput = ref<HTMLInputElement | null>(null)

// Images de l'entreprise (logo et photo devanture)
const businessImages = reactive({
  logo: null as string | null,
  storefront: null as string | null
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// États pour le changement de numéro de téléphone
const showPhoneChangeModal = ref(false)
const phoneChangeStep = ref<'request' | 'verify'>('request')
const phoneChangeForm = reactive({
  password: '',
  newPhone: '',
  otpCode: ''
})
const phoneChangeToken = ref('')
const phoneChangeLoading = ref(false)
const phoneChangeCountdown = ref(0)
let phoneChangeTimer: ReturnType<typeof setInterval> | null = null

// Toast
const toast = reactive({
  show: false,
  type: 'success' as 'success' | 'error' | 'info',
  message: ''
})

// Formulaires
const profileForm = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: ''
})

const businessForm = reactive({
  nom_commercial: '',
  ville: '',
  adresse: '',
  quartier: '',
  zone_couverture: '',
  rayon_km: 5
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

// ═══════════════════════════════════════════════════════════════════════════════
// COMPUTED
// ═══════════════════════════════════════════════════════════════════════════════
const user = computed(() => authStore.user)

const fullName = computed(() => {
  const firstName = profileForm.first_name || user.value?.first_name || ''
  const lastName = profileForm.last_name || user.value?.last_name || ''
  return `${firstName} ${lastName}`.trim() || 'Utilisateur'
})

const userInitials = computed(() => {
  const first = (profileForm.first_name || user.value?.first_name || 'U').charAt(0)
  const last = (profileForm.last_name || user.value?.last_name || '').charAt(0)
  return `${first}${last}`.toUpperCase()
})

const userPhone = computed(() => profileForm.phone || user.value?.phone || 'Non renseigné')

const isVerified = computed(() => user.value?.phone_verified || false)

// Photo à afficher (priorité: photo user, puis photo provider)
const displayPhoto = computed(() => userPhoto.value || providerPhoto.value)

// Validation du mot de passe
const passwordStrength = computed(() => {
  const pwd = passwordForm.new_password
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
  return passwordForm.new_password.length >= 8 &&
    passwordForm.new_password === passwordForm.confirm_password &&
    passwordStrength.value >= 3
})

// ═══════════════════════════════════════════════════════════════════════════════
// MÉTHODES
// ═══════════════════════════════════════════════════════════════════════════════

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

const loadUserData = async () => {
  isLoading.value = true
  try {
    // 1. Charger le profil utilisateur depuis l'API
    const profileResponse = await api.get('/auth/profile/')
    const userData = profileResponse.data
    
    // Mettre à jour le formulaire
    profileForm.first_name = userData.first_name || ''
    profileForm.last_name = userData.last_name || ''
    profileForm.email = userData.email || ''
    profileForm.phone = userData.phone || ''
    
    // Photo de profil utilisateur
    if (userData.photo_profil_url) {
      userPhoto.value = getImageUrl(userData.photo_profil_url)
    }
    
    // 2. Si c'est un provider, charger les données du provider
    if (userData.provider) {
      providerData.value = userData.provider
      businessForm.nom_commercial = userData.provider.nom_commercial || ''
      businessForm.ville = userData.provider.ville || ''
      businessForm.adresse = userData.provider.adresse || ''
      businessForm.quartier = userData.provider.quartier || ''
      businessForm.zone_couverture = userData.provider.zone_couverture || ''
      businessForm.rayon_km = parseFloat(userData.provider.rayon_km) || 5
      
      if (userData.provider.photo_local) {
        providerPhoto.value = getImageUrl(userData.provider.photo_local)
      }
      
      // 3. Charger les paramètres du provider (logo et storefront_photo)
      try {
        const settingsResponse = await api.get('/providers/settings/')
        const settingsData = settingsResponse.data
        
        if (settingsData.logo_url) {
          businessImages.logo = getImageUrl(settingsData.logo_url)
        }
        if (settingsData.storefront_photo_url) {
          businessImages.storefront = getImageUrl(settingsData.storefront_photo_url)
        }
      } catch (settingsError) {
        console.warn('Paramètres provider non disponibles:', settingsError)
      }
    }
  } catch (error) {
    console.error('Erreur chargement données:', error)
    showToast('Erreur lors du chargement des données', 'error')
  } finally {
    isLoading.value = false
  }
}

const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

const handlePhotoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Vérifier la taille (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Le fichier est trop volumineux (max 5MB)', 'error')
    return
  }

  isSubmitting.value = true
  try {
    // Upload vers l'API
    const formData = new FormData()
    formData.append('photo_profil', file)
    
    const response = await api.post('/auth/profile/photo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    // Mettre à jour l'affichage
    if (response.data.photo_url) {
      userPhoto.value = getImageUrl(response.data.photo_url)
    }
    
    showToast('Photo mise à jour avec succès', 'success')
  } catch (error: any) {
    console.error('Erreur upload photo:', error)
    showToast(error.response?.data?.photo_profil?.[0] || 'Erreur lors de l\'upload', 'error')
  } finally {
    isSubmitting.value = false
    // Reset input
    if (input) input.value = ''
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GESTION DES IMAGES ENTREPRISE (Logo & Photo devanture)
// ═══════════════════════════════════════════════════════════════════════════════

const triggerLogoUpload = () => {
  logoInput.value?.click()
}

const triggerStorefrontUpload = () => {
  storefrontInput.value?.click()
}

const handleLogoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Vérifier la taille (max 2MB pour le logo)
  if (file.size > 2 * 1024 * 1024) {
    showToast('Le logo ne doit pas dépasser 2MB', 'error')
    return
  }

  isSubmitting.value = true
  try {
    const formData = new FormData()
    formData.append('logo', file)
    
    await api.patch('/providers/settings/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    // Toujours recharger pour obtenir l'URL complète (le PATCH ne retourne pas logo_url)
    const settingsResponse = await api.get('/providers/settings/')
    if (settingsResponse.data.logo_url) {
      businessImages.logo = getImageUrl(settingsResponse.data.logo_url)
    }
    
    showToast('Logo mis à jour avec succès', 'success')
  } catch (error: any) {
    console.error('Erreur upload logo:', error)
    showToast(error.response?.data?.logo?.[0] || 'Erreur lors de l\'upload du logo', 'error')
  } finally {
    isSubmitting.value = false
    if (input) input.value = ''
  }
}

const handleStorefrontUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Vérifier la taille (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('La photo ne doit pas dépasser 5MB', 'error')
    return
  }

  isSubmitting.value = true
  try {
    const formData = new FormData()
    formData.append('storefront_photo', file)
    
    await api.patch('/providers/settings/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    // Toujours recharger pour obtenir l'URL complète (le PATCH ne retourne pas storefront_photo_url)
    const settingsResponse = await api.get('/providers/settings/')
    if (settingsResponse.data.storefront_photo_url) {
      businessImages.storefront = getImageUrl(settingsResponse.data.storefront_photo_url)
    }
    
    showToast('Photo de la devanture mise à jour', 'success')
  } catch (error: any) {
    console.error('Erreur upload storefront:', error)
    showToast(error.response?.data?.storefront_photo?.[0] || 'Erreur lors de l\'upload', 'error')
  } finally {
    isSubmitting.value = false
    if (input) input.value = ''
  }
}

const removeLogo = async () => {
  if (!confirm('Voulez-vous vraiment supprimer le logo ?')) return
  
  isSubmitting.value = true
  try {
    await api.patch('/providers/settings/', { logo: null })
    businessImages.logo = null
    showToast('Logo supprimé', 'success')
  } catch (error: any) {
    showToast('Erreur lors de la suppression', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const removeStorefront = async () => {
  if (!confirm('Voulez-vous vraiment supprimer cette photo ?')) return
  
  isSubmitting.value = true
  try {
    await api.patch('/providers/settings/', { storefront_photo: null })
    businessImages.storefront = null
    showToast('Photo supprimée', 'success')
  } catch (error: any) {
    showToast('Erreur lors de la suppression', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleUpdateProfile = async () => {
  isSubmitting.value = true
  try {
    const response = await api.patch('/auth/profile/', {
      first_name: profileForm.first_name,
      last_name: profileForm.last_name,
      email: profileForm.email || null
    })
    
    // Mettre à jour le store auth avec les nouvelles données
    if (response.data.user) {
      authStore.user = response.data.user
    }
    
    showToast('Profil mis à jour avec succès', 'success')
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || 
                     error.response?.data?.email?.[0] ||
                     'Erreur lors de la mise à jour'
    showToast(errorMsg, 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleUpdateBusiness = async () => {
  isSubmitting.value = true
  try {
    // Utiliser le nouvel endpoint /provider/me/
    await api.patch('/provider/me/', {
      nom_commercial: businessForm.nom_commercial,
      adresse: businessForm.adresse,
      quartier: businessForm.quartier,
      zone_couverture: businessForm.zone_couverture,
      rayon_km: businessForm.rayon_km
    })
    
    showToast('Informations entreprise mises à jour', 'success')
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || 
                     error.response?.data?.nom_commercial?.[0] ||
                     'Erreur lors de la mise à jour'
    showToast(errorMsg, 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleChangePassword = async () => {
  if (!isPasswordValid.value) {
    showToast('Veuillez vérifier les champs', 'error')
    return
  }

  isSubmitting.value = true
  try {
    await api.post('/auth/change-password/', {
      old_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
      new_password_confirm: passwordForm.confirm_password
    })
    showToast('Mot de passe modifié avec succès', 'success')
    resetPasswordForm()
    activeTab.value = 'personal'
  } catch (error: any) {
    const errorMsg = error.response?.data?.old_password?.[0] ||
                     error.response?.data?.new_password?.[0] ||
                     error.response?.data?.detail ||
                     'Erreur lors du changement de mot de passe'
    showToast(errorMsg, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHANGEMENT DE NUMÉRO DE TÉLÉPHONE
// ═══════════════════════════════════════════════════════════════════════════════

const openPhoneChangeModal = () => {
  phoneChangeStep.value = 'request'
  phoneChangeForm.password = ''
  phoneChangeForm.newPhone = ''
  phoneChangeForm.otpCode = ''
  phoneChangeToken.value = ''
  phoneChangeCountdown.value = 0
  showPhoneChangeModal.value = true
}

const closePhoneChangeModal = () => {
  showPhoneChangeModal.value = false
  if (phoneChangeTimer) {
    clearInterval(phoneChangeTimer)
    phoneChangeTimer = null
  }
}

const startCountdown = (seconds: number) => {
  phoneChangeCountdown.value = seconds
  if (phoneChangeTimer) {
    clearInterval(phoneChangeTimer)
  }
  phoneChangeTimer = setInterval(() => {
    phoneChangeCountdown.value--
    if (phoneChangeCountdown.value <= 0) {
      clearInterval(phoneChangeTimer!)
      phoneChangeTimer = null
    }
  }, 1000)
}

const requestPhoneChange = async () => {
  if (!phoneChangeForm.password || !phoneChangeForm.newPhone) {
    showToast('Veuillez remplir tous les champs', 'error')
    return
  }

  phoneChangeLoading.value = true
  try {
    const response = await api.post('/auth/phone/change/request/', {
      password: phoneChangeForm.password,
      new_phone: phoneChangeForm.newPhone
    })
    
    phoneChangeToken.value = response.data.change_token
    phoneChangeStep.value = 'verify'
    
    // Démarrer le countdown pour le resend (60 secondes)
    startCountdown(60)
    
    showToast('Code de vérification envoyé', 'success')
  } catch (error: any) {
    const errorMsg = error.response?.data?.password?.[0] ||
                     error.response?.data?.new_phone?.[0] ||
                     error.response?.data?.detail ||
                     'Erreur lors de la demande de changement'
    showToast(errorMsg, 'error')
  } finally {
    phoneChangeLoading.value = false
  }
}

const confirmPhoneChange = async () => {
  if (!phoneChangeForm.otpCode || phoneChangeForm.otpCode.length !== 6) {
    showToast('Veuillez entrer le code à 6 chiffres', 'error')
    return
  }

  phoneChangeLoading.value = true
  try {
    const response = await api.post('/auth/phone/change/confirm/', {
      change_token: phoneChangeToken.value,
      otp_code: phoneChangeForm.otpCode
    })
    
    // Mettre à jour le numéro affiché
    profileForm.phone = response.data.new_phone
    
    // Mettre à jour le store
    if (authStore.user) {
      authStore.user.phone = response.data.new_phone
    }
    
    showToast('Numéro de téléphone mis à jour avec succès !', 'success')
    closePhoneChangeModal()
    
    // Recharger les données utilisateur
    await loadUserData()
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail ||
                     'Code de vérification invalide ou expiré'
    showToast(errorMsg, 'error')
  } finally {
    phoneChangeLoading.value = false
  }
}

const resendPhoneChangeOTP = async () => {
  if (phoneChangeCountdown.value > 0) return

  phoneChangeLoading.value = true
  try {
    const response = await api.post('/auth/phone/change/resend/', {
      change_token: phoneChangeToken.value
    })
    
    phoneChangeToken.value = response.data.change_token
    startCountdown(60)
    
    showToast('Code renvoyé avec succès', 'success')
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || 'Erreur lors du renvoi du code'
    showToast(errorMsg, 'error')
  } finally {
    phoneChangeLoading.value = false
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESET FORMULAIRES
// ═══════════════════════════════════════════════════════════════════════════════

const resetPersonalForm = () => {
  if (user.value) {
    profileForm.first_name = user.value.first_name || ''
    profileForm.last_name = user.value.last_name || ''
    profileForm.email = user.value.email || ''
    profileForm.phone = user.value.phone || ''
  }
}

const resetBusinessForm = () => {
  if (providerData.value) {
    businessForm.nom_commercial = providerData.value.nom_commercial || ''
    businessForm.adresse = providerData.value.adresse || ''
    businessForm.quartier = providerData.value.quartier || ''
    businessForm.zone_couverture = providerData.value.zone_couverture || ''
    businessForm.rayon_km = parseFloat(providerData.value.rayon_km) || 5
  }
}

const resetPasswordForm = () => {
  passwordForm.current_password = ''
  passwordForm.new_password = ''
  passwordForm.confirm_password = ''
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════════
onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════════
   CHARTE GRAPHIQUE PRESSOW - Profile Page
   ═══════════════════════════════════════════════════════════════════════════════ */

.profile-page {
  padding: 24px;
  max-width: 1200px;
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

/* Tabs Navigation */
.tabs-navigation {
  background: white;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tabs-container {
  display: flex;
  gap: 8px;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background: #f1f5f9;
  color: #2563eb;
}

.tab-button.active {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: white;
}

.tab-icon {
  width: 18px;
  height: 18px;
}

/* Tab Content */
.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Profile Grid */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .profile-grid {
    grid-template-columns: 350px 1fr;
  }
}

/* Business Grid */
.business-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Images Section */
.images-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 640px) {
  .images-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.image-upload-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.image-upload-zone {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-zone:hover {
  border-color: #2563eb;
  background: #f8fafc;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 140px;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.image-remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

.image-remove-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  text-align: center;
}

.image-placeholder svg {
  color: #cbd5e1;
}

.image-placeholder span {
  font-size: 13px;
}

.image-hint {
  font-size: 11px;
  color: #94a3b8;
}

.images-note {
  margin-top: 12px;
  font-size: 12px;
  color: #64748b;
  text-align: center;
  font-style: italic;
}

/* Profile Card */
.profile-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-container {
  position: relative;
  margin-bottom: 16px;
}

.avatar-large {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-large.has-image {
  background: #f1f5f9;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initial {
  font-size: 40px;
  font-weight: 700;
  color: white;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.avatar-edit-btn:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.avatar-edit-btn:disabled {
  cursor: wait;
  opacity: 0.7;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.hidden-input {
  display: none;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.user-phone {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px 0;
}

.profile-badges {
  display: flex;
  gap: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge-success {
  background: #dcfce7;
  color: #16a34a;
}

.badge-warning {
  background: #fef3c7;
  color: #d97706;
}

/* Form Card */
.form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-card-centered {
  max-width: 500px;
  margin: 0 auto;
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
  margin: 0;
}

.card-title svg {
  color: #2563eb;
}

.card-content {
  padding: 24px;
}

/* Form */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-field input,
.form-field textarea,
.form-field select {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  transition: all 0.2s ease;
}

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-field textarea {
  resize: vertical;
  min-height: 80px;
}

.input-disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.field-hint {
  font-size: 12px;
  color: #94a3b8;
}

/* Password Input */
.password-input-wrapper {
  position: relative;
}

.password-input-wrapper input {
  width: 100%;
  padding-right: 44px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #2563eb;
}

/* Password Strength */
.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
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

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 14px 24px;
  border-radius: 8px;
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

.toast-info {
  background: #2563eb;
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

/* Input with Action Button */
.input-with-action {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.input-with-action input {
  flex: 1;
}

.btn-change-phone {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-change-phone:hover:not(:disabled) {
  background: #eff6ff;
  border-color: #93c5fd;
}

.btn-change-phone:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.field-hint svg {
  flex-shrink: 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1100;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.modal-title svg {
  color: #2563eb;
}

.modal-close {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  padding: 24px;
}

/* Phone Change Steps */
.phone-change-step {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-info {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 12px;
  border: 1px solid #bae6fd;
}

.step-info-success {
  background: #f0fdf4;
  border-color: #86efac;
}

.step-info .info-icon {
  flex-shrink: 0;
  color: #0284c7;
}

.step-info-success .info-icon {
  color: #16a34a;
}

.step-info p {
  margin: 0;
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
}

.step-info strong {
  color: #1e293b;
}

.phone-change-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.phone-input-group {
  display: flex;
  align-items: stretch;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.phone-input-group:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.phone-prefix {
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 500;
  border-right: 1px solid #e2e8f0;
}

.phone-input-group input {
  flex: 1;
  border: none;
  padding: 12px;
  font-size: 14px;
}

.phone-input-group input:focus {
  outline: none;
  box-shadow: none;
}

.otp-input {
  text-align: center;
  font-size: 24px !important;
  font-weight: 600;
  letter-spacing: 8px;
  padding: 16px !important;
}

.resend-section {
  text-align: center;
  padding: 8px 0;
}

.countdown {
  font-size: 13px;
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
  padding: 0;
}

.btn-link:hover:not(:disabled) {
  color: #1d4ed8;
}

.btn-link:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 640px) {
  .profile-page {
    padding: 16px;
  }

  .tabs-container {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
