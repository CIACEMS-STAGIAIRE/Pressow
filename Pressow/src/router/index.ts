import { createRouter, createWebHistory } from 'vue-router'
import Accueil from '@/DashboardGeneral/Pages/Accueil/Accueil.vue'
import Connexion from '@/DashboardGeneral/Pages/Auth/Connexion.vue'
import Inscription from '@/DashboardGeneral/Pages/Auth/Inscription.vue'
import Dashboard from '@/DashboardGeneral/Pages/Dashboard/Dashboard.vue'
import Commandes from '@/DashboardGeneral/Pages/Dashboard/Commandes.vue'
import Services from '@/DashboardGeneral/Pages/Dashboard/Services.vue'
import Statistics from '@/DashboardGeneral/Pages/Dashboard/Statistics.vue'
import Notifications from '@/DashboardGeneral/Pages/Dashboard/Notifications.vue'
import Parametres from '@/DashboardGeneral/Pages/Dashboard/Parametres.vue'
import Avis from '@/DashboardGeneral/Pages/Dashboard/Avis.vue'
import Portefeuille from '@/DashboardGeneral/Pages/Dashboard/Portefeuille.vue'
import Profile from '@/DashboardGeneral/Pages/Dashboard/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Accueil },
    { path: '/connexion', component: Connexion },
    { path: '/inscription', component: Inscription },
    { path: '/dashboard', component: Dashboard },
    { path: '/commandes', component: Commandes },
    { path: '/services', component: Services },
    { path: '/statistics', component: Statistics },
    { path: '/notifications', component: Notifications },
    { path: '/parametres', component: Parametres },
    { path: '/avis', component: Avis },
    { path: '/portefeuille', component: Portefeuille },
    { path: '/profile', component: Profile },
  ],
})

export default router
