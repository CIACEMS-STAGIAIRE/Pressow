import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '@/Components/ComponentsCommun/DashboardLayout.vue'
import Accueil from '@/Views/Accueil/Accueil.vue'
import Connexion from '@/Views/Auth/Connexion.vue'
import Inscription from '@/Views/Auth/Inscription.vue'
import Parametres from '@/Views/DashboardOthers/Parametres.vue'
import ParametresGeneral from '@/Views/DashboardGeneral/Parametres.vue'
import Profile from '@/Views/DashboardOthers/Profile.vue'
import ProfileGeneral from '@/Views/DashboardGeneral/Profile.vue'
import Avis from '@/Views/ViewsCommun/Avis.vue'
import Commandes from '@/Views/ViewsCommun/Commandes.vue'
import Dashboard from '@/Views/ViewsCommun/Dashboard.vue'
import Notifications from '@/Views/ViewsCommun/Notifications.vue'
import Portefeuille from '@/Views/ViewsCommun/Portefeuille.vue'
import Services from '@/Views/ViewsCommun/Services.vue'
import Statistics from '@/Views/ViewsCommun/Statistics.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '', component: Accueil },
    { path: '/Dashboard', component: Dashboard },
    { path: '/Connexion', component: Connexion },
    { path: '/Inscription', component: Inscription },
    { path: '/Dashboard/parametres', component: Parametres },
    { path: '/Dashboard/parametres-general', component: ParametresGeneral },
    { path: '/Dashboard/profile', component: Profile },
    { path: '/Dashboard/profile-general', component: ProfileGeneral },
    { path: '/Dashboard/avis', component: Avis },
    { path: '/Dashboard/commandes', component: Commandes },
    { path: '/Dashboard/notifications', component: Notifications },
    { path: '/Dashboard/portefeuille', component: Portefeuille },
    { path: '/Dashboard/services', component: Services },
    { path: '/Dashboard/statistics', component: Statistics },
  ],
})

export default router
