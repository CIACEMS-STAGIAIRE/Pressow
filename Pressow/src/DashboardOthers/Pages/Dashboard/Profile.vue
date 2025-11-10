<template>
    <DashboardLayout>
        <div class="profile-page">
            <!-- Header avec navigation sticky -->
            <div class="page-header">
                <div class="header-content">
                    <div class="header-text">
                        <h1 class="page-title">Mon Profil</h1>
                        <p class="page-description">Gérez vos informations personnelles et professionnelles</p>
                    </div>
                    <div class="header-actions">
                        <button class="secondary-btn" @click="exportProfileData">
                            <i class="fas fa-download"></i>
                            Exporter les données
                        </button>
                    </div>
                </div>
            </div>

            <!-- Navigation par onglets sticky -->
            <div class="tabs-navigation-sticky">
                <div class="tabs-container">
                    <button v-for="tab in tabs" :key="tab.id"
                        :class="['tab-button', { 'active': activeTab === tab.id }]" @click="activeTab = tab.id">
                        <i :class="tab.icon"></i>
                        {{ tab.label }}
                    </button>
                </div>
            </div>

            <!-- Contenu principal avec onglets -->
            <div class="tab-content">
                <!-- Onglet Informations personnelles -->
                <div v-if="activeTab === 'personal'" class="tab-panel">
                    <!-- Carte profil -->
                    <div class="profile-card card">
                        <div class="card-content">
                            <div class="profile-avatar-section">
                                <div class="avatar-container">
                                    <div class="avatar-large">
                                        <img v-if="profilePhoto" :src="profilePhoto" alt="Photo de profil"
                                            style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
                                        <span v-else>{{ userInitials }}</span>
                                    </div>
                                    <div class="avatar-actions">
                                        <button type="button" class="icon-btn" @click="openAvatarUpload"
                                            title="Changer la photo">
                                            <i class="fas fa-camera"></i>
                                        </button>
                                        <input type="file" ref="avatarInput" @change="handleAvatarUpload"
                                            accept="image/*" class="hidden-file-input" />
                                    </div>
                                </div>
                                <div class="profile-info">
                                    <h2 class="user-name">{{ fullName }}</h2>
                                    <p class="user-email">{{ user.email }}</p>
                                    <div class="profile-badges">
                                        <!-- Badge de vérification KYC -->
                                        <span v-if="user.isVerified" class="badge badge-success">
                                            <i class="fas fa-check-circle"></i>
                                            Vérifié
                                        </span>
                                        <span v-else-if="user.statut_kyc === 'pending'" class="badge badge-warning">
                                            <i class="fas fa-clock"></i>
                                            Vérification en cours
                                        </span>
                                        <span v-else class="badge badge-secondary">
                                            <i class="fas fa-exclamation-circle"></i>
                                            Non vérifié
                                        </span>

                                        <!-- Badge de prestation principale -->
                                        <span v-if="user.serviceType" class="badge badge-primary">
                                            <i class="fas fa-star"></i>
                                            {{ getServiceTypeLabel(user.serviceType) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-stats">
                                <div v-if="user.isVerified" class="stat-item">
                                    <!-- Message KYC vérifié -->
                                    <div class="form-card kyc-verified-card">
                                        <div>
                                            <div class="kyc-verified-message">
                                                <i class="fas fa-check-circle"></i>
                                                <div>
                                                    <h3>Compte vérifié avec succès.</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">{{ userStats.totalOrders }}</div>
                                    <div class="stat-label">Commandes totales</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">{{ userStats.successRate }}%</div>
                                    <div class="stat-label">Taux de réussite</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">{{ userStats.responseTime }}min</div>
                                    <div class="stat-label">Temps de réponse</div>
                                </div>
                                
                            </div>
                        </div>
                    </div>

                    <div :class="user.isVerified ? '' : 'tab-grid'">
                        <!-- Colonne gauche -->
                        <div class="tab-column">
                            <!-- Section KYC UTILISATEUR (pour boutiques supplémentaires et prestations) -->
                            <div v-if="!user.isVerified" class="form-card card kyc-card">
                                <div class="card-header">
                                    <div class="section-header">
                                        <i class="fas fa-shield-alt"></i>
                                        <h3 class="section-title">Vérification KYC du compte</h3>
                                        <span class="badge badge-warning">{{ kycVerificationStatus }}</span>
                                    </div>
                                </div>
                                <div class="card-content">
                                    <div class="kyc-info-box">
                                        <i class="fas fa-info-circle"></i>
                                        <div>
                                            <h4>Pourquoi vérifier votre compte ?</h4>
                                            <p>La vérification KYC est nécessaire pour créer des boutiques
                                                supplémentaires et ajouter des prestations en plus de votre prestation
                                                principale et pour être visible sur l'application.</p>
                                        </div>
                                    </div>

                                    <div class="kyc-steps">
                                        <!-- Étape 1: Photo d'identité -->
                                        <div class="kyc-step">
                                            <div class="step-content">
                                                <h4>Photo d'identité</h4>
                                                <p>Selfie avec votre pièce d'identité</p>
                                                <div class="document-upload-area"
                                                    @click="triggerFileUpload('identityPhoto')">
                                                    <div v-if="user.documents?.identityPhoto" class="document-preview">
                                                        <img :src="user.documents.identityPhoto" alt="Photo d'identité"
                                                            class="document-image" />
                                                        <div class="document-overlay">
                                                            <button type="button" class="icon-btn"
                                                                @click.stop="viewDocument(user.documents.identityPhoto)">
                                                                <i class="fas fa-eye"></i>
                                                            </button>
                                                            <button type="button" class="danger-btn icon-btn"
                                                                @click.stop="removeUserDocument('identityPhoto')">
                                                                <i class="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div v-else class="upload-placeholder">
                                                        <i class="fas fa-camera"></i>
                                                        <span>Ajouter photo d'identité</span>
                                                    </div>
                                                    <input type="file" ref="identityPhotoInput"
                                                        @change="handleUserDocumentUpload($event, 'identityPhoto')"
                                                        accept="image/*" class="hidden-file-input" />
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Étape 2: Documents officiels -->
                                        <div class="kyc-step">
                                            <div class="step-content">
                                                <h4>Documents officiels</h4>
                                                <p>Recto et verso de votre CNI/Passeport</p>
                                                <div class="documents-grid">
                                                    <div class="document-upload-area"
                                                        @click="triggerFileUpload('identityCard')">
                                                        <div v-if="user.documents?.identityCard"
                                                            class="document-preview">
                                                            <img :src="user.documents.identityCard" alt="Recto CNI"
                                                                class="document-image" />
                                                            <div class="document-overlay">
                                                                <button type="button" class="icon-btn"
                                                                    @click.stop="viewDocument(user.documents.identityCard)">
                                                                    <i class="fas fa-eye"></i>
                                                                </button>
                                                                <button type="button" class="danger-btn icon-btn"
                                                                    @click.stop="removeUserDocument('identityCard')">
                                                                    <i class="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div v-else class="upload-placeholder">
                                                            <i class="fas fa-id-card"></i>
                                                            <span>CNI Recto</span>
                                                        </div>
                                                        <input type="file" ref="cniFrontInput"
                                                            @change="handleUserDocumentUpload($event, 'identityCard')"
                                                            accept="image/*" class="hidden-file-input" />
                                                    </div>

                                                    <div class="document-upload-area"
                                                        @click="triggerFileUpload('identityBack')">
                                                        <div v-if="user.documents?.identityBack"
                                                            class="document-preview">
                                                            <img :src="user.documents.identityBack" alt="Verso CNI"
                                                                class="document-image" />
                                                            <div class="document-overlay">
                                                                <button type="button" class="icon-btn"
                                                                    @click.stop="viewDocument(user.documents.identityBack)">
                                                                    <i class="fas fa-eye"></i>
                                                                </button>
                                                                <button type="button" class="danger-btn icon-btn"
                                                                    @click.stop="removeUserDocument('identityBack')">
                                                                    <i class="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div v-else class="upload-placeholder">
                                                            <i class="fas fa-id-card"></i>
                                                            <span>CNI Verso</span>
                                                        </div>
                                                        <input type="file" ref="cniBackInput"
                                                            @change="handleUserDocumentUpload($event, 'identityBack')"
                                                            accept="image/*" class="hidden-file-input" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Bouton de soumission KYC -->
                                        <div class="kyc-submit-section">
                                            <button type="button" class="primar-btn"
                                                :disabled="!canSubmitKyc || isVerifying" @click="submitKycVerification">
                                                <i class="fas fa-check-circle"></i>
                                                {{ isVerifying ? 'Vérification en cours...' : 'Soumettre pour vérification'}}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Colonne droite -->
                        <!-- Informations personnelles -->
                        <div :class="user.isVerified ? 'tab-columnVerified' : 'tab-column'">
                            <!-- Formulaire informations personnelles -->
                            <div class="form-card card">
                                <div class="card-header">
                                    <div class="card-title">
                                        <i class="fas fa-user"></i>
                                        Informations personnelles
                                    </div>
                                </div>
                                <div class="card-contents">
                                    <form @submit.prevent="handleUpdateProfile" class="profile-form">
                                        <div class="form-row">
                                            <div class="form-field">
                                                <label for="lastName">
                                                    Nom de famille
                                                </label>
                                                <div class="input-with-icon">
                                                    <input id="lastName" v-model="profileForm.first_name"
                                                        :class="{ error: fieldErrors.first_name }" required />
                                                    <i class="input-icon fas fa-user"></i>
                                                </div>
                                                <div v-if="fieldErrors.first_name" class="error-message">
                                                    {{ fieldErrors.first_name }}
                                                </div>
                                            </div>

                                            <div class="form-field">
                                                <label for="firstName">
                                                    Prénom
                                                </label>
                                                <div class="input-with-icon">
                                                    <input id="firstName" v-model="profileForm.last_name"
                                                        :class="{ error: fieldErrors.last_name }" required />
                                                    <i class="input-icon fas fa-user"></i>
                                                </div>
                                                <div v-if="fieldErrors.last_name" class="error-message">
                                                    {{ fieldErrors.last_name }}
                                                </div>
                                            </div>
                                        </div>

                                        <div class="form-row">
                                            <div class="form-field">
                                                <label for="email">
                                                    Adresse email
                                                </label>
                                                <div class="input-with-icon">
                                                    <input id="email" type="email" v-model="profileForm.email"
                                                        :class="{ error: fieldErrors.email }"
                                                        placeholder="Ajouter une adresse email (optionnel)" />
                                                    <i class="input-icon fas fa-envelope"></i>
                                                </div>
                                                <div v-if="fieldErrors.email" class="error-message">
                                                    {{ fieldErrors.email }}
                                                </div>
                                            </div>

                                            <div class="form-field">
                                                <label for="phone">
                                                    Numéro de téléphone
                                                </label>
                                                <div class="input-with-icon">
                                                    <input id="phone" type="tel" v-model="profileForm.phone"
                                                        placeholder="+225XXXXXXXXXX"
                                                        :class="{ error: fieldErrors.phone }" required disabled />
                                                    <i class="input-icon fas fa-phone"></i>
                                                </div>
                                                <div class="field-hint">
                                                    Le numéro de téléphone ne peut pas être modifié
                                                </div>
                                            </div>
                                        </div>

                                        <!-- CHAMP VILLE AVEC SUGGESTIONS COMME INSCRIPTION.VUE -->
                                        <div class="form-field">
                                            <label for="city">
                                                Ville
                                            </label>
                                            <div class="input-wrapper">
                                                <i class="fas fa-map-marker-alt input-icon"></i>
                                                <input id="city" name="city" v-model="profileForm.city"
                                                    @input="onCityInput" @focus="showCitySuggestions = true"
                                                    @blur="onCityBlur"
                                                    placeholder="Commencez à taper le nom de votre ville..." required
                                                    class="form-input" autocomplete="off" />
                                                <!-- Liste des suggestions -->
                                                <div v-if="showCitySuggestions && filteredCities.length > 0"
                                                    class="city-suggestions">
                                                    <div v-for="city in filteredCities" :key="city.name"
                                                        @mousedown="selectCity(city.name)" class="suggestion-item">
                                                        <i class="fas fa-map-marker-alt suggestion-icon"></i>
                                                        <span class="suggestion-text">{{ city.name }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="input-hint">
                                                <i class="fas fa-info-circle"></i>
                                                Sélectionnez une ville dans la liste ou tapez le nom de votre ville
                                            </div>
                                        </div>

                                        <div class="form-actions">
                                            <button type="button" class="secondary-btn" @click="resetForm"
                                                :disabled="isSubmitting">
                                                Annuler
                                            </button>
                                            <button type="submit" class="primar-btn" :disabled="isSubmitting">
                                                <i class="fas fa-save"></i>
                                                {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'
                                                }}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <!-- Informations du compte -->
                            <div class="info-card card">
                                <div class="card-header">
                                    <div class="card-title">
                                        <i class="fas fa-info-circle"></i>
                                        Informations du compte
                                    </div>
                                </div>
                                <div class="card-content">
                                    <div class="info-list">
                                        <div class="info-item">
                                            <div class="info-icon">
                                                <i class="fas fa-calendar-alt"></i>
                                            </div>
                                            <div class="info-content">
                                                <span class="info-label">Date d'inscription</span>
                                                <span class="info-value">{{ formatDate(user.date_inscription) }}</span>
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <div class="info-icon">
                                                <i class="fas fa-id-card"></i>
                                            </div>
                                            <div class="info-content">
                                                <span class="info-label">Identifiant</span>
                                                <span class="info-value">{{ user.id }}</span>
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <div class="info-icon">
                                                <i class="fas fa-map-marker-alt"></i>
                                            </div>
                                            <div class="info-content">
                                                <span class="info-label">Ville</span>
                                                <span class="info-value">{{ user.city || 'Non spécifiée' }}</span>
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <div class="info-icon">
                                                <i class="fas fa-shield-alt"></i>
                                            </div>
                                            <div class="info-content">
                                                <span class="info-label">Statut KYC</span>
                                                <span :class="['info-value', getKycStatusClass(user.statut_kyc)]">
                                                    {{ getKycStatusLabel(user.statut_kyc) }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Onglet Entreprise - ACCESSIBLE UNIQUEMENT POUR NETTOYAGE -->
                <div v-if="activeTab === 'business' && user.serviceType === 'nettoyage'" class="tab-panel">
                    <div class="tab-grid">
                        <div class="tab-column-full">
                            <!-- Sélecteur de boutique -->
                            <div class="shop-selector-card card">
                                <div class="card-header">
                                    <div class="card-title">
                                        <i class="fas fa-store"></i>
                                        Gestion des boutiques
                                    </div>
                                    <button class="primary-btn" @click="attemptCreateShop">
                                        <i class="fas fa-plus"></i>
                                        Nouvelle boutique
                                    </button>
                                </div>
                                <div class="card-content">
                                    <!-- Message KYC requis pour créer une boutique SUPPLÉMENTAIRE -->
                                    <div v-if="!user.isVerified && userShops.length > 0" class="kyc-warning-box">
                                        <i class="fas fa-exclamation-triangle"></i>
                                        <div>
                                            <h4>Vérification KYC requise pour boutiques supplémentaires</h4>
                                            <p>Vous devez vérifier votre compte dans l'onglet "Informations
                                                personnelles" pour créer des boutiques supplémentaires.</p>
                                            <button class="secondary-btn" @click="activeTab = 'personal'">
                                                <i class="fas fa-arrow-left"></i>
                                                Aller à la vérification KYC
                                            </button>
                                        </div>
                                    </div>

                                    <div class="shop-selection">
                                        <div class="shop-selection-header">
                                            <h3 class="shop-selection-title">Boutique active</h3>
                                            <span class="shop-count">{{ userShops.length }} boutique(s)</span>
                                        </div>

                                        <!-- Message si aucune boutique -->
                                        <div v-if="userShops.length === 0" class="empty-state">
                                            <i class="fas fa-store-slash"></i>
                                            <h4>Aucune boutique</h4>
                                            <p>Vous n'avez pas encore de boutique enregistrée. Créez votre première
                                                boutique pour commencer.</p>
                                            <button class="primary-btn" @click="showCreateShopModal = true">
                                                <i class="fas fa-plus"></i>
                                                Créer ma première boutique
                                            </button>
                                        </div>

                                        <div v-else class="shops-grid">
                                            <div v-for="(shop, index) in userShops" :key="shop.id"
                                                :class="['shop-card', { 'active': currentShopIndex === index }]"
                                                @click="switchShop(index)">
                                                <div class="shop-card-content">
                                                    <div class="shop-main-info">
                                                        <div class="shop-avatar">
                                                            <i class="fas fa-store"></i>
                                                        </div>
                                                        <div class="shop-details">
                                                            <h4 class="shop-name">{{ shop.name }}</h4>
                                                            <p class="shop-address">{{ shop.mainAddress }}</p>
                                                            <div class="shop-stats">
                                                                <span class="shop-stat">
                                                                    <i class="fas fa-map-marker-alt"></i>
                                                                    {{ shop.city }}
                                                                </span>
                                                                <span class="shop-stat">
                                                                    <i class="fas fa-image"></i>
                                                                    {{ getTotalShopPhotos(shop) }} photos
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="shop-actions">
                                                        <button class="icon-btn" @click.stop="editShop(index)">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button class="danger-btn icon-btn"
                                                            @click.stop="confirmDeleteShop(shop)"
                                                            v-if="userShops.length > 1">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="active-indicator" v-if="currentShopIndex === index">
                                                    <i class="fas fa-check"></i>
                                                    Active
                                                </div>
                                            </div>
                                        </div>

                                        <!-- NOUVELLE SECTION: Photos de la boutique -->
                                        <div v-if="activeShop" class="form-section">
                                            <h3 class="section-title">
                                                <i class="fas fa-camera"></i>
                                                Photos de la boutique
                                            </h3>
                                            <div class="location-help">
                                                <div class="help-text">
                                                    <i class="fas fa-info-circle"></i>
                                                    Ajoutez des photos de votre boutique pour attirer plus de clients
                                                </div>
                                            </div>

                                            <!-- Photos existantes -->
                                            <div v-if="activeShop.documents?.photos && activeShop.documents.photos.length > 0"
                                                class="existing-photos">
                                                <h4>Photos de la boutique ({{ activeShop.documents.photos.length }})
                                                </h4>
                                                <div class="photos-grid">
                                                    <div v-for="(photo, index) in activeShop.documents.photos"
                                                        :key="index" class="photo-item">
                                                        <img :src="photo" :alt="`Photo ${index + 1}`"
                                                            class="photo-thumb" />
                                                        <div class="photo-actions">
                                                            <button type="button" class="icon-btn"
                                                                @click="viewPhoto(photo)">
                                                                <i class="fas fa-eye"></i>
                                                            </button>
                                                            <button type="button" class="danger-btn icon-btn"
                                                                @click="removeShopPhoto(index)">
                                                                <i class="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Ajout de nouvelles photos -->
                                            <div class="add-photos-section">
                                                <div class="photos-upload-area" @click="triggerShopPhotosUpload">
                                                    <i class="fas fa-cloud-upload-alt"></i>
                                                    <p>Cliquez pour ajouter des photos de la boutique</p>
                                                    <span class="upload-hint">JPG, PNG - Max 5MB par photo</span>
                                                    <input type="file" ref="shopPhotosInput"
                                                        @change="handleShopPhotosUpload" multiple accept="image/*"
                                                        class="hidden-file-input" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Afficher le formulaire uniquement si activeShop existe -->
                            <div v-if="activeShop" class="form-card card">
                                <div class="card-header">
                                    <div class="card-title">
                                        <i class="fas fa-building"></i>
                                        Informations de l'entreprise
                                    </div>
                                </div>
                                <div class="card-content">
                                    <form @submit.prevent="handleUpdateBusiness" class="business-form">
                                        <div class="form-section">
                                            <h3 class="section-title">Informations générales</h3>
                                            <div class="form-row">
                                                <div class="form-field">
                                                    <label for="nomCommercial">
                                                        Nom commercial
                                                    </label>
                                                    <div class="input-with-icon">
                                                        <input id="nomCommercial" v-model="activeShop.name" required />
                                                        <i class="input-icon fas fa-building"></i>
                                                    </div>
                                                </div>

                                                <!-- CHAMP VILLE AVEC SUGGESTIONS POUR LA BOUTIQUE -->
                                                <div class="form-field">
                                                    <label for="shopCity">
                                                        Ville
                                                    </label>
                                                    <div class="input-wrapper">
                                                        <i class="fas fa-map-marker-alt input-icon"></i>
                                                        <input id="shopCity" name="shopCity" v-model="activeShop.city"
                                                            @input="onShopCityInput"
                                                            @focus="showShopCitySuggestions = true"
                                                            @blur="onShopCityBlur"
                                                            placeholder="Commencez à taper le nom de votre ville..."
                                                            required class="form-input" autocomplete="off" />
                                                        <!-- Liste des suggestions -->
                                                        <div v-if="showShopCitySuggestions && filteredShopCities.length > 0"
                                                            class="city-suggestions">
                                                            <div v-for="city in filteredShopCities" :key="city.name"
                                                                @mousedown="selectShopCity(city.name)"
                                                                class="suggestion-item">
                                                                <i class="fas fa-map-marker-alt suggestion-icon"></i>
                                                                <span class="suggestion-text">{{ city.name }}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="input-hint">
                                                        <i class="fas fa-info-circle"></i>
                                                        Saisissez ou sélectionnez la ville où se trouve votre boutique
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="form-row">
                                                <div class="form-field">
                                                    <label for="zoneCouverture">
                                                        Zone de couverture
                                                    </label>
                                                    <div class="input-with-icon">
                                                        <textarea id="zoneCouverture"
                                                            v-model="activeShop.zone_couverture"
                                                            placeholder="Ex: Cocody, Angré, Riviera..."></textarea>
                                                        <i class="input-icon fas fa-map"></i>
                                                    </div>
                                                </div>

                                                <div class="form-field">
                                                    <label for="rayonKm">
                                                        Rayon de couverture (km)
                                                    </label>
                                                    <div class="input-with-icon">
                                                        <input id="rayonKm" type="number" v-model="activeShop.rayon_km"
                                                            step="0.5" min="1" max="50" />
                                                        <i class="input-icon fas fa-ruler"></i>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="form-field">
                                                <label for="address">
                                                    Adresse complète
                                                </label>
                                                <div class="input-with-icon">
                                                    <textarea id="address" v-model="activeShop.mainAddress"
                                                        required></textarea>
                                                    <i class="input-icon textarea-icon fas fa-map-marker-alt"></i>
                                                </div>
                                            </div>

                                            <div class="form-field">
                                                <label for="shopDescription">
                                                    Description
                                                </label>
                                                <div class="input-with-icon">
                                                    <textarea id="shopDescription" v-model="activeShop.description"
                                                        rows="3"
                                                        placeholder="Décrivez votre boutique, vos spécialités, vos services..."></textarea>
                                                    <i class="input-icon textarea-icon fas fa-file-alt"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Section Carte de localisation -->
                                        <div class="form-section">
                                            <h3 class="section-title">
                                                <i class="fas fa-map-marked-alt"></i>
                                                Localisation sur la carte
                                            </h3>
                                            <div class="location-help">
                                                <div class="help-text">
                                                    <i class="fas fa-info-circle"></i>
                                                    Déplacez le marqueur ou cliquez sur la carte pour définir la
                                                    position exacte de votre entreprise
                                                </div>
                                            </div>
                                            <MapPicker :initialLat="activeShop.location?.lat || 5.3600"
                                                :initialLng="activeShop.location?.lng || -4.0083"
                                                :initialAddress="activeShop.mainAddress"
                                                @update:location="updateShopLocation" />
                                        </div>

                                        <!-- Section Prestations -->
                                        <div class="form-section">
                                            <div class="section-header-with-action">
                                                <h3 class="section-title">
                                                    <i class="fas fa-briefcase"></i>
                                                    Prestations proposées
                                                </h3>
                                                <button type="button" class="secondary-btn"
                                                    @click="attemptAddPrestation">
                                                    <i class="fas fa-plus"></i>
                                                    Ajouter une prestation
                                                </button>
                                            </div>

                                            <!-- Message KYC pour prestations supplémentaires -->
                                            <div v-if="!user.isVerified && activeShop.prestations.length >= 1"
                                                class="kyc-info-prestations">
                                                <i class="fas fa-info-circle"></i>
                                                <p>La vérification KYC est requise pour ajouter des prestations
                                                    supplémentaires.</p>
                                            </div>

                                            <div class="prestations-list">
                                                <div v-for="prestation in shopPrestationsDisplay" :key="prestation.id"
                                                    class="prestation-item">
                                                    <div class="prestation-info">
                                                        <i :class="prestation.icon" class="prestation-icon"></i>
                                                        <div class="prestation-details">
                                                            <h4>{{ prestation.name }}</h4>
                                                            <p>{{ prestation.description }}</p>
                                                        </div>
                                                    </div>
                                                    <div class="prestation-actions">
                                                        <span v-if="prestation.id === activeShop.mainPrestation"
                                                            class="badge badge-primary">
                                                            <i class="fas fa-star"></i>
                                                            Principale
                                                        </span>
                                                        <button v-if="canDeletePrestation(prestation.id)" type="button"
                                                            class="danger-btn icon-btn"
                                                            @click="confirmRemovePrestation(prestation.id)">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="form-actions">
                                            <button type="button" class="secondary-btn" @click="resetForm"
                                                :disabled="isSubmitting">
                                                Annuler
                                            </button>
                                            <button type="submit" class="primar-btn" :disabled="isSubmitting">
                                                <i class="fas fa-save"></i>
                                                {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'
                                                }}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Message pour autres services que nettoyage -->
                <div v-if="activeTab === 'business' && user.serviceType !== 'nettoyage'" class="tab-panel">
                    <div class="tab-grid">
                        <div class="tab-column-full">
                            <div class="form-card card">
                                <div class="card-header">
                                    <div class="card-title">
                                        <i class="fas fa-building"></i>
                                        Informations de l'entreprise
                                    </div>
                                </div>
                                <div class="card-content">
                                    <form @submit.prevent="handleUpdateBusiness" class="business-form">
                                        <div class="form-section">
                                            <h3 class="section-title">Informations générales</h3>
                                            <div class="form-row">
                                                <div class="form-field">
                                                    <label for="nomCommercial">
                                                        Nom commercial
                                                    </label>
                                                    <div class="input-with-icon">
                                                        <input id="nomCommercial" v-model="user.serviceName"
                                                            placeholder="Ex: Fanico Express, Nettoyage Pro..." />
                                                        <i class="input-icon fas fa-building"></i>
                                                    </div>
                                                </div>

                                                <!-- CHAMP VILLE AVEC SUGGESTIONS POUR FANICO/NETTOYAGE -->
                                                <div class="form-field">
                                                    <label for="serviceCity">
                                                        Ville d'opération
                                                    </label>
                                                    <div class="input-wrapper">
                                                        <i class="fas fa-map-marker-alt input-icon"></i>
                                                        <input id="serviceCity" name="serviceCity" v-model="user.city"
                                                            @input="onServiceCityInput"
                                                            @focus="showServiceCitySuggestions = true"
                                                            @blur="onServiceCityBlur"
                                                            placeholder="Commencez à taper le nom de votre ville..."
                                                            required class="form-input" autocomplete="off" />
                                                        <!-- Liste des suggestions -->
                                                        <div v-if="showServiceCitySuggestions && filteredServiceCities.length > 0"
                                                            class="city-suggestions">
                                                            <div v-for="city in filteredServiceCities" :key="city.name"
                                                                @mousedown="selectServiceCity(city.name)"
                                                                class="suggestion-item">
                                                                <i class="fas fa-map-marker-alt suggestion-icon"></i>
                                                                <span class="suggestion-text">{{ city.name }}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="input-hint">
                                                        <i class="fas fa-info-circle"></i>
                                                        Saisissez ou sélectionnez votre ville principale d'opération
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="form-row">
                                                <div class="form-field">
                                                    <label for="zoneCouverture">
                                                        Zone de couverture
                                                    </label>
                                                    <div class="input-with-icon">
                                                        <textarea id="zoneCouverture" v-model="user.zone_couverture"
                                                            placeholder="Ex: Cocody, Angré, Riviera..."></textarea>
                                                        <i class="input-icon fas fa-map"></i>
                                                    </div>
                                                </div>

                                                <div class="form-field">
                                                    <label for="rayonKm">
                                                        Rayon de couverture (km)
                                                    </label>
                                                    <div class="input-with-icon">
                                                        <input id="rayonKm" type="number" v-model="user.rayon_km"
                                                            step="0.5" min="1" max="50" />
                                                        <i class="input-icon fas fa-ruler"></i>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="form-field">
                                                <label for="address">
                                                    Adresse de base
                                                </label>
                                                <div class="input-with-icon">
                                                    <textarea id="address" v-model="user.mainAddress"
                                                        placeholder="Votre adresse principale ou quartier..."></textarea>
                                                    <i class="input-icon textarea-icon fas fa-map-marker-alt"></i>
                                                </div>
                                            </div>

                                            <div class="form-field">
                                                <label for="serviceDescription">
                                                    Description du service
                                                </label>
                                                <div class="input-with-icon">
                                                    <textarea id="serviceDescription" v-model="user.description"
                                                        rows="3"
                                                        placeholder="Décrivez vos services, vos spécialités, votre expérience..."></textarea>
                                                    <i class="input-icon textarea-icon fas fa-file-alt"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Section Carte de localisation pour service mobile -->
                                        <div class="form-section">
                                            <h3 class="section-title">
                                                <i class="fas fa-map-marked-alt"></i>
                                                Zone de couverture
                                            </h3>
                                            <div class="location-help">
                                                <div class="help-text">
                                                    <i class="fas fa-info-circle"></i>
                                                    Définissez votre zone d'intervention pour que les clients puissent
                                                    vous localiser
                                                </div>
                                            </div>
                                            <MapPicker :initialLat="user.location?.lat || 5.3600"
                                                :initialLng="user.location?.lng || -4.0083"
                                                :initialAddress="user.mainAddress"
                                                @update:location="updateUserLocation" />
                                        </div>

                                        <div class="form-actions">
                                            <button type="button" class="secondary-btn" @click="resetForm"
                                                :disabled="isSubmitting">
                                                Annuler
                                            </button>
                                            <button type="submit" class="primar-btn" :disabled="isSubmitting">
                                                <i class="fas fa-save"></i>
                                                {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'
                                                }}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Onglet Mot de passe -->
                <div v-if="activeTab === 'password'" class="tab-panel">
                    <div class="tab-grid">
                        <div class="tab-column-centered">
                            <div class="form-card card">
                                <div class="card-header">
                                    <div class="card-title">
                                        <i class="fas fa-lock"></i>
                                        Changer le mot de passe
                                    </div>
                                </div>
                                <div class="card-content">
                                    <form @submit.prevent="handleChangePassword" class="password-form">
                                        <div class="form-field">
                                            <label for="currentPassword">
                                                Mot de passe actuel
                                            </label>
                                            <div class="input-with-icon password-input">
                                                <input id="currentPassword"
                                                    :type="showCurrentPassword ? 'text' : 'password'"
                                                    v-model="passwordForm.currentPassword" required />
                                                <i class="input-icon fas fa-lock"></i>
                                                <button type="button" class="password-toggle"
                                                    @click="showCurrentPassword = !showCurrentPassword">
                                                    <i
                                                        :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div class="form-field">
                                            <label for="newPassword">
                                                Nouveau mot de passe
                                            </label>
                                            <div class="input-with-icon password-input">
                                                <input id="newPassword" :type="showNewPassword ? 'text' : 'password'"
                                                    v-model="passwordForm.newPassword" required :minlength="8" />
                                                <i class="input-icon fas fa-key"></i>
                                                <button type="button" class="password-toggle"
                                                    @click="showNewPassword = !showNewPassword">
                                                    <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div class="form-field">
                                            <label for="confirmPassword">
                                                Confirmer le nouveau mot de passe
                                            </label>
                                            <div class="input-with-icon password-input">
                                                <input id="confirmPassword"
                                                    :type="showConfirmPassword ? 'text' : 'password'"
                                                    v-model="passwordForm.confirmPassword" required :minlength="8" />
                                                <i class="input-icon fas fa-key"></i>
                                                <button type="button" class="password-toggle"
                                                    @click="showConfirmPassword = !showConfirmPassword">
                                                    <i
                                                        :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div class="password-strength">
                                            <div class="strength-bar" :class="passwordStrengthClass"></div>
                                            <span class="strength-text">{{ passwordStrengthText }}</span>
                                        </div>

                                        <div class="form-actions">
                                            <button type="button" class="secondary-btn" @click="activeTab = 'personal'">
                                                Retour
                                            </button>
                                            <button type="submit" class="primar-btn" :disabled="!isPasswordValid">
                                                <i class="fas fa-lock"></i>
                                                Changer le mot de passe
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal création de boutique -->
            <div v-if="showCreateShopModal" class="modal-overlay" @click="showCreateShopModal = false">
                <div class="modal-container" @click.stop>
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <i class="fas fa-store"></i>
                            Créer une nouvelle boutique
                        </h3>
                        <button @click="showCreateShopModal = false" class="modal-close-btn">
                            <i class="fas fa-xmark"></i>
                        </button>
                    </div>

                    <div class="modal-scroll-area">
                        <form @submit.prevent="createNewShop" class="create-shop-form">
                            <div class="form-field">
                                <label for="shopName">
                                    Nom de la boutique
                                </label>
                                <div class="input-with-icon">
                                    <input id="shopName" v-model="newShop.name"
                                        placeholder="Ex: Pressing Elite, Laverie Express..." required />
                                    <i class="input-icon fas fa-store"></i>
                                </div>
                            </div>

                            <div class="form-field">
                                <label for="shopCategory">
                                    Catégorie principale
                                </label>
                                <div class="select-with-icon">
                                    <select v-model="newShop.category" id="shopCategory" required>
                                        <option value="">Sélectionnez une catégorie</option>
                                        <option value="pressing-linge">Pressing de linge</option>
                                        <option value="pressing-chaussure">Pressing de chaussure</option>
                                        <option value="fanico">Fanico</option>
                                        <option value="nettoyage">Service de nettoyage</option>
                                        <option value="blanchisserie">Blanchisserie</option>
                                        <option value="laverie">Laverie</option>
                                    </select>
                                    <i class="select-icon fas fa-chevron-down"></i>
                                </div>
                            </div>

                            <!-- CHAMP VILLE AVEC SUGGESTIONS POUR NOUVELLE BOUTIQUE -->
                            <div class="form-field">
                                <label for="newShopCity">
                                    Ville
                                </label>
                                <div class="input-wrapper">
                                    <i class="fas fa-map-marker-alt input-icon"></i>
                                    <input id="newShopCity" name="newShopCity" v-model="newShop.city"
                                        @input="onNewShopCityInput" @focus="showNewShopCitySuggestions = true"
                                        @blur="onNewShopCityBlur"
                                        placeholder="Commencez à taper le nom de votre ville..." required
                                        class="form-input" autocomplete="off" />
                                    <!-- Liste des suggestions -->
                                    <div v-if="showNewShopCitySuggestions && filteredNewShopCities.length > 0"
                                        class="city-suggestions">
                                        <div v-for="city in filteredNewShopCities" :key="city.name"
                                            @mousedown="selectNewShopCity(city.name)" class="suggestion-item">
                                            <i class="fas fa-map-marker-alt suggestion-icon"></i>
                                            <span class="suggestion-text">{{ city.name }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="input-hint">
                                    <i class="fas fa-info-circle"></i>
                                    La boutique peut être dans une autre ville que votre compte principal
                                </div>
                            </div>

                            <div class="form-field">
                                <label for="shopAddress">
                                    Adresse principale
                                </label>
                                <div class="input-with-icon">
                                    <input id="shopAddress" v-model="newShop.mainAddress"
                                        placeholder="Ex: Cocody, 8ème tranche, marché de Cocovico" required />
                                    <i class="input-icon fas fa-map-marker-alt"></i>
                                </div>
                            </div>

                            <div class="form-field">
                                <label>
                                    Localisation sur la carte (optionnel)
                                </label>
                                <div class="location-help">
                                    <div class="help-text">
                                        <i class="fas fa-info-circle"></i>
                                        Positionnez votre boutique sur la carte (non obligatoire)
                                    </div>
                                </div>
                                <MapPicker :initialLat="newShop.location?.lat || 5.3600"
                                    :initialLng="newShop.location?.lng || -4.0083" :initialAddress="newShop.mainAddress"
                                    @update:location="updateNewShopLocation" />
                            </div>

                            <div class="form-field">
                                <label for="shopDescription">
                                    Description
                                </label>
                                <div class="input-with-icon">
                                    <textarea id="shopDescription" v-model="newShop.description" rows="3"
                                        placeholder="Décrivez votre boutique, vos spécialités, vos services..."></textarea>
                                    <i class="input-icon textarea-icon fas fa-file-alt"></i>
                                </div>
                            </div>

                            <div class="shop-preview">
                                <h4>Aperçu de la boutique</h4>
                                <div class="preview-card">
                                    <div class="preview-header">
                                        <i class="fas fa-store preview-icon"></i>
                                        <div class="preview-info">
                                            <h5>{{ newShop.name || 'Nom de la boutique' }}</h5>
                                            <p>{{ newShop.mainAddress || 'Adresse principale' }}</p>
                                            <span class="preview-city">{{ newShop.city || 'Ville' }}</span>
                                        </div>
                                    </div>
                                    <div class="preview-details">
                                        <span class="badge badge-primary">{{ getServiceTypeLabel(newShop.category)
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div class="modal-actions">
                        <button @click="showCreateShopModal = false" class="secondary-btn">
                            Annuler
                        </button>
                        <button @click="createNewShop" class="primar-btn" :disabled="!isNewShopValid">
                            <i class="fas fa-plus"></i>
                            Créer la boutique
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal d'ajout de prestation -->
            <div v-if="showAddPrestationModal" class="modal-overlay" @click="showAddPrestationModal = false">
                <div class="modal-container" @click.stop>
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <i class="fas fa-plus-circle"></i>
                            Ajouter une prestation
                        </h3>
                        <button @click="showAddPrestationModal = false" class="modal-close-btn">
                            <i class="fas fa-xmark"></i>
                        </button>
                    </div>

                    <div class="modal-scroll-area">
                        <div class="available-prestations">
                            <div class="prestations-grid-modal">
                                <!-- GRISER LES PRESTATIONS DÉJÀ AJOUTÉES -->
                                <div v-for="prestation in availablePrestations" :key="prestation.id" :class="[
                                    'prestation-option',
                                    { 'selected': selectedPrestations.includes(prestation.id) },
                                    { 'disabled': isPrestationAlreadyAdded(prestation.id) }
                                ]" @click="togglePrestationSelection(prestation.id)">
                                    <div class="prestation-option-content">
                                        <i :class="prestation.icon" class="prestation-option-icon"></i>
                                        <div class="prestation-option-info">
                                            <h4>{{ prestation.name }}</h4>
                                            <p>{{ prestation.description }}</p>
                                        </div>
                                        <div class="prestation-option-check">
                                            <i class="fas fa-check"
                                                v-if="selectedPrestations.includes(prestation.id) && !isPrestationAlreadyAdded(prestation.id)"></i>
                                            <i class="fas fa-check-double"
                                                v-if="isPrestationAlreadyAdded(prestation.id)"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button @click="showAddPrestationModal = false" class="secondary-btn">
                            Annuler
                        </button>
                        <button @click="addSelectedPrestations" class="primar-btn"
                            :disabled="selectedPrestations.length === 0">
                            <i class="fas fa-plus"></i>
                            Ajouter {{ selectedPrestations.length }} prestation(s)
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal de visualisation de photo -->
            <div v-if="viewedPhoto" class="modal-overlay photo-modal" @click="viewedPhoto = null">
                <div class="modal-container photo-viewer" @click.stop>
                    <div class="modal-header">
                        <h3 class="modal-title">Visualisation de la photo</h3>
                        <button @click="viewedPhoto = null" class="modal-close-btn">
                            <i class="fas fa-xmark"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <img :src="viewedPhoto" alt="Photo visualisée" class="viewed-photo" />
                    </div>
                </div>
            </div>

            <!-- Modal de visualisation de document -->
            <div v-if="viewedDocument" class="modal-overlay document-modal" @click="viewedDocument = null">
                <div class="modal-container document-viewer" @click.stop>
                    <div class="modal-header">
                        <h3 class="modal-title">Visualisation du document</h3>
                        <button @click="viewedDocument = null" class="modal-close-btn">
                            <i class="fas fa-xmark"></i>
                        </button>
                    </div>
                    <div class="modal-content">
                        <img :src="viewedDocument" alt="Document visualisé" class="viewed-document"
                            v-if="isImage(viewedDocument)" />
                        <iframe :src="viewedDocument" class="viewed-document" v-else></iframe>
                    </div>
                </div>
            </div>

            <!-- Modal d'alerte générique -->
            <div v-if="alertModal.show" class="modal-overlay" @click="closeAlertModal">
                <div class="modal-container alert-modal" @click.stop>
                    <div class="modal-header" :class="alertModal.type">
                        <div class="alert-icon">
                            <i :class="getAlertIcon(alertModal.type)"></i>
                        </div>
                        <h3 class="modal-title">{{ alertModal.title }}</h3>
                        <button @click="closeAlertModal" class="modal-close-btn">
                            <i class="fas fa-xmark"></i>
                        </button>
                    </div>
                    <div class="modal-content alert-content">
                        <p>{{ alertModal.message }}</p>
                    </div>
                    <div class="modal-actions">
                        <button @click="closeAlertModal" class="primar-btn">
                            OK
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal de confirmation -->
            <div v-if="confirmModal.show" class="modal-overlay" @click="cancelConfirm">
                <div class="modal-container confirm-modal" @click.stop>
                    <div class="modal-header warning">
                        <div class="alert-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 class="modal-title">{{ confirmModal.title }}</h3>
                        <button @click="cancelConfirm" class="modal-close-btn">
                            <i class="fas fa-xmark"></i>
                        </button>
                    </div>
                    <div class="modal-content confirm-content">
                        <p>{{ confirmModal.message }}</p>
                    </div>
                    <div class="modal-actions">
                        <button @click="cancelConfirm" class="secondary-btn">
                            Annuler
                        </button>
                        <button @click="executeConfirm" class="danger-btn">
                            Confirmer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import DashboardLayout from '@/DashboardOthers/Components/DashboardLayout.vue'
import MapPicker from '@/DashboardOthers/Components/MapPicker.vue'

// ====================================================================
// DONNÉES STATIQUES - VILLES (identique à Inscription.vue)
// ====================================================================

const cities = [
    { name: 'Abidjan' },
    { name: 'Bouaké' },
    { name: 'Daloa' },
    { name: 'Korhogo' },
    { name: 'San-Pédro' },
    { name: 'Yamoussoukro' },
    { name: 'Divo' },
    { name: 'Gagnoa' },
    { name: 'Abengourou' },
    { name: 'Anyama' },
    { name: 'Grand-Bassam' },
    { name: 'Bingerville' },
    { name: 'Agboville' },
    { name: 'Dabou' },
    { name: 'Adzopé' },
    { name: 'Bondoukou' },
    { name: 'Man' },
    { name: 'Oumé' },
    { name: 'Sinfra' },
    { name: 'Katiola' },
    { name: 'Ferkessédougou' },
    { name: 'Odienné' },
    { name: 'Séguéla' },
    { name: 'Toumodi' },
    { name: 'Tiassalé' },
    { name: 'Akoupé' },
    { name: 'Alépé' },
    { name: 'Issia' },
    { name: 'Duékoué' },
    { name: 'Guiglo' },
]

// ====================================================================
// ÉTATS RÉACTIFS
// ====================================================================

// État de l'onglet actif
const activeTab = ref('personal')

// Onglets de navigation
const tabs = [
    { id: 'personal', label: 'Informations personnelles', icon: 'fas fa-user' },
    { id: 'business', label: 'Entreprise', icon: 'fas fa-building' },
    { id: 'password', label: 'Mot de passe', icon: 'fas fa-lock' },
]

// États UI
const isSubmitting = ref(false)
const isVerifying = ref(false)
const kycVerificationStatus = ref('En attente')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const showCreateShopModal = ref(false)
const showAddPrestationModal = ref(false)
const viewedPhoto = ref(null)
const viewedDocument = ref(null)
const currentShopIndex = ref(0)
const selectedPrestations = ref([])
const fieldErrors = ref({})
const profilePhoto = ref(null)

// Modals système
const alertModal = reactive({
    show: false,
    type: 'info', // info, success, warning, error
    title: '',
    message: ''
})

const confirmModal = reactive({
    show: false,
    title: '',
    message: '',
    onConfirm: null
})

// Références aux inputs
const avatarInput = ref(null)
const identityPhotoInput = ref(null)
const cniFrontInput = ref(null)
const cniBackInput = ref(null)
const shopPhotosInput = ref(null)

// ====================================================================
// ÉTATS POUR LES CHAMPS VILLE AVEC SUGGESTIONS
// ====================================================================

// Pour le profil utilisateur
const showCitySuggestions = ref(false)
const citySearchTerm = ref('')

// Pour la boutique active
const showShopCitySuggestions = ref(false)
const shopCitySearchTerm = ref('')

// Pour la nouvelle boutique
const showNewShopCitySuggestions = ref(false)
const newShopCitySearchTerm = ref('')

// Pour le service (Fanico/Nettoyage)
const showServiceCitySuggestions = ref(false)
const serviceCitySearchTerm = ref('')

// Computed properties pour les villes filtrées
const filteredCities = computed(() => {
    if (!citySearchTerm.value) {
        return cities.slice(0, 8) // Afficher les 8 premières villes par défaut
    }

    const searchTerm = citySearchTerm.value.toLowerCase()
    return cities
        .filter(city => city.name.toLowerCase().includes(searchTerm))
        .slice(0, 10) // Limiter à 10 résultats
})

const filteredShopCities = computed(() => {
    if (!shopCitySearchTerm.value) {
        return cities.slice(0, 8)
    }

    const searchTerm = shopCitySearchTerm.value.toLowerCase()
    return cities
        .filter(city => city.name.toLowerCase().includes(searchTerm))
        .slice(0, 10)
})

const filteredNewShopCities = computed(() => {
    if (!newShopCitySearchTerm.value) {
        return cities.slice(0, 8)
    }

    const searchTerm = newShopCitySearchTerm.value.toLowerCase()
    return cities
        .filter(city => city.name.toLowerCase().includes(searchTerm))
        .slice(0, 10)
})

const filteredServiceCities = computed(() => {
    if (!serviceCitySearchTerm.value) {
        return cities.slice(0, 8)
    }

    const searchTerm = serviceCitySearchTerm.value.toLowerCase()
    return cities
        .filter(city => city.name.toLowerCase().includes(searchTerm))
        .slice(0, 10)
})

// ====================================================================
// MÉTHODES POUR LA GESTION DES CHAMPS VILLE
// ====================================================================

// Pour le profil utilisateur
const onCityInput = (event) => {
    const target = event.target
    citySearchTerm.value = target.value
    showCitySuggestions.value = true
}

const onCityBlur = () => {
    setTimeout(() => {
        showCitySuggestions.value = false
    }, 200)
}

const selectCity = (cityName) => {
    profileForm.city = cityName
    citySearchTerm.value = cityName
    showCitySuggestions.value = false
}

// Pour la boutique active
const onShopCityInput = (event) => {
    const target = event.target
    shopCitySearchTerm.value = target.value
    showShopCitySuggestions.value = true
}

const onShopCityBlur = () => {
    setTimeout(() => {
        showShopCitySuggestions.value = false
    }, 200)
}

const selectShopCity = (cityName) => {
    if (activeShop.value) {
        activeShop.value.city = cityName
        shopCitySearchTerm.value = cityName
        showShopCitySuggestions.value = false
    }
}

// Pour la nouvelle boutique
const onNewShopCityInput = (event) => {
    const target = event.target
    newShopCitySearchTerm.value = target.value
    showNewShopCitySuggestions.value = true
}

const onNewShopCityBlur = () => {
    setTimeout(() => {
        showNewShopCitySuggestions.value = false
    }, 200)
}

const selectNewShopCity = (cityName) => {
    newShop.city = cityName
    newShopCitySearchTerm.value = cityName
    showNewShopCitySuggestions.value = false
}

// Pour le service (Fanico/Nettoyage)
const onServiceCityInput = (event) => {
    const target = event.target
    serviceCitySearchTerm.value = target.value
    showServiceCitySuggestions.value = true
}

const onServiceCityBlur = () => {
    setTimeout(() => {
        showServiceCitySuggestions.value = false
    }, 200)
}

const selectServiceCity = (cityName) => {
    user.value.city = cityName
    serviceCitySearchTerm.value = cityName
    showServiceCitySuggestions.value = false
}

// ====================================================================
// FONCTIONS MODALES
// ====================================================================

const showAlert = (message, type = 'info', title = '') => {
    alertModal.show = true
    alertModal.type = type
    alertModal.title = title || getTitleForType(type)
    alertModal.message = message
}

const closeAlertModal = () => {
    alertModal.show = false
    alertModal.type = 'info'
    alertModal.title = ''
    alertModal.message = ''
}

const showConfirm = (message, onConfirm, title = 'Confirmation') => {
    confirmModal.show = true
    confirmModal.title = title
    confirmModal.message = message
    confirmModal.onConfirm = onConfirm
}

const executeConfirm = () => {
    if (confirmModal.onConfirm) {
        confirmModal.onConfirm()
    }
    cancelConfirm()
}

const cancelConfirm = () => {
    confirmModal.show = false
    confirmModal.title = ''
    confirmModal.message = ''
    confirmModal.onConfirm = null
}

const getTitleForType = (type) => {
    const titles = {
        info: 'Information',
        success: 'Succès',
        warning: 'Attention',
        error: 'Erreur'
    }
    return titles[type] || 'Information'
}

const getAlertIcon = (type) => {
    const icons = {
        info: 'fas fa-info-circle',
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle'
    }
    return icons[type] || 'fas fa-info-circle'
}

// Computed pour déterminer si l'utilisateur est Fanico ou Nettoyage
const isFanicoOrNettoyage = computed(() => {
    return user.value.serviceType === 'fanico' || user.value.serviceType === 'nettoyage'
})

// Fonction pour récupérer l'utilisateur actuel depuis localStorage ou données mock
const getCurrentUser = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')

    // Si l'utilisateur existe dans le localStorage, utiliser ses vraies données
    if (currentUser.id) {
        return {
            id: currentUser.id,
            first_name: currentUser.first_name || currentUser.name?.split(' ')[0] || '',
            last_name: currentUser.last_name || currentUser.name?.split(' ').slice(1).join(' ') || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            city: currentUser.city || '',
            isVerified: currentUser.isVerified || false,
            statut_kyc: currentUser.statut_kyc || 'non_verifie',
            date_inscription: currentUser.date_inscription || currentUser.joinDate || new Date().toISOString(),
            documents: currentUser.documents || {
                identityPhoto: null,
                identityCard: null,
                identityBack: null
            },
            // AJOUT IMPORTANT : Récupérer le type de service réel
            serviceType: currentUser.serviceType || currentUser.type || '',
            // Champs supplémentaires pour Fanico/Nettoyage
            serviceName: currentUser.serviceName || '',
            zone_couverture: currentUser.zone_couverture || '',
            rayon_km: currentUser.rayon_km || 5,
            mainAddress: currentUser.mainAddress || '',
            description: currentUser.description || '',
            location: currentUser.location || { lat: 5.3600, lng: -4.0083 }
        }
    }

    // Fallback seulement si vraiment aucun utilisateur trouvé
    return {
        id: 'USR001',
        first_name: 'Jean',
        last_name: 'Dupont',
        email: '',
        phone: '+2250700000000',
        city: 'Abidjan',
        isVerified: false,
        statut_kyc: 'non_verifie',
        date_inscription: new Date().toISOString(),
        documents: {
            identityPhoto: null,
            identityCard: null,
            identityBack: null
        },
        serviceType: '', // Laisser vide au lieu d'une valeur par défaut
        serviceName: '',
        zone_couverture: '',
        rayon_km: 5,
        mainAddress: '',
        description: '',
        location: { lat: 5.3600, lng: -4.0083 }
    }
}

// Données utilisateur avec champs KYC
const user = ref(getCurrentUser())

// Formulaire profil
const profileForm = reactive({
    first_name: user.value.first_name,
    last_name: user.value.last_name,
    email: user.value.email,
    phone: user.value.phone,
    city: user.value.city
})

// Formulaire mot de passe
const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// Boutiques utilisateur
const userShops = ref([])

// Nouvelle boutique
const newShop = reactive({
    name: '',
    category: '',
    city: '',
    mainAddress: '',
    description: '',
    location: null,
    zone_couverture: '',
    rayon_km: 5
})

// Prestations disponibles
const availablePrestations = ref([
    { id: 'pressing-linge', name: 'Pressing de linge', description: 'Nettoyage à sec de vêtements', icon: 'fas fa-tshirt' },
    { id: 'pressing-chaussure', name: 'Pressing de chaussure', description: 'Nettoyage et entretien de chaussures', icon: 'fas fa-shoe-prints' },
    { id: 'fanico', name: 'Fanico', description: 'Repassage traditionnel', icon: 'fas fa-fire' },
    { id: 'nettoyage', name: 'Service de nettoyage', description: 'Nettoyage professionnel', icon: 'fas fa-broom' },
    { id: 'blanchisserie', name: 'Blanchisserie', description: 'Blanchiment et détachage', icon: 'fas fa-soap' },
    { id: 'laverie', name: 'Laverie', description: 'Service libre-service', icon: 'fas fa-washing-machine' }
])

// Computed properties
const fullName = computed(() => {
    return `${user.value.first_name} ${user.value.last_name}`.trim() || 'Utilisateur'
})

const userInitials = computed(() => {
    if (user.value.first_name && user.value.last_name) {
        return `${user.value.first_name.charAt(0)}${user.value.last_name.charAt(0)}`.toUpperCase()
    }
    return 'U'
})

const activeShop = computed(() => {
    return userShops.value[currentShopIndex.value] || null
})

const shopPrestationsDisplay = computed(() => {
    if (!activeShop.value) return []
    return availablePrestations.value.filter(p =>
        activeShop.value.prestations.includes(p.id)
    )
})

const userStats = computed(() => {
    return {
        totalOrders: 156,
        successRate: 98,
        responseTime: 15
    }
})

const passwordStrength = computed(() => {
    const password = passwordForm.newPassword
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
})

const passwordStrengthClass = computed(() => {
    const strength = passwordStrength.value
    if (strength === 0) return 'strength-bar'
    if (strength === 1) return 'strength-1'
    if (strength === 2) return 'strength-2'
    if (strength === 3) return 'strength-3'
    return 'strength-4'
})

const passwordStrengthText = computed(() => {
    const strength = passwordStrength.value
    if (strength === 0) return 'Saisissez un mot de passe'
    if (strength === 1) return 'Très faible'
    if (strength === 2) return 'Faible'
    if (strength === 3) return 'Moyen'
    return 'Fort'
})

const isPasswordValid = computed(() => {
    return passwordForm.newPassword &&
        passwordForm.confirmPassword &&
        passwordForm.newPassword === passwordForm.confirmPassword &&
        passwordStrength.value >= 3
})

const canSubmitKyc = computed(() => {
    const docs = user.value.documents
    return docs?.identityPhoto && docs?.identityCard && docs?.identityBack
})

const isNewShopValid = computed(() => {
    return newShop.name &&
        newShop.category &&
        newShop.city &&
        newShop.mainAddress
})

// Watchers
watch(activeTab, (newTab) => {
    localStorage.setItem('lastActiveProfileTab', newTab)
})

watch(currentShopIndex, (newIndex) => {
    loadShopDataIntoForms()
})

// Lifecycle hooks
onMounted(() => {
    initializeData()
    loadLastActiveTab()
    clearProfileCache()
})

// Méthodes
const initializeData = () => {
    user.value = getCurrentUser()

    // Utiliser le serviceType réel de l'utilisateur pour la boutique par défaut
    const userServiceType = user.value.serviceType || 'pressing-linge'

    // CORRECTION: Stocker les boutiques par utilisateur avec l'ID
    const savedShops = localStorage.getItem(`userShops_${user.value.id}`)
    if (savedShops) {
        userShops.value = JSON.parse(savedShops)
    } else {
        // Ne créer une boutique par défaut que si c'est nettoyage
        if (user.value.serviceType === 'nettoyage') {
            const defaultShop = {
                id: 'SHOP_' + Date.now(),
                name: `${user.value.first_name} ${user.value.last_name}`.trim() || 'Ma Boutique',
                category: userServiceType, // ← Utiliser le vrai serviceType
                city: user.value.city || 'Abidjan',
                mainAddress: '',
                zone_couverture: '',
                rayon_km: 5,
                description: '',
                location: { lat: 5.3600, lng: -4.0083 },
                documents: {
                    photos: []
                },
                prestations: [userServiceType], // ← Utiliser le vrai serviceType
                mainPrestation: userServiceType // ← Utiliser le vrai serviceType
            }

            userShops.value = [defaultShop]
            saveShopsToStorage()
        }
    }

    loadShopDataIntoForms()
}

const loadShopDataIntoForms = () => {
    if (activeShop.value) {
        Object.assign(profileForm, {
            first_name: user.value.first_name,
            last_name: user.value.last_name,
            email: user.value.email,
            phone: user.value.phone,
            city: user.value.city
        })
    }
}

const clearProfileCache = () => {
    const keysToRemove = [
        'profileFormDraft',
        'profileTempData'
    ]

    keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
    })
}

const loadLastActiveTab = () => {
    const lastTab = localStorage.getItem('lastActiveProfileTab')
    if (lastTab && tabs.some(tab => tab.id === lastTab)) {
        activeTab.value = lastTab
    }
}

const saveUserToStorage = () => {
    localStorage.setItem('currentUser', JSON.stringify(user.value))

    const allUsers = JSON.parse(localStorage.getItem('presso_users') || '[]')
    const userIndex = allUsers.findIndex(u => u.id === user.value.id)
    if (userIndex !== -1) {
        allUsers[userIndex] = user.value
        localStorage.setItem('presso_users', JSON.stringify(allUsers))
    }
}

const saveShopsToStorage = () => {
    localStorage.setItem('userShops', JSON.stringify(userShops.value))
}

const getServiceTypeLabel = (type) => {
    const labels = {
        'pressing-linge': 'Pressing de linge',
        'pressing-chaussure': 'Pressing de chaussure',
        'fanico': 'Fanico',
        'nettoyage': 'Service de nettoyage',
        'blanchisserie': 'Blanchisserie',
        'laverie': 'Laverie'
    }
    return labels[type] || type
}

const getKycStatusClass = (status) => {
    const classes = {
        pending: 'text-warning',
        verified: 'text-success',
        rejected: 'text-danger',
        'non_verifie': 'text-secondary',
        'en_cours': 'text-warning'
    }
    return classes[status] || 'text-secondary'
}

const getKycStatusLabel = (status) => {
    const labels = {
        pending: 'En attente',
        verified: 'Vérifié',
        rejected: 'Rejeté',
        'non_verifie': 'Non vérifié',
        'en_cours': 'En cours de vérification'
    }
    return labels[status] || 'Non vérifié'
}

const formatDate = (date) => {
    if (!date) return 'Non spécifiée'
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const openAvatarUpload = () => {
    avatarInput.value?.click()
}

const handleAvatarUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            profilePhoto.value = e.target.result
            console.log('Avatar uploaded:', e.target.result)
        }
        reader.readAsDataURL(file)
    }
}

const triggerFileUpload = (type) => {
    const refs = {
        'identityPhoto': identityPhotoInput,
        'identityCard': cniFrontInput,
        'identityBack': cniBackInput
    }
    refs[type]?.value?.click()
}

const handleUserDocumentUpload = (event, documentType) => {
    const file = event.target.files[0]
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showAlert('Le fichier est trop volumineux. Maximum 5MB autorisé.', 'error', 'Erreur')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            if (!user.value.documents) {
                user.value.documents = {}
            }
            user.value.documents[documentType] = e.target.result

            if (documentType === 'identityPhoto') {
                profilePhoto.value = e.target.result
            }

            saveUserToStorage()
        }
        reader.readAsDataURL(file)
    }
}

const removeUserDocument = (documentType) => {
    if (user.value?.documents) {
        user.value.documents[documentType] = null

        if (documentType === 'identityPhoto' && profilePhoto.value === user.value.documents[documentType]) {
            profilePhoto.value = null
        }

        saveUserToStorage()
    }
}

const viewDocument = (documentUrl) => {
    viewedDocument.value = documentUrl
}

const isImage = (url) => {
    return url && (url.startsWith('data:image') || /.(jpg|jpeg|png|gif)$/i.test(url))
}

const submitKycVerification = () => {
    if (!canSubmitKyc.value) return

    isVerifying.value = true
    kycVerificationStatus.value = 'Vérification en cours...'

    let countdown = 10
    const intervalId = setInterval(() => {
        countdown--
        kycVerificationStatus.value = `Vérification en cours... ${countdown}s`
    }, 1000)

    setTimeout(() => {
        clearInterval(intervalId)

        user.value.statut_kyc = 'verified'
        user.value.isVerified = true

        isVerifying.value = false
        kycVerificationStatus.value = 'Vérifié'
        saveUserToStorage()

        showAlert('Votre compte a été vérifié avec succès. Vous pouvez maintenant créer des boutiques supplémentaires et ajouter des prestations.', 'success', "Validation réussie")
    }, 10000)
}

const attemptCreateShop = () => {
    if (userShops.value.length === 0) {
        showCreateShopModal.value = true
        return
    }

    if (!user.value.isVerified) {
        showAlert("Vous devez vérifier votre compte (KYC) pour créer des boutiques supplémentaires. Rendez-vous dans l'onglet 'Informations personnelles.", 'warning', "Vérification KYC requise")
        return
    }

    showCreateShopModal.value = true
}

const attemptAddPrestation = () => {
    if (!user.value.isVerified && activeShop.value && activeShop.value.prestations.length >= 1) {
        showAlert("Vous devez vérifier votre compte (KYC) pour ajouter des prestations supplémentaires. Rendez-vous dans l'onglet 'Informations personnelles.", 'warning', "Vérification KYC requise")
        return
    }

    showAddPrestationModal.value = true
}

const switchShop = (index) => {
    currentShopIndex.value = index
}

const updateNewShopLocation = (locationData) => {
    newShop.location = {
        lat: locationData.lat,
        lng: locationData.lng
    }
    if (locationData.address) {
        newShop.mainAddress = locationData.address
    }
}

const updateShopLocation = (locationData) => {
    if (activeShop.value) {
        activeShop.value.location = {
            lat: locationData.lat,
            lng: locationData.lng
        }
        if (locationData.address) {
            activeShop.value.mainAddress = locationData.address
        }
        saveShopsToStorage()
    }
}

// Nouvelle méthode pour mettre à jour la localisation de l'utilisateur (Fanico/Nettoyage)
const updateUserLocation = (locationData) => {
    user.value.location = {
        lat: locationData.lat,
        lng: locationData.lng
    }
    if (locationData.address) {
        user.value.mainAddress = locationData.address
    }
    saveUserToStorage()
}

const createNewShop = () => {
    if (!isNewShopValid.value) return

    if (userShops.value.length > 0 && !user.value.isVerified) {
        showAlert('Vous devez vérifier votre compte (KYC) pour créer des boutiques supplémentaires.', 'warning', 'Vérification KYC requise')
        return
    }

    const newShopData = {
        id: 'SHOP' + Date.now(),
        name: newShop.name,
        category: newShop.category,
        city: newShop.city,
        mainAddress: newShop.mainAddress,
        zone_couverture: newShop.zone_couverture || '',
        rayon_km: newShop.rayon_km || 5,
        description: newShop.description,
        location: newShop.location || { lat: 5.3600, lng: -4.0083 },
        documents: {
            photos: []
        },
        prestations: [newShop.category],
        mainPrestation: newShop.category
    }

    userShops.value.push(newShopData)
    currentShopIndex.value = userShops.value.length - 1
    saveShopsToStorage()
    showCreateShopModal.value = false
    resetNewShopForm()

    showAlert('Boutique créée avec succès!', 'success', 'Succès')
}

const resetNewShopForm = () => {
    Object.assign(newShop, {
        name: '',
        category: '',
        city: '',
        mainAddress: '',
        description: '',
        location: null,
        zone_couverture: '',
        rayon_km: 5
    })
}

const editShop = (index) => {
    currentShopIndex.value = index
}

const confirmDeleteShop = (shop) => {
    if (userShops.value.length <= 1) {
        showAlert('Vous devez avoir au moins une boutique.', 'warning', 'Attention')
        return
    }

    showConfirm(
        `Êtes-vous sûr de vouloir supprimer la boutique "${shop.name}" ?`,
        () => {
            const index = userShops.value.indexOf(shop)
            if (index > -1) {
                userShops.value.splice(index, 1)
                if (currentShopIndex.value >= index) {
                    currentShopIndex.value = Math.max(0, currentShopIndex.value - 1)
                }
                saveShopsToStorage()
                showAlert('Boutique supprimée avec succès.', 'success', 'Succès')
            }
        },
        'Supprimer la boutique'
    )
}

const getTotalShopPhotos = (shop) => {
    return (shop.documents?.photos?.length || 0)
}

const triggerShopPhotosUpload = () => {
    shopPhotosInput.value?.click()
}

const handleShopPhotosUpload = (event) => {
    const files = Array.from(event.target.files)
    if (files.length > 0 && activeShop.value) {
        if (!activeShop.value.documents) {
            activeShop.value.documents = { photos: [] }
        }
        if (!activeShop.value.documents.photos) {
            activeShop.value.documents.photos = []
        }

        let hasError = false
        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                if (!hasError) {
                    showAlert(`Le fichier ${file.name} est trop volumineux. Maximum 5MB autorisé.`, 'error', 'Erreur')
                    hasError = true
                }
                return
            }

            const reader = new FileReader()
            reader.onload = (e) => {
                activeShop.value.documents.photos.push(e.target.result)
                saveShopsToStorage()
            }
            reader.readAsDataURL(file)
        })

        event.target.value = ''
    }
}

const removeShopPhoto = (photoIndex) => {
    if (activeShop.value?.documents?.photos) {
        activeShop.value.documents.photos.splice(photoIndex, 1)
        saveShopsToStorage()
    }
}

const viewPhoto = (photoUrl) => {
    viewedPhoto.value = photoUrl
}

const isPrestationAlreadyAdded = (prestationId) => {
    return activeShop.value?.prestations?.includes(prestationId) || false
}

const togglePrestationSelection = (prestationId) => {
    if (isPrestationAlreadyAdded(prestationId)) {
        return
    }

    const index = selectedPrestations.value.indexOf(prestationId)
    if (index > -1) {
        selectedPrestations.value.splice(index, 1)
    } else {
        selectedPrestations.value.push(prestationId)
    }
}

const addSelectedPrestations = () => {
    if (activeShop.value && selectedPrestations.value.length > 0) {
        selectedPrestations.value.forEach(prestationId => {
            if (!activeShop.value.prestations.includes(prestationId)) {
                activeShop.value.prestations.push(prestationId)
            }
        })
        saveShopsToStorage()
        showAddPrestationModal.value = false
        selectedPrestations.value = []
    }
}

const confirmRemovePrestation = (prestationId) => {
    if (activeShop.value && activeShop.value.prestations.length > 1) {
        showConfirm(
            'Êtes-vous sûr de vouloir supprimer cette prestation ?',
            () => {
                const index = activeShop.value.prestations.indexOf(prestationId)
                if (index > -1) {
                    activeShop.value.prestations.splice(index, 1)
                    saveShopsToStorage()
                    showAlert('Prestation supprimée avec succès.', 'success', 'Succès')
                }
            },
            'Supprimer la prestation'
        )
    } else {
        showAlert('Vous devez avoir au moins une prestation.', 'warning', 'Attention')
    }
}

const canDeletePrestation = (prestationId) => {
    return activeShop.value.prestations.length > 1 && prestationId !== activeShop.value.mainPrestation
}

const handleUpdateProfile = async () => {
    fieldErrors.value = {}
    isSubmitting.value = true

    if (!profileForm.first_name.trim()) {
        fieldErrors.value.first_name = 'Le prénom est requis'
    }
    if (!profileForm.last_name.trim()) {
        fieldErrors.value.last_name = 'Le nom est requis'
    }
    if (profileForm.email && !isValidEmail(profileForm.email)) {
        fieldErrors.value.email = 'Email invalide'
    }

    if (Object.keys(fieldErrors.value).length > 0) {
        isSubmitting.value = false
        return
    }

    try {
        await new Promise(resolve => setTimeout(resolve, 1500))

        Object.assign(user.value, profileForm)
        saveUserToStorage()

        showAlert('Profil mis à jour avec succès!', 'success', 'Succès')
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error)
        showAlert('Erreur lors de la mise à jour du profil', 'error', 'Erreur')
    } finally {
        isSubmitting.value = false
    }
}

const handleUpdateBusiness = async () => {
    isSubmitting.value = true

    try {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (user.serviceType === 'nettoyage') {
            // Sauvegarder les données boutique pour le service nettoyage
            saveShopsToStorage()
        } else {
            // Sauvegarder les données utilisateur pour les autres services
            saveUserToStorage()
        }

        showAlert("Paramètres de l'entreprise mis à jour avec succès!", 'success', 'Succès')
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error)
        showAlert('Erreur lors de la mise à jour', 'error', 'Erreur')
    } finally {
        isSubmitting.value = false
    }
}

const handleChangePassword = async () => {
    if (!isPasswordValid.value) return

    isSubmitting.value = true

    try {
        await new Promise(resolve => setTimeout(resolve, 1500))

        Object.assign(passwordForm, {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        })

        showAlert('Mot de passe changé avec succès!', 'success', 'Succès')
        activeTab.value = 'personal'
    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error)
        showAlert('Erreur lors du changement de mot de passe', 'error', 'Erreur')
    } finally {
        isSubmitting.value = false
    }
}

const resetForm = () => {
    Object.assign(profileForm, user.value)
    fieldErrors.value = {}
}

const isValidEmail = (email) => {
    if (!email) return false; // Changé de true à false pour plus de cohérence

    // Regex améliorée pour les emails
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return emailRegex.test(email.trim()); // trim() pour ignorer les espaces
}

const exportProfileData = () => {
    const data = {
        user: user.value,
        shops: userShops.value,
        exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
</script>

<style scoped src="@/DashboardOthers/Assets/Styles/Profile.css"></style>