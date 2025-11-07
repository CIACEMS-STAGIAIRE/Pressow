import { createRouter, createWebHistory } from 'vue-router'
import Accueil from '@/Accueil/Accueil.vue'
import Connexion from '@/Auth/Connexion.vue'
import Inscription from '@/Auth/Inscription.vue'
import Dashboard from '@/DashboardGeneral/Pages/Dashboard/Dashboard.vue'
import Commandes from '@/DashboardGeneral/Pages/Dashboard/Commandes.vue'
import Services from '@/DashboardGeneral/Pages/Dashboard/Services.vue'
import Statistics from '@/DashboardGeneral/Pages/Dashboard/Statistics.vue'
import Notifications from '@/DashboardGeneral/Pages/Dashboard/Notifications.vue'
import Parametres from '@/DashboardGeneral/Pages/Dashboard/Parametres.vue'
import Avis from '@/DashboardGeneral/Pages/Dashboard/Avis.vue'
import Portefeuille from '@/DashboardGeneral/Pages/Dashboard/Portefeuille.vue'
import Profile from '@/DashboardGeneral/Pages/Dashboard/Profile.vue'
import AvisOthers from '@/DashboardOthers/Pages/Dashboard/Avis.vue'
import DashboardOthers from '@/DashboardOthers/Pages/Dashboard/Dashboard.vue'
import CommandesOthers from '@/DashboardOthers/Pages/Dashboard/Commandes.vue'
import ServicesOthers from '@/DashboardOthers/Pages/Dashboard/Services.vue'
import StatisticsOthers from '@/DashboardOthers/Pages/Dashboard/Statistics.vue'
import NotificationsOthers from '@/DashboardOthers/Pages/Dashboard/Notifications.vue'
import ParametresOthers from '@/DashboardOthers/Pages/Dashboard/Parametres.vue'
import PortefeuilleOthers from '@/DashboardOthers/Pages/Dashboard/Portefeuille.vue'
import ProfileOthers from '@/DashboardOthers/Pages/Dashboard/Profile.vue'

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
    { path: '/DashboardOthers', component: DashboardOthers },
    { path: '/AvisOthers', component: AvisOthers },
    { path: '/CommandesOthers', component: CommandesOthers },
    { path: '/ServicesOthers', component: ServicesOthers },
    { path: '/StatisticsOthers', component: StatisticsOthers },
    { path: '/NotificationsOthers', component: NotificationsOthers },
    { path: '/ParametresOthers', component: ParametresOthers },
    { path: '/PortefeuilleOthers', component: PortefeuilleOthers },
    { path: '/ProfileOthers', component: ProfileOthers },
  ],
})

export default router
