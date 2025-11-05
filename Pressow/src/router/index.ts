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
    {
      path: '/',
      name: 'Accueil',
      component: Accueil
    },
    {
      path: '/connexion',
      name: 'Connexion',
      component: Connexion
    },
    {
      path: '/inscription',
      name: 'Inscription',
      component: Inscription
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/commandes',
      name: 'Commandes',
      component: Commandes
    },
    {
      path: '/services',
      name: 'Services',
      component: Services
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: Statistics
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: Notifications
    },
    {
      path: '/parametres',
      name: 'Parametres',
      component: Parametres
    },
    {
      path: '/avis',
      name: 'Avis',
      component: Avis
    },
    {
      path: '/portefeuille',
      name: 'Portefeuille',
      component: Portefeuille
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    },
  ],
})

export default router
