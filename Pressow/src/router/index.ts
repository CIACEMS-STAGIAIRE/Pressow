/**
 * Router Presso - Configuration des routes et navigation guards
 * 
 * Gère la navigation, l'authentification et la redirection vers l'onboarding
 */
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingStore } from '@/stores/onboarding'

// ═══════════════════════════════════════════════════════════════════════════════
// LAZY LOADING DES COMPOSANTS
// ═══════════════════════════════════════════════════════════════════════════════

// Pages publiques
const Accueil = () => import('@/Views/Accueil/Accueil.vue')
const Connexion = () => import('@/Views/Auth/Connexion.vue')
const Inscription = () => import('@/Views/Auth/Inscription.vue')
const MotDePasseOublie = () => import('@/Views/Auth/MotDePasseOublie.vue')

// Dashboard et composants communs (Prestataire)
const Dashboard = () => import('@/Views/ViewsCommun/Dashboard.vue')
const Commandes = () => import('@/Views/ViewsCommun/Commandes.vue')
const Notifications = () => import('@/Views/ViewsCommun/Notifications.vue')
const Portefeuille = () => import('@/Views/ViewsCommun/Portefeuille.vue')
const Services = () => import('@/Views/ViewsCommun/Services.vue')
const Statistics = () => import('@/Views/ViewsCommun/Statistics.vue')
const Avis = () => import('@/Views/ViewsCommun/Avis.vue')
const Profile = () => import('@/Views/ViewsCommun/Profile.vue')
const Parametres = () => import('@/Views/ViewsCommun/Parametres.vue')

// Onboarding (à créer)
const OnboardingSetup = () => import('@/Views/Onboarding/OnboardingSetup.vue')

// Dashboard Client
const ClientLayout = () => import('@/Components/ComponentsClient/ClientLayout.vue')
const ClientDashboard = () => import('@/Views/DashboardClient/ClientDashboard.vue')
const PressingDetail = () => import('@/Views/DashboardClient/PressingDetail.vue')
const Cart = () => import('@/Views/DashboardClient/Cart.vue')
const Checkout = () => import('@/Views/DashboardClient/Checkout.vue')
const ClientOrders = () => import('@/Views/DashboardClient/ClientOrders.vue')
const OrderTracking = () => import('@/Views/DashboardClient/OrderTracking.vue')
const ClientProfile = () => import('@/Views/DashboardClient/ClientProfile.vue')

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

declare module 'vue-router' {
  interface RouteMeta {
    /** Route nécessite une authentification */
    requiresAuth?: boolean
    /** Route réservée aux prestataires (providers) */
    requiresProvider?: boolean
    /** Route fait partie de l'onboarding */
    isOnboarding?: boolean
    /** Route accessible uniquement si onboarding terminé */
    requiresOnboardingComplete?: boolean
    /** Titre de la page */
    title?: string
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ─────────────────────────────────────────────────────────────────────────
    // ROUTES PUBLIQUES
    // ─────────────────────────────────────────────────────────────────────────
    {
      path: '/',
      name: 'home',
      component: Accueil,
      meta: { title: 'Presso - Pressing à domicile' }
    },
    {
      path: '/Connexion',
      name: 'login',
      component: Connexion,
      meta: { title: 'Connexion - Presso' }
    },
    {
      path: '/Inscription',
      name: 'register',
      component: Inscription,
      meta: { title: 'Inscription - Presso' }
    },
    {
      path: '/mot-de-passe-oublie',
      name: 'forgot-password',
      component: MotDePasseOublie,
      meta: { title: 'Mot de passe oublié - Presso' }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ONBOARDING (Configuration initiale du pressing)
    // ─────────────────────────────────────────────────────────────────────────
    {
      path: '/setup',
      name: 'onboarding',
      component: OnboardingSetup,
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        isOnboarding: true,
        title: 'Configuration de votre pressing - Presso'
      }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // DASHBOARD PRESTATAIRE (requiert onboarding terminé)
    // ─────────────────────────────────────────────────────────────────────────
    {
      path: '/Dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        requiresOnboardingComplete: true,
        title: 'Tableau de bord - Presso'
      }
    },
    {
      path: '/Dashboard/commandes',
      name: 'commandes',
      component: Commandes,
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        requiresOnboardingComplete: true,
        title: 'Commandes - Presso'
      }
    },
    {
      path: '/Dashboard/notifications',
      name: 'notifications',
      component: Notifications,
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        requiresOnboardingComplete: true,
        title: 'Notifications - Presso'
      }
    },
    {
      path: '/Dashboard/portefeuille',
      name: 'portefeuille',
      component: Portefeuille,
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        requiresOnboardingComplete: true,
        title: 'Portefeuille - Presso'
      }
    },
    {
      path: '/Dashboard/services',
      name: 'services',
      component: Services,
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        requiresOnboardingComplete: true,
        title: 'Mes Services - Presso'
      }
    },
    {
      path: '/Dashboard/statistics',
      name: 'statistics',
      component: Statistics,
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        requiresOnboardingComplete: true,
        title: 'Analyse et Rapports - Presso'
      }
    },
    {
      path: '/Dashboard/avis',
      name: 'avis',
      component: Avis,
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        requiresOnboardingComplete: true,
        title: 'Avis Clients - Presso'
      }
    },
    {
      path: '/Dashboard/profile',
      name: 'profile',
      component: Profile,
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        requiresOnboardingComplete: true,
        title: 'Profil - Presso'
      }
    },
    {
      path: '/Dashboard/parametres',
      name: 'parametres',
      component: Parametres,
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        requiresOnboardingComplete: true,
        title: 'Paramètres - Presso'
      }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // DASHBOARD CLIENT
    // ─────────────────────────────────────────────────────────────────────────
    {
      path: '/client',
      component: ClientLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'client-dashboard',
          component: ClientDashboard,
          meta: { title: 'Accueil - Pressow Client' }
        },
        {
          path: 'pressing/:id',
          name: 'pressing-detail',
          component: PressingDetail,
          meta: { title: 'Détail Pressing - Pressow' }
        },
        {
          path: 'cart',
          name: 'cart',
          component: Cart,
          meta: { title: 'Panier - Pressow' }
        },
        {
          path: 'checkout',
          name: 'checkout',
          component: Checkout,
          meta: { title: 'Paiement - Pressow' }
        },
        {
          path: 'orders',
          name: 'client-orders',
          component: ClientOrders,
          meta: { title: 'Mes Commandes - Pressow' }
        },
        {
          path: 'orders/:id',
          name: 'order-tracking',
          component: OrderTracking,
          meta: { title: 'Suivi Commande - Pressow' }
        },
        {
          path: 'profile',
          name: 'client-profile',
          component: ClientProfile,
          meta: { title: 'Mon Profil - Pressow' }
        },
      ]
    },

    // ─────────────────────────────────────────────────────────────────────────
    // REDIRECTION 404
    // ─────────────────────────────────────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],

  // Comportement du scroll
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION GUARDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Guard principal de navigation
 * Gère l'authentification et la redirection vers l'onboarding
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const onboardingStore = useOnboardingStore()

  // Mettre à jour le titre de la page
  document.title = to.meta.title || 'Presso'

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Vérifier l'authentification
  // ─────────────────────────────────────────────────────────────────────────
  
  if (to.meta.requiresAuth) {
    // Attendre que l'auth soit prête
    if (!authStore.authReady) {
      try {
        await authStore.initAuth()
      } catch {
        // Ignorer les erreurs d'init
      }
    }

    // Rediriger vers la connexion si non authentifié
    if (!authStore.accessToken || !authStore.user) {
      return next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Vérifier si c'est un prestataire
    // ─────────────────────────────────────────────────────────────────────────
    
    if (to.meta.requiresProvider) {
      const user = authStore.user
      const isProvider = user?.role === 'provider_owner' || user?.role === 'provider_manager'
      
      if (!isProvider) {
        // Rediriger les clients vers le dashboard client
        return next({ name: 'client-dashboard' })
      }

      // ─────────────────────────────────────────────────────────────────────────
      // 3. Vérifier l'état de l'onboarding
      // ─────────────────────────────────────────────────────────────────────────
      
      // Récupérer le statut d'onboarding si pas encore fait
      if (!onboardingStore.status) {
        try {
          await onboardingStore.fetchStatus()
        } catch {
          // Si erreur, continuer vers la route demandée
          // (l'API gérera la redirection si nécessaire)
        }
      }

      const onboardingCompleted = onboardingStore.isCompleted

      // Si on va vers l'onboarding mais qu'il est déjà terminé
      if (to.meta.isOnboarding && onboardingCompleted) {
        return next({ name: 'dashboard' })
      }

      // Si on va vers une page qui nécessite l'onboarding terminé
      if (to.meta.requiresOnboardingComplete && !onboardingCompleted) {
        return next({ name: 'onboarding' })
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Rediriger si déjà connecté et va vers login/register
  // ─────────────────────────────────────────────────────────────────────────
  
  // Seulement rediriger si le token ET l'utilisateur sont valides
  if ((to.name === 'login' || to.name === 'register') && authStore.accessToken && authStore.user) {
    // Vérifier si c'est un provider
    const user = authStore.user
    const isProvider = user.role === 'provider_owner' || user.role === 'provider_manager'
    
    if (isProvider) {
      // Vérifier l'onboarding
      if (!onboardingStore.status) {
        try {
          await onboardingStore.fetchStatus()
        } catch {
          // Si erreur d'onboarding (401 probable), nettoyer la session
          authStore.clearSession()
          return next()
        }
      }
      
      if (onboardingStore.isCompleted) {
        return next({ name: 'dashboard' })
      } else {
        return next({ name: 'onboarding' })
      }
    }
    
    // Clients redirigés vers le dashboard client
    return next({ name: 'client-dashboard' })
  }

  // Continuer normalement
  next()
})

export default router
