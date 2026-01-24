<template>
  <DashboardLayout>
    <div class="services-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Mes Services</h1>
            <p class="page-description">Gérez les services que vous proposez à vos clients</p>
          </div>
          <button @click="openModal()" class="add-service-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Ajouter un service
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="servicesStore.isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des services...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="servicesStore.error" class="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ servicesStore.error }}</p>
        <button @click="loadServices" class="btn-retry">Réessayer</button>
      </div>

      <!-- Services Grid -->
      <div v-else class="services-grid">
        <div
          v-for="service in servicesStore.providerServices"
          :key="service.id"
          :class="['service-card', { 'service-card-inactive': !service.is_available }]"
        >
          <div class="service-header">
            <div class="service-header-content">
              <div class="service-title-section">
                <h3 class="service-name">{{ service.service.label }}</h3>
                <span class="badge-mode">
                  {{ getModeTarifLabel(service.service.mode_tarif) }}
                </span>
              </div>
              <div class="toggle-container">
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    :checked="service.is_available"
                    @change="toggleAvailability(service)"
                    :disabled="isToggling === service.id"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="service-body">
            <p class="service-description">{{ service.service.description || 'Aucune description' }}</p>

            <div class="service-info-grid">
              <div class="info-item">
                <div class="info-icon-wrapper price-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Prix de base</span>
                  <span class="info-price">{{ formatPrice(service.prix_base) }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon-wrapper duration-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Délai</span>
                  <span class="info-text">{{ service.delai }}h</span>
                </div>
              </div>
            </div>

            <div class="service-actions">
              <button @click="openModal(service)" class="action-btn action-btn-edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Modifier
              </button>
              <button @click="confirmDelete(service)" class="action-btn action-btn-delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="servicesStore.providerServices.length === 0" class="empty-state">
          <div class="empty-content">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div class="empty-text">
              <h3 class="empty-title">Aucun service configuré</h3>
              <p class="empty-message">Commencez par ajouter votre premier service</p>
            </div>
            <button @click="openModal()" class="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Ajouter votre premier service
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Add/Edit Service -->
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">
              {{ editingService ? 'Modifier le service' : 'Ajouter un service' }}
            </h2>
            <button @click="closeModal" class="modal-close-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="modal-body">
            <!-- Mode création : champs service -->
            <div v-if="!editingService" class="form-section">
              <div class="form-group">
                <label class="form-label">Nom du service *</label>
                <input 
                  v-model="formData.label" 
                  type="text"
                  placeholder="Ex: Nettoyage à sec, Repassage..." 
                  class="form-input"
                  :class="{ 'form-input-error': errors.label }"
                />
                <span v-if="errors.label" class="error-text">{{ errors.label }}</span>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Type de tarification *</label>
                  <select v-model="formData.mode_tarif" class="form-select">
                    <option value="piece">À la pièce</option>
                    <option value="kilo">Au kilo</option>
                    <option value="forfait">Forfait</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Durée estimée (heures) *</label>
                  <input 
                    v-model.number="formData.duree_estimee" 
                    type="number"
                    min="1"
                    placeholder="24"
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea
                  v-model="formData.description"
                  placeholder="Décrivez votre service..."
                  rows="2"
                  class="form-textarea"
                ></textarea>
              </div>
            </div>

            <!-- Champs communs (création et édition) -->
            <div class="form-section">
              <h3 v-if="!editingService" class="form-section-title">Tarification</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Prix de base (FCFA) *</label>
                  <input
                    v-model.number="formData.prix_base"
                    type="number"
                    min="0"
                    step="50"
                    placeholder="1000"
                    class="form-input"
                    :class="{ 'form-input-error': errors.prix_base }"
                  />
                  <span v-if="errors.prix_base" class="error-text">{{ errors.prix_base }}</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Délai (heures) *</label>
                  <input
                    v-model.number="formData.delai"
                    type="number"
                    min="1"
                    placeholder="48"
                    class="form-input"
                    :class="{ 'form-input-error': errors.delai }"
                  />
                  <span v-if="errors.delai" class="error-text">{{ errors.delai }}</span>
                </div>
              </div>

              <div class="form-group">
                <label class="toggle-label">
                  <input
                    type="checkbox"
                    v-model="formData.is_available"
                    class="toggle-checkbox"
                  />
                  <span class="toggle-switch-inline"></span>
                  <span>Service disponible</span>
                </label>
              </div>
            </div>
          </form>
          
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-cancel">
              Annuler
            </button>
            <button 
              type="submit"
              @click="handleSubmit" 
              class="btn-primary"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="spinner-small"></span>
              {{ editingService ? 'Enregistrer' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
        <div class="modal-container modal-confirm">
          <div class="modal-header">
            <h2 class="modal-title warning">Confirmer la suppression</h2>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer le service <strong>"{{ serviceToDelete?.service.label }}"</strong> ?</p>
            <p class="warning-text">Cette action est irréversible.</p>
          </div>
          <div class="modal-footer">
            <button @click="cancelDelete" class="btn-cancel">Annuler</button>
            <button @click="deleteService" class="btn-danger" :disabled="isDeleting">
              <span v-if="isDeleting" class="spinner-small"></span>
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <Transition name="toast">
        <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
          <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ toast.message }}</span>
        </div>
      </Transition>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import DashboardLayout from '@/Components/ComponentsCommun/DashboardLayout.vue'
import { useServicesStore, type ProviderService } from '@/stores/services'

const servicesStore = useServicesStore()

// State
const isModalOpen = ref(false)
const editingService = ref<ProviderService | null>(null)
const showDeleteConfirm = ref(false)
const serviceToDelete = ref<ProviderService | null>(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const isToggling = ref<string | null>(null)

const formData = reactive({
  label: '',
  description: '',
  mode_tarif: 'piece' as 'piece' | 'kilo' | 'forfait',
  duree_estimee: 24,
  prix_base: 1000,
  delai: 48,
  is_available: true,
})

const errors = reactive({
  label: '',
  prix_base: '',
  delai: '',
})

const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
})

// Methods
function getModeTarifLabel(mode: string): string {
  const labels: Record<string, string> = {
    piece: 'À la pièce',
    kilo: 'Au kilo',
    forfait: 'Forfait',
  }
  return labels[mode] || mode
}

function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA'
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 4000)
}

async function loadServices() {
  await servicesStore.fetchServices()
}

function openModal(service?: ProviderService) {
  if (service) {
    editingService.value = service
    formData.prix_base = parseFloat(service.prix_base)
    formData.delai = service.delai
    formData.is_available = service.is_available
  } else {
    editingService.value = null
    formData.label = ''
    formData.description = ''
    formData.mode_tarif = 'piece'
    formData.duree_estimee = 24
    formData.prix_base = 1000
    formData.delai = 48
    formData.is_available = true
  }
  errors.label = ''
  errors.prix_base = ''
  errors.delai = ''
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  editingService.value = null
}

function validateForm(): boolean {
  let valid = true
  errors.label = ''
  errors.prix_base = ''
  errors.delai = ''

  if (!editingService.value) {
    if (!formData.label.trim()) {
      errors.label = 'Le nom du service est obligatoire'
      valid = false
    }
  }

  if (!formData.prix_base || formData.prix_base < 0) {
    errors.prix_base = 'Le prix doit être positif'
    valid = false
  }

  if (!formData.delai || formData.delai < 1) {
    errors.delai = 'Le délai doit être au moins 1 heure'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    if (editingService.value) {
      // Mode édition
      const result = await servicesStore.updateService(editingService.value.id, {
        prix_base: formData.prix_base,
        delai: formData.delai,
        is_available: formData.is_available,
      })
      
      if (result.success) {
        showToast('Service modifié avec succès')
        closeModal()
      } else {
        showToast(result.error || 'Erreur lors de la modification', 'error')
      }
    } else {
      // Mode création
      const result = await servicesStore.createService({
        label: formData.label,
        description: formData.description,
        mode_tarif: formData.mode_tarif,
        duree_estimee: formData.duree_estimee,
        prix_base: formData.prix_base,
        delai: formData.delai,
        is_available: formData.is_available,
      })
      
      if (result.success) {
        showToast('Service ajouté avec succès')
        closeModal()
      } else {
        showToast(result.error || 'Erreur lors de la création', 'error')
      }
    }
  } finally {
    isSubmitting.value = false
  }
}

async function toggleAvailability(service: ProviderService) {
  isToggling.value = service.id
  
  const result = await servicesStore.toggleServiceAvailability(service.id)
  
  if (result.success) {
    const status = service.is_available ? 'désactivé' : 'activé'
    showToast(`Service ${status}`)
  } else {
    showToast(result.error || 'Erreur', 'error')
  }
  
  isToggling.value = null
}

function confirmDelete(service: ProviderService) {
  serviceToDelete.value = service
  showDeleteConfirm.value = true
}

function cancelDelete() {
  serviceToDelete.value = null
  showDeleteConfirm.value = false
}

async function deleteService() {
  if (!serviceToDelete.value) return
  
  isDeleting.value = true
  
  const result = await servicesStore.deleteService(serviceToDelete.value.id)
  
  if (result.success) {
    showToast('Service supprimé')
    cancelDelete()
  } else {
    showToast(result.error || 'Erreur lors de la suppression', 'error')
  }
  
  isDeleting.value = false
}

// Lifecycle
onMounted(() => {
  loadServices()
})
</script>

<style scoped>
.services-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.page-description {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.add-service-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #37A1EF;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.add-service-btn:hover {
  background: #2b8dd4;
}

/* Loading & Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #37A1EF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-retry {
  margin-top: 16px;
  padding: 8px 16px;
  background: #37A1EF;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.service-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.service-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.service-card-inactive {
  opacity: 0.6;
}

.service-header {
  padding: 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.service-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.service-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 6px 0;
}

.badge-mode {
  display: inline-block;
  padding: 2px 8px;
  background: #dbeafe;
  color: #1e40af;
  font-size: 0.75rem;
  border-radius: 4px;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #10b981;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Service Body */
.service-body {
  padding: 16px;
}

.service-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.service-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-icon-wrapper.price-icon {
  background: #dcfce7;
  color: #16a34a;
}

.info-icon-wrapper.duration-icon {
  background: #dbeafe;
  color: #2563eb;
}

.info-label {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
}

.info-price {
  font-weight: 600;
  color: #10b981;
}

.info-text {
  font-weight: 500;
  color: #374151;
}

/* Actions */
.service-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn-edit {
  background: #f3f4f6;
  color: #374151;
}

.action-btn-edit:hover {
  background: #e5e7eb;
}

.action-btn-delete {
  background: #fef2f2;
  color: #dc2626;
}

.action-btn-delete:hover {
  background: #fee2e2;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  padding: 60px 20px;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  color: #9ca3af;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.empty-message {
  color: #6b7280;
  margin: 0;
}

/* Modal */
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

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-confirm {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-title.warning {
  color: #dc2626;
}

.modal-close-btn {
  padding: 4px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
}

.modal-close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}

/* Form */
.form-section {
  margin-bottom: 20px;
}

.form-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #37A1EF;
  box-shadow: 0 0 0 3px rgba(55, 161, 239, 0.1);
}

.form-input-error {
  border-color: #dc2626;
}

.error-text {
  display: block;
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 4px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.toggle-checkbox {
  display: none;
}

.toggle-switch-inline {
  position: relative;
  width: 40px;
  height: 22px;
  background: #d1d5db;
  border-radius: 22px;
  transition: 0.3s;
}

.toggle-switch-inline::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: 0.3s;
}

.toggle-checkbox:checked + .toggle-switch-inline {
  background: #10b981;
}

.toggle-checkbox:checked + .toggle-switch-inline::before {
  transform: translateX(18px);
}

/* Buttons */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: #37A1EF;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #2b8dd4;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 10px 20px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.warning-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 8px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1100;
}

.toast-success {
  background: #10b981;
  color: white;
}

.toast-error {
  background: #dc2626;
  color: white;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive */
@media (max-width: 640px) {
  .header-content {
    flex-direction: column;
  }
  
  .add-service-btn {
    width: 100%;
    justify-content: center;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-container {
    margin: 10px;
  }
}
</style>
