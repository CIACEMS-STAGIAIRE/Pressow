<template>
  <div class="landing-page">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo-container">
          <div class="logo-icon">
            <i class="fas fa-tshirt"></i>
          </div>
          <span class="logo-text">PressPro</span>
        </div>
        <div class="header-actions">
          <router-link to="/Connexion"><button class="BtnGlobal1" @click="navigateToAuth('login')">Connexion</button>
          </router-link>
          <router-link to="/Inscription"><button class="BtnGlobal2"
              @click="navigateToAuth('register')">S'inscrire</button>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <!-- Animated Background Elements -->
        <div class="hero-background">
          <div class="floating-icon icon-1">
            <i class="fas fa-tshirt"></i>
          </div>
          <div class="floating-icon icon-2">
            <i class="fas fa-soap"></i>
          </div>
          <div class="floating-icon icon-3">
            <i class="fas fa-spray-can"></i>
          </div>
          <div class="floating-icon icon-4">
            <i class="fas fa-wind"></i>
          </div>
          <div class="floating-icon icon-5">
            <i class="fas fa-fire"></i>
          </div>
          <div class="floating-icon icon-6">
            <i class="fas fa-gem"></i>
          </div>

          <!-- Animated Particles -->
          <div class="particle particle-1"></div>
          <div class="particle particle-2"></div>
          <div class="particle particle-3"></div>
          <div class="particle particle-4"></div>
          <div class="particle particle-5"></div>

          <!-- Pulse Rings -->
          <div class="pulse-ring ring-1"></div>
          <div class="pulse-ring ring-2"></div>
        </div>

        <!-- Main Hero Content -->
        <div class="hero-text-container">
          <div class="hero-badge">
            <span class="badge-text">🚀 Plateforme N°1 en Côte d'Ivoire</span>
          </div>

          <h1 class="hero-title">
            <span class="title-line title-line-1">Développez votre activité</span>
            <span class="title-line title-line-2">de <span class="hero-highlight">pressing en ligne</span></span>
          </h1>

          <p class="hero-description">
            Rejoignez la plateforme n°1 pour les professionnels du pressing, blanchisserie et
            nettoyage. Gérez vos commandes, développez votre clientèle et augmentez vos revenus.
          </p>

          <div class="hero-actions">
            <router-link to="/Inscription"><button class="BtnGlobal2" @click="navigateToAuth('register')">
                <span class="btn-content">
                  Commencer maintenant <i class="fas fa-arrow-right"></i>
                </span>
                <div class="btn-shine"></div>
              </button>
            </router-link>

            <router-link to="/Connexion"><button class="BtnGlobal1" @click="navigateToAuth('login')">Déjà inscrit
                ?</button></router-link>
          </div>

          <!-- Animated Stats -->
          <div class="hero-stats">
            <div class="stat-item" v-for="(stat, index) in stats" :key="index"
              :style="`animation-delay: ${index * 0.2}s`">
              <div class="stat-icon">
                <i :class="stat.icon"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number" :data-target="stat.number">0</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Animated Preview Cards -->
        <div class="hero-preview">
          <div class="preview-card card-1">
            <div class="card-header">
              <div class="card-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div class="card-content">
              <div class="app-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <h4>Réservations</h4>
              <p>Gestion simplifiée</p>
            </div>
          </div>

          <div class="preview-card card-2">
            <div class="card-header">
              <div class="card-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div class="card-content">
              <div class="app-icon">
                <i class="fas fa-search-plus"></i>
              </div>
              <h4>Visibilité</h4>
              <p>Suivi en temps réel</p>
            </div>
          </div>

          <div class="preview-card card-3">
            <div class="card-header">
              <div class="card-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div class="card-content">
              <div class="app-icon">
                <i class="fas fa-euro-sign"></i>
              </div>
              <h4>Revenus ++</h4>
              <p>Optimisation financière</p>
            </div>
          </div>

          <div class="preview-card card-4">
            <div class="card-header">
              <div class="card-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div class="card-content">
              <div class="app-icon">
                <i class="fas fa-star"></i>
              </div>
              <h4>Avis clients</h4>
              <p>Retours en direct</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-content">
        <div class="section-header">
          <h2 class="section-title">Pourquoi rejoindre <span class="highlight">PressPro</span>?</h2>
          <p class="section-description">
            Les avantages qui feront la différence pour votre activité
          </p>
        </div>
        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="card-content">
              <div class="feature-icon" :class="`icon-${index + 1}`">
                <i :class="feature.icon"></i>
              </div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Service Types Section -->
    <section class="services-section">
      <div class="section-content">
        <div class="section-header">
          <h2 class="section-title">Types de services acceptés</h2>
          <p class="section-description">
            Peu importe votre spécialité, nous avons une place pour vous
          </p>
        </div>
        <div class="services-grid">
          <div class="service-card" v-for="(service, index) in serviceTypes" :key="index">
            <div class="card-content">
              <div class="service-icon">
                <i :class="service.icon"></i>
              </div>
              <h3 class="service-name">{{ service.name }}</h3>
              <p class="service-description">{{ service.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">Prêt à développer votre activité ?</h2>
        <p class="cta-description">
          Inscrivez-vous dès maintenant et commencez à recevoir des commandes en quelques minutes
        </p>
        <router-link to="/Inscription"><button class="BtnGlobal2 cta-button" @click="navigateToAuth('register')">
            Créer mon compte gratuitement <i class="fas fa-rocket"></i> </button></router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-main">
          <div class="footer-brand">
            <div class="logo-container">
              <div class="logo-icon">
                <i class="fas fa-tshirt"></i>
              </div>
              <span class="footer-logo-text">PressPro</span>
            </div>
            <p class="footer-description">
              La plateforme professionnelle pour les prestataires de pressing et nettoyage
            </p>
            <div class="social-links">
              <a href="#" class="social-link">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="#" class="social-link">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="#" class="social-link">
                <i class="fab fa-linkedin-in"></i>
              </a>
              <a href="#" class="social-link">
                <i class="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <div class="footer-links">
            <div class="footer-column">
              <h4>Plateforme</h4>
              <ul>
                <li><a href="#">Fonctionnalités</a></li>
                <li><a href="#">Tarifs</a></li>
                <li><a href="#">Témoignages</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>

            <div class="footer-column">
              <h4>Entreprise</h4>
              <ul>
                <li><a href="#">À propos</a></li>
                <li><a href="#">Carrières</a></li>
                <li><a href="#">Presse</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>

            <div class="footer-column">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Centre d'aide</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Status</a></li>
                <li><a href="#">Formation</a></li>
              </ul>
            </div>

            <div class="footer-column">
              <h4>Légal</h4>
              <ul>
                <li><a href="#">CGU</a></li>
                <li><a href="#">Confidentialité</a></li>
                <li><a href="#">Cookies</a></li>
                <li><a href="#">Mentions légales</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <p class="footer-copyright">© 2025 PressPro. Tous droits réservés.</p>
            <div class="footer-legal">
              <a href="#">Politique de confidentialité</a>
              <a href="#">Conditions d'utilisation</a>
              <a href="#">Paramètres des cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Data
const features = ref([
  {
    icon: 'fas fa-chart-line',
    title: 'Revenus optimisés',
    description: 'Augmentez vos revenus en rejoignant notre réseau de prestataires de confiance',
  },
  {
    icon: 'fas fa-users',
    title: 'Large clientèle',
    description: 'Accédez à une base de clients en croissance constante',
  },
  {
    icon: 'fas fa-calendar-check',
    title: 'Gestion simplifiée',
    description: 'Gérez vos commandes et votre agenda en toute simplicité',
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'Paiements sécurisés',
    description: 'Recevez vos paiements de manière rapide et sécurisée',
  },
  {
    icon: 'fas fa-rocket',
    title: 'Croissance assurée',
    description: 'Développez votre activité avec notre support marketing',
  },
  {
    icon: 'fas fa-search-plus',
    title: 'Visibilité accrue',
    description: "Bénéficiez d'une visibilité maximale auprès des clients",
  },
])

const serviceTypes = ref([
  {
    icon: 'fas fa-tshirt',
    name: 'Pressing Lingerie',
    description: 'Nettoyage et repassage professionnel du linge',
  },
  {
    icon: 'fas fa-shoe-prints',
    name: 'Pressing Chaussures',
    description: 'Nettoyage et entretien spécialisé des chaussures',
  },
  {
    icon: 'fas fa-wind',
    name: 'Blanchisserie',
    description: 'Traitement spécialisé du linge et textiles',
  },
  {
    icon: 'fas fa-soap',
    name: 'Laverie',
    description: 'Service de lavage en libre-service',
  },
  {
    icon: 'fas fa-home',
    name: 'Fanico',
    description: 'Nettoyage à domicile chez le client',
  },
  {
    icon: 'fas fa-broom',
    name: 'Nettoyage',
    description: 'Service de ménage et nettoyage général',
  },
])

const stats = ref([
  { icon: 'fas fa-store', number: '500', label: 'Prestataires actifs' },
  { icon: 'fas fa-users', number: '50000', label: 'Clients satisfaits' },
  { icon: 'fas fa-star', number: '98', label: 'Taux de satisfaction' },
  { icon: 'fas fa-map-marker-alt', number: '50', label: 'Villes couvertes' },
])

// Methods
const navigateToAuth = (mode: string) => {
  // Stocker le mode dans le localStorage pour la page d'authentification
  localStorage.setItem('authMode', mode)
  router.push('/connexion')
}

// Animation pour les compteurs
let animationFrameId: number

const animateCounter = (element: HTMLElement, target: number, duration: number = 2000) => {
  let start = 0
  const startTime = performance.now()

  const updateCounter = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    const current = Math.floor(target * easeOutQuart)

    element.textContent = current.toLocaleString()

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(updateCounter)
    } else {
      element.textContent = target.toLocaleString()
    }
  }

  animationFrameId = requestAnimationFrame(updateCounter)
}

const animateCounters = () => {
  const counters = document.querySelectorAll('.stat-number') as NodeListOf<HTMLElement>
  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute('data-target') || '0')
    animateCounter(counter, target, 2000)
  })
}

// Intersection Observer pour l'animation des compteurs
let observer: IntersectionObserver | null = null

onMounted(() => {
  // Configurer l'Intersection Observer
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounters()
        observer?.unobserve(entry.target)
      }
    })
  }, {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
  })

  const statsSection = document.querySelector('.hero-stats')
  if (statsSection) {
    observer.observe(statsSection)
  }

  // Ajouter les classes d'animation progressive
  const animatedElements = document.querySelectorAll('.feature-card, .service-card, .section-header')
  animatedElements.forEach((element, index) => {
    (element as HTMLElement).style.animationDelay = `${index * 0.1}s`
  })
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped src="@/Accueil/Accueil.css"></style>