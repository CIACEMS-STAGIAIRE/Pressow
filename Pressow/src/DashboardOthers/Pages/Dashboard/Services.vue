<template>
  <DashboardLayout>
    <div class="services-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Mes Services</h1>
          <p class="page-description">Gérez les services que vous proposez à vos clients</p>
        </div>
        <button @click="openModal()" class="add-service-btn">
          <i class="fas fa-plus icon"></i>
          Ajouter un service
        </button>
      </div>
    </div>

    <div class="services-masonry">
      <div
        v-for="service in services"
        :key="service.id"
        :class="['service-card', { 'service-card-inactive': !service.active }]"
      >
        <div class="service-header">
          <div class="service-header-content">
            <div class="service-title-section">
              <h3 class="service-name">{{ service.name }}</h3>
              <span class="badge-blue">
                <i class="fas fa-cogs badge-icon"></i>
                Service personnalisé
              </span>
            </div>
            <div class="toggle-container">
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  :checked="service.active"
                  @change="toggleActive(service.id)"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="service-body">
          <p class="service-description">{{ service.description || 'Aucune description' }}</p>

          <div class="service-info-grid">
            <div class="info-item">
              <div class="info-icon-wrapper price-icon">
                <i class="fas fa-euro-sign icon"></i>
              </div>
              <div class="info-content">
                <span class="info-label">Prix</span>
                <span class="info-price">{{ service.price.toFixed(2) }} €</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon-wrapper duration-icon">
                <i class="fas fa-clock icon"></i>
              </div>
              <div class="info-content">
                <span class="info-label">Durée</span>
                <span class="info-text">{{ service.duration }}</span>
              </div>
            </div>
          </div>

          <div class="service-actions">
            <button
              @click="openModal(service)"
              class="action-btn action-btn-edit"
            >
              <i class="fas fa-pen-to-square icon"></i>
              Modifier
            </button>
            <button
              @click="confirmDelete(service)"
              class="action-btn action-btn-delete"
            >
              <i class="fas fa-trash icon"></i>
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div v-if="services.length === 0" class="empty-state">
        <div class="empty-content">
          <div class="empty-icon">
            <i class="fas fa-briefcase icon"></i>
          </div>
          <div class="empty-text">
            <h3 class="empty-title">Aucun service configuré</h3>
            <p class="empty-message">Commencez par ajouter votre premier service</p>
          </div>
          <button @click="openModal()" class="btn-primary">
            <i class="fas fa-plus icon"></i>
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
            <i :class="'fas ' + (editingService ? 'fa-pen-to-square' : 'fa-plus') + ' modal-title-icon'"></i>
            {{ editingService ? 'Modifier le service' : 'Ajouter un service' }}
          </h2>
          <button 
            @click="closeModal" 
            class="modal-close-btn"
          >
            <i class="fas fa-xmark icon"></i>
          </button>
        </div>
        
        <div class="modal-scroll-area">
          <form @submit.prevent="handleSubmit" class="service-form">
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="name" class="form-label">
                  <i class="fas fa-tag form-label-icon"></i>
                  Nom du service
                  <span class="required-asterisk">*</span>
                </label>
                <input 
                  id="name" 
                  v-model="formData.name" 
                  placeholder="Ex: Nettoyage à sec, Repassage express..." 
                  class="form-input"
                  :class="{ 'form-input-error': errors.name }"
                  @blur="validateField('name')"
                  @input="clearError('name')"
                />
                <div v-if="errors.name" class="error-message">
                  <i class="fas fa-exclamation-circle error-icon"></i>
                  {{ errors.name }}
                </div>
              </div>

              <div class="form-group">
                <label for="price" class="form-label">
                  <i class="fas fa-euro-sign form-label-icon"></i>
                  Prix (€)
                  <span class="required-asterisk">*</span>
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  v-model="formData.price"
                  placeholder="0.00"
                  class="form-input"
                  :class="{ 'form-input-error': errors.price }"
                  @blur="validateField('price')"
                  @input="clearError('price')"
                />
                <div v-if="errors.price" class="error-message">
                  <i class="fas fa-exclamation-circle error-icon"></i>
                  {{ errors.price }}
                </div>
              </div>

              <div class="form-group">
                <label for="duration" class="form-label">
                  <i class="fas fa-clock form-label-icon"></i>
                  Durée
                  <span class="required-asterisk">*</span>
                </label>
                <input
                  id="duration"
                  v-model="formData.duration"
                  placeholder="Ex: 24h, 2-3h, 48h..."
                  class="form-input"
                  :class="{ 'form-input-error': errors.duration }"
                  @blur="validateField('duration')"
                  @input="clearError('duration')"
                />
                <div v-if="errors.duration" class="error-message">
                  <i class="fas fa-exclamation-circle error-icon"></i>
                  {{ errors.duration }}
                </div>
              </div>

              <div class="form-group full-width">
                <label for="description" class="form-label">
                  <i class="fas fa-file-lines form-label-icon"></i>
                  Description
                  <span class="optional-label">(optionnel)</span>
                </label>
                <textarea
                  id="description"
                  v-model="formData.description"
                  placeholder="Décrivez votre service en détail..."
                  rows="3"
                  class="form-textarea"
                ></textarea>
                <div class="field-hint">
                  Si vide, "Aucune description" sera affiché
                </div>
              </div>

              <div class="form-group full-width">
                <div class="form-check">
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      id="active"
                      v-model="formData.active"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                  <label for="active" class="form-check-label">
                    <i class="fas fa-power-off form-check-icon"></i>
                    Service actif
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <div class="form-requirements">
            <span class="required-asterisk">*</span> Champs obligatoires
          </div>
          <div class="footer-actions">
            <button @click="closeModal" class="btn-cancel">
              <i class="fas fa-xmark icon"></i>
              Annuler
            </button>
            <button 
              @click="handleSubmit" 
              class="btn-primary"
              :disabled="!isFormValid"
            >
              <i class="fas fa-check icon"></i>
              {{ editingService ? 'Enregistrer' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal-container confirm-modal">
        <div class="modal-header">
          <h2 class="modal-title">
            <i class="fas fa-exclamation-triangle modal-title-icon warning-icon"></i>
            Confirmer la suppression
          </h2>
        </div>
        
        <div class="modal-scroll-area">
          <div class="confirm-content">
            <p>Êtes-vous sûr de vouloir supprimer le service <strong>"{{ serviceToDelete?.name }}"</strong> ?</p>
            <p class="warning-text">Cette action est irréversible.</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="footer-actions">
            <button @click="cancelDelete" class="btn-cancel">
              <i class="fas fa-xmark icon"></i>
              Annuler
            </button>
            <button 
              @click="deleteService" 
              class="btn-danger"
            >
              <i class="fas fa-trash icon"></i>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Notification -->
    <div v-if="showSuccessMessage" class="notification success-notification">
      <i class="fas fa-check-circle notification-icon"></i>
      <span class="notification-text">{{ successMessage }}</span>
      <button @click="showSuccessMessage = false" class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import DashboardLayout from '@/DashboardOthers/Components/DashboardLayout.vue'

// Données réactives
const services = ref([])

const isModalOpen = ref(false)
const editingService = ref(null)
const showDeleteConfirm = ref(false)
const serviceToDelete = ref(null)
const showSuccessMessage = ref(false)
const successMessage = ref('')

const formData = reactive({
  name: '',
  price: '', // Toujours stocker comme string pour éviter les problèmes de .trim()
  duration: '',
  description: '',
  active: true,
})

const errors = reactive({
  name: '',
  price: '',
  duration: '',
})

// Computed properties - CORRIGÉ
const isFormValid = computed(() => {
  const nameValid = formData.name.trim() !== '' && !errors.name
  const priceValid = formData.price.toString().trim() !== '' && !errors.price // Convertir en string pour .trim()
  const durationValid = formData.duration.trim() !== '' && !errors.duration
  
  return nameValid && priceValid && durationValid
})

// Charger les services au montage
const loadServices = () => {
  const savedServices = localStorage.getItem('presso_services')
  if (savedServices) {
    try {
      services.value = JSON.parse(savedServices)
    } catch (e) {
      console.error('Erreur lors du chargement des services:', e)
      // Services par défaut si aucun n'est trouvé
      services.value = getDefaultServices()
      saveServices()
    }
  } else {
    services.value = getDefaultServices()
    saveServices()
  }
}

const saveServices = () => {
  localStorage.setItem('presso_services', JSON.stringify(services.value))
  
  // Émettre un événement pour informer les autres composants de la mise à jour
  window.dispatchEvent(new CustomEvent('servicesUpdated', {
    detail: { services: services.value }
  }))
}

const getDefaultServices = () => {
  return [
    {
      id: 'SRV001',
      name: 'Nettoyage à sec',
      price: 12.0,
      duration: '48h',
      description: 'Nettoyage professionnel à sec pour tous types de vêtements',
      active: true,
    },
    {
      id: 'SRV002',
      name: 'Repassage',
      price: 8.0,
      duration: '24h',
      description: 'Repassage soigné et professionnel',
      active: true,
    },
    {
      id: 'SRV003',
      name: 'Lavage et repassage',
      price: 15.0,
      duration: '48h',
      description: 'Service complet de lavage et repassage',
      active: true,
    },
  ]
}

// Watchers
watch(isModalOpen, (newVal) => {
  if (newVal) {
    // Réinitialiser les erreurs quand la modal s'ouvre
    Object.keys(errors).forEach(key => {
      errors[key] = ''
    })
  }
})

// Validation améliorée - CORRIGÉ
const validateField = (fieldName) => {
  let value = formData[fieldName]
  
  // Convertir en string pour la validation
  if (fieldName === 'price') {
    value = value.toString()
  }
  
  switch (fieldName) {
    case 'name':
      if (!value.trim()) {
        errors.name = 'Le nom du service est obligatoire'
      } else if (value.trim().length < 2) {
        errors.name = 'Le nom doit contenir au moins 2 caractères'
      } else {
        errors.name = ''
      }
      break
      
    case 'price':
      const priceStr = value.toString().trim()
      if (!priceStr) {
        errors.price = 'Le prix est obligatoire'
      } else if (isNaN(parseFloat(priceStr)) || parseFloat(priceStr) < 0) {
        errors.price = 'Le prix doit être un nombre positif'
      } else {
        errors.price = ''
      }
      break
      
    case 'duration':
      if (!value.trim()) {
        errors.duration = 'La durée est obligatoire'
      } else if (value.trim().length < 2) {
        errors.duration = 'La durée doit contenir au moins 2 caractères'
      } else {
        errors.duration = ''
      }
      break
  }
}

const clearError = (fieldName) => {
  if (errors[fieldName]) {
    errors[fieldName] = ''
  }
}

// Validation complète du formulaire - CORRIGÉ
const validateForm = () => {
  // Valider tous les champs
  validateField('name')
  validateField('price')
  validateField('duration')
  
  // Vérifier s'il n'y a pas d'erreurs et que tous les champs sont remplis
  const hasErrors = Object.values(errors).some(error => error !== '')
  const allFieldsFilled = formData.name.trim() && 
                         formData.price.toString().trim() && // Convertir en string pour .trim()
                         formData.duration.trim()
  
  return !hasErrors && allFieldsFilled
}

const openModal = (service = null) => {
  if (service) {
    editingService.value = service
    formData.name = service.name
    formData.price = service.price.toString() // S'assurer que c'est une string
    formData.duration = service.duration
    formData.description = service.description
    formData.active = service.active
  } else {
    editingService.value = null
    formData.name = ''
    formData.price = ''
    formData.duration = ''
    formData.description = ''
    formData.active = true
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingService.value = null
  // Réinitialiser le formulaire
  Object.keys(formData).forEach(key => {
    if (key !== 'active') {
      formData[key] = ''
    } else {
      formData[key] = true
    }
  })
  // Réinitialiser les erreurs
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

// Gestion de la soumission - CORRIGÉ
const handleSubmit = async () => {
  console.log('handleSubmit appelé')
  console.log('Données du formulaire:', formData)
  console.log('Erreurs:', errors)
  
  // Forcer la validation de tous les champs
  validateField('name')
  validateField('price')
  validateField('duration')
  
  // Attendre le prochain tick pour s'assurer que les erreurs sont mises à jour
  await nextTick()
  
  if (!validateForm()) {
    console.log('Formulaire invalide, affichage notification erreur')
    showNotification('Veuillez corriger les erreurs dans le formulaire', 'error')
    return
  }

  console.log('Formulaire valide, traitement...')
  
  const finalDescription = formData.description.trim() || 'Aucune description'

  if (editingService.value) {
    const index = services.value.findIndex(s => s.id === editingService.value.id)
    if (index !== -1) {
      services.value[index] = {
        ...services.value[index],
        name: formData.name.trim(),
        price: parseFloat(formData.price), // Convertir en number pour le stockage
        duration: formData.duration.trim(),
        description: finalDescription,
        active: formData.active,
      }
    }
    showNotification('Service modifié avec succès!')
  } else {
    const newService = {
      id: 'SRV' + String(services.value.length + 1).padStart(3, '0'),
      name: formData.name.trim(),
      price: parseFloat(formData.price), // Convertir en number pour le stockage
      duration: formData.duration.trim(),
      description: finalDescription,
      active: formData.active,
    }
    services.value.push(newService)
    showNotification('Service ajouté avec succès!')
  }
  
  saveServices() // Sauvegarder et émettre l'événement
  closeModal()
}

const confirmDelete = (service) => {
  serviceToDelete.value = service
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  serviceToDelete.value = null
  showDeleteConfirm.value = false
}

const deleteService = () => {
  if (serviceToDelete.value) {
    services.value = services.value.filter(s => s.id !== serviceToDelete.value.id)
    showNotification('Service supprimé avec succès!')
    saveServices() // Sauvegarder et émettre l'événement
  }
  cancelDelete()
}

const toggleActive = (serviceId) => {
  const service = services.value.find(s => s.id === serviceId)
  if (service) {
    service.active = !service.active
    const action = service.active ? 'activé' : 'désactivé'
    showNotification(`Service ${action} avec succès!`)
    saveServices() // Sauvegarder et émettre l'événement
  }
}

const showNotification = (message, type = 'success') => {
  successMessage.value = message
  showSuccessMessage.value = true
  
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 4000)
}

// Fonction utilitaire pour convertir en string si nécessaire
const ensureString = (value) => {
  return value !== null && value !== undefined ? value.toString() : ''
}

// Débogage - pour voir l'état en temps réel (optionnel)
watch(formData, (newVal) => {
  console.log('formData changé:', newVal)
  console.log('isFormValid:', isFormValid.value)
}, { deep: true })

watch(errors, (newVal) => {
  console.log('errors changé:', newVal)
  console.log('isFormValid:', isFormValid.value)
}, { deep: true })

// Charger les services au montage du composant
onMounted(() => {
  loadServices()
})
</script>

<style scoped src="@/DashboardOthers/Assets/Styles/Services.css"></style>