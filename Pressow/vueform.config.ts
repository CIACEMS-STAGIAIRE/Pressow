import fr from '@vueform/vueform/locales/fr'
import vueform from '@vueform/vueform/dist/vueform'
import { defineConfig } from '@vueform/vueform'

// Import Vueform CSS
import '@vueform/vueform/dist/vueform.css'

export default defineConfig({
  theme: vueform,
  locales: { fr },
  locale: 'fr',
  
  // Configuration globale
  displayErrors: false,
  validateOn: 'change|step',
  
  // Classes personnalisées pour la charte Presso
  classHelpers: true,
  
  // Override des couleurs par défaut (vert -> bleu)
  // Les couleurs sont définies dans les variables CSS du composant
})
