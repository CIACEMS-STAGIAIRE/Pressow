<template>
  <DashboardLayout>
    <div class="dashboard-layout">
    <div class="stats-dashboard">
      <!-- En-tête de la page Statistiques -->
      <div class="stats-page-header">
        <div>
          <h1 class="stats-page-title">Statistiques</h1>
          <p class="stats-page-description">Suivez vos performances et l'état de vos commandes</p>
        </div>
      </div>

      <!-- Revenue Stats -->
      <div class="stats-section">
        <div class="section-header">
          <h2 class="section--title">
            <i class="fas fa-chart-line section-icon"></i>
            Revenus
          </h2>
          <button @click="openRevenueDetails" class="voir-plus-btn">
            <i class="fas fa-chart-bar"></i>
            Voir détails
          </button>
        </div>
        <div class="stats-grid">
          <div v-for="(stat, index) in revenueStats" :key="index" class="stat-card card">
            <div class="card-content">
              <div class="stat-content">
                <div class="Icon-stat-container">
                  <div :class="['Icon-stat', stat.bgColor]">
                    <i :class="stat.icon"></i>
                  </div>
                  <p class="stat-label">{{ stat.title }}</p>
                </div>
                <div class="stat-info">
                  <p class="stat-value">{{ stat.value }}</p>
                  <div class="stat-trend" :class="stat.trendClass">
                    <i :class="stat.trendIcon"></i>
                    <span>{{ stat.trendValue }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Count Stats -->
      <div class="stats-section">
        <div class="section-header">
          <h2 class="section--title">
            <i class="fas fa-shopping-bag section-icon"></i>
            Commandes
          </h2>
          <button @click="openOrdersDetails" class="voir-plus-btn">
            <i class="fas fa-box-open"></i>
            Voir détails
          </button>
        </div>
        <div class="stats-grid">
          <div v-for="(stat, index) in orderStats" :key="index" class="stat-card card">
            <div class="card-content">
              <div class="stat-content">
                <div class="Icon-stat-container">
                  <div :class="['Icon-stat', stat.bgColor]">
                    <i :class="stat.icon"></i>
                  </div>
                  <p class="stat-label">{{ stat.title }}</p>
                </div>
                <div class="stat-info">
                  <p class="stat-value">{{ stat.value }}</p>
                  <div class="stat-trend" :class="stat.trendClass">
                    <i :class="stat.trendIcon"></i>
                    <span>{{ stat.trendValue }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Status Section -->
      <div class="stats-section-Com">
        <h2 class="section--title">
          <i class="fas fa-tasks section-icon"></i>
          État des Commandes
        </h2>

        <div class="status-grid">
          <div v-for="(stat, index) in statusStats" :key="index" :class="['status-card card', stat.cardClass]">
            <div class="card-content">
              <div class="status-content">
                <div :class="['status-icon', stat.bgColor]">
                  <i :class="stat.icon"></i>
                </div>
                <div class="status-info">
                  <p class="status-label">{{ stat.title }}</p>
                  <p class="status-value">{{ stat.value }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import DashboardLayout from '@/DashboardGeneral/Components/DashboardLayout.vue'

// Données réactives
const stats = ref({
  revenue: {
    daily: 83000,
    monthly: 2450000,
    total: 57000000,
    dailyTrend: '+12%',
    monthlyTrend: '+8%',
  },
  orders: {
    daily: 2,
    monthly: 18,
    total: 42,
    dailyTrend: '+5%',
    monthlyTrend: '+15%',
  },
})

// Simulation de données de boutique
const activeShop = ref({
  createdAt: '2024-01-01'
})

// Fonction pour formater les montants
const formatCurrency = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Statistiques de revenus
const revenueStats = computed(() => [
  {
    title: 'Revenu Journalier',
    value: `${formatCurrency(stats.value.revenue.daily)} FCFA`,
    icon: 'fas fa-money-bill-wave',
    bgColor: 'bg-blue-light',
    trendValue: stats.value.revenue.dailyTrend,
    trendIcon: 'fas fa-arrow-up',
    trendClass: 'trend-positive',
  },
  {
    title: 'Revenu Mensuel',
    value: `${formatCurrency(stats.value.revenue.monthly)} FCFA`,
    icon: 'fas fa-calendar-alt',
    bgColor: 'bg-blue',
    trendValue: stats.value.revenue.monthlyTrend,
    trendIcon: 'fas fa-arrow-up',
    trendClass: 'trend-positive',
  },
  {
    title: 'Revenu Total',
    value: `${formatCurrency(stats.value.revenue.total)} FCFA`,
    icon: 'fas fa-chart-line',
    bgColor: 'bg-blue-dark',
    trendValue: 'Total',
    trendIcon: 'fas fa-chart-bar',
    trendClass: 'trend-neutral',
  },
])

// Statistiques de commandes
const orderStats = computed(() => [
  {
    title: "Commandes Aujourd'hui",
    value: stats.value.orders.daily,
    icon: 'fas fa-box',
    bgColor: 'bg-sky-light',
    trendValue: stats.value.orders.dailyTrend,
    trendIcon: 'fas fa-arrow-up',
    trendClass: 'trend-positive',
  },
  {
    title: 'Commandes ce Mois',
    value: stats.value.orders.monthly,
    icon: 'fas fa-chart-bar',
    bgColor: 'bg-sky',
    trendValue: stats.value.orders.monthlyTrend,
    trendIcon: 'fas fa-arrow-up',
    trendClass: 'trend-positive',
  },
  {
    title: 'Total Commandes',
    value: stats.value.orders.total,
    icon: 'fas fa-boxes',
    bgColor: 'bg-sky-dark',
    trendValue: 'Total',
    trendIcon: 'fas fa-chart-pie',
    trendClass: 'trend-neutral',
  },
])

// Statistiques de statut des commandes
const statusStats = computed(() => [
  {
    title: 'Acceptées',
    value: 28,
    icon: 'fas fa-check-circle',
    bgColor: 'bg-green',
    cardClass: 'status-card-green',
  },
  {
    title: 'En Attente',
    value: 2,
    icon: 'fas fa-clock',
    bgColor: 'bg-orange',
    cardClass: 'status-card-orange',
  },
  {
    title: 'Terminées',
    value: 10,
    icon: 'fas fa-flag-checkered',
    bgColor: 'bg-blue',
    cardClass: 'status-card-blue',
  },
  {
    title: 'Refusées',
    value: 2,
    icon: 'fas fa-times-circle',
    bgColor: 'bg-red',
    cardClass: 'status-card-red',
  },
  {
    title: 'En Cours',
    value: 8,
    icon: 'fas fa-spinner',
    bgColor: 'bg-purple',
    cardClass: 'status-card-purple',
  },
])

// Fonctions de redirection
const openRevenueDetails = () => {
  const url = '/statistiques/revenus-detaille'
  window.open(url, '_blank')
}

const openOrdersDetails = () => {
  const url = '/statistiques/commandes-detaille'
  window.open(url, '_blank')
}

// Simulation de chargement des données
onMounted(() => {
  // Ici vous pourriez faire un appel API pour récupérer les vraies données
  console.log('Composant Statistiques monté')
})
</script>

<style scoped src="@/DashboardGeneral/Assets/Styles/Statistics.css"></style>