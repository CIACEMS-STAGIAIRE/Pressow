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
          <div class="header-actions">
            <button @click="exportStatistics" class="export-btn">
              <i class="fas fa-download"></i>
              Exporter les statistiques
            </button>
          </div>
        </div>

        <!-- Filtres périodiques -->
        <div class="filters-section">
          <div class="filter-group">
            <label class="filter-label">Période :</label>
            <div class="filter-buttons">
              <button 
                v-for="period in periodFilters" 
                :key="period.value" 
                :class="['period-btn', { 'active': selectedPeriod === period.value }]"
                @click="setPeriodFilter(period.value)"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          
          <div class="date-range-selector" v-if="selectedPeriod === 'custom'">
            <div class="date-input-group">
              <label>Du :</label>
              <input type="date" v-model="customDateRange.start" @change="applyCustomDateRange">
            </div>
            <div class="date-input-group">
              <label>Au :</label>
              <input type="date" v-model="customDateRange.end" @change="applyCustomDateRange">
            </div>
          </div>
        </div>

        <!-- Statistiques principales -->
        <div class="main-stats-grid">
          <!-- Cartes de revenus -->
          <div class="stats-section">
            <div class="section-header">
              <h2 class="section--title">
                <i class="fas fa-chart-line section-icon"></i>
                Revenus
              </h2>
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

          <!-- Cartes de commandes -->
          <div class="stats-section">
            <div class="section-header">
              <h2 class="section--title">
                <i class="fas fa-shopping-bag section-icon"></i>
                Commandes
              </h2>
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
        </div>

        <!-- Statistiques détaillées par statut -->
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

        <!-- Statistiques mensuelles détaillées -->
        <div class="monthly-stats-section">
          <div class="section-header">
            <h2 class="section--title">
              <i class="fas fa-calendar-alt section-icon"></i>
              Statistiques Mensuelles
            </h2>
            <div class="section-actions">
              <button @click="toggleMonthlyView" class="view-toggle-btn">
                <i :class="showDetailedMonthly ? 'fas fa-list' : 'fas fa-table'"></i>
                {{ showDetailedMonthly ? 'Vue simplifiée' : 'Vue détaillée' }}
              </button>
            </div>
          </div>

          <!-- Vue simplifiée (cartes) -->
          <div v-if="!showDetailedMonthly" class="monthly-cards-grid">
            <div v-for="(monthData, index) in monthlyStats" :key="index" class="monthly-card card">
              <div class="card-content">
                <div class="monthly-card-header">
                  <h3 class="month-title">{{ formatMonthYear(monthData.month) }}</h3>
                  <span class="month-badge" :class="getMonthTrendClass(monthData)">
                    <i :class="getMonthTrendIcon(monthData)"></i>
                    {{ getMonthTrendText(monthData) }}
                  </span>
                </div>
                
                <div class="monthly-stats-grid">
                  <div class="monthly-stat">
                    <span class="monthly-stat-label">Revenus</span>
                    <span class="monthly-stat-value revenue">{{ formatCurrency(monthData.revenue) }} FCFA</span>
                  </div>
                  <div class="monthly-stat">
                    <span class="monthly-stat-label">Commandes</span>
                    <span class="monthly-stat-value orders">{{ monthData.totalOrders }}</span>
                  </div>
                  <div class="monthly-stat">
                    <span class="monthly-stat-label">Panier moyen</span>
                    <span class="monthly-stat-value avg-cart">{{ formatCurrency(monthData.averageOrderValue) }} FCFA</span>
                  </div>
                </div>
                
                <div class="monthly-status-breakdown">
                  <div class="status-mini-badges">
                    <span class="mini-badge completed" title="Terminées">{{ monthData.statusCounts.completed }}</span>
                    <span class="mini-badge accepted" title="Acceptées">{{ monthData.statusCounts.accepted }}</span>
                    <span class="mini-badge pending" title="En attente">{{ monthData.statusCounts.pending }}</span>
                    <span class="mini-badge refused" title="Refusées">{{ monthData.statusCounts.refused }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Vue détaillée (tableau) -->
          <div v-else class="monthly-detailed-table">
            <div class="table-container card">
              <div class="card-content">
                <table class="stats-table">
                  <thead>
                    <tr>
                      <th>Mois</th>
                      <th>Revenus</th>
                      <th>Commandes</th>
                      <th>Panier moyen</th>
                      <th>Terminées</th>
                      <th>Acceptées</th>
                      <th>En attente</th>
                      <th>Refusées</th>
                      <th>Taux d'acceptation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(monthData, index) in monthlyStats" :key="index" 
                        :class="{'current-month': isCurrentMonth(monthData.month)}">
                      <td class="month-cell">
                        <strong>{{ formatMonthYear(monthData.month) }}</strong>
                        <span v-if="isCurrentMonth(monthData.month)" class="current-badge">En cours</span>
                      </td>
                      <td class="revenue-cell">{{ formatCurrency(monthData.revenue) }} FCFA</td>
                      <td class="orders-cell">{{ monthData.totalOrders }}</td>
                      <td class="avg-cell">{{ formatCurrency(monthData.averageOrderValue) }} FCFA</td>
                      <td class="status-cell completed">{{ monthData.statusCounts.completed }}</td>
                      <td class="status-cell accepted">{{ monthData.statusCounts.accepted }}</td>
                      <td class="status-cell pending">{{ monthData.statusCounts.pending }}</td>
                      <td class="status-cell refused">{{ monthData.statusCounts.refused }}</td>
                      <td class="rate-cell">
                        <span :class="getAcceptanceRateClass(monthData.acceptanceRate)">
                          {{ monthData.acceptanceRate }}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div v-if="monthlyStats.length === 0" class="empty-table-state">
                  <i class="fas fa-chart-bar"></i>
                  <p>Aucune donnée disponible pour la période sélectionnée</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistiques par type de service -->
        <div class="service-stats-section">
          <h2 class="section--title">
            <i class="fas fa-cogs section-icon"></i>
            Performance par Service
          </h2>
          
          <div class="service-stats-grid">
            <div v-for="(service, index) in serviceStats" :key="index" class="service-stat-card card">
              <div class="card-content">
                <div class="service-stat-header">
                  <div class="service-icon">
                    <i :class="getServiceIcon(service.serviceType)"></i>
                  </div>
                  <h3 class="service-name">{{ getServiceLabel(service.serviceType) }}</h3>
                </div>
                
                <div class="service-stats-details">
                  <div class="service-stat">
                    <span class="service-stat-label">Commandes</span>
                    <span class="service-stat-value">{{ service.orderCount }}</span>
                  </div>
                  <div class="service-stat">
                    <span class="service-stat-label">Revenus</span>
                    <span class="service-stat-value">{{ formatCurrency(service.revenue) }} FCFA</span>
                  </div>
                  <div class="service-stat">
                    <span class="service-stat-label">Part du total</span>
                    <span class="service-stat-value">{{ service.percentage }}%</span>
                  </div>
                </div>
                
                <div class="service-trend">
                  <span class="trend-indicator" :class="service.trend > 0 ? 'positive' : service.trend < 0 ? 'negative' : 'neutral'">
                    <i :class="service.trend > 0 ? 'fas fa-arrow-up' : service.trend < 0 ? 'fas fa-arrow-down' : 'fas fa-minus'"></i>
                    {{ Math.abs(service.trend) }}%
                  </span>
                  <span class="trend-label">vs période précédente</span>
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
import DashboardLayout from '@/DashboardOthers/Components/DashboardLayout.vue'

// Types
interface Order {
  id: string
  serviceType: string
  itemsWithQuantities: Array<{ name: string; quantity: number; price: number }>
  totalItems: number
  address: string
  deliveryDate: string
  price: number
  status: string
  createdAt: string
}

interface MonthlyStats {
  month: string // Format YYYY-MM
  revenue: number
  totalOrders: number
  averageOrderValue: number
  statusCounts: {
    completed: number
    accepted: number
    pending: number
    refused: number
  }
  acceptanceRate: number
}

interface ServiceStat {
  serviceType: string
  orderCount: number
  revenue: number
  percentage: number
  trend: number
}

// Données réactives
const orders = ref<Order[]>([])
const selectedPeriod = ref('all')
const customDateRange = ref({
  start: '',
  end: ''
})
const showDetailedMonthly = ref(false)

// Filtres de période
const periodFilters = [
  { value: 'all', label: 'Toute la période' },
  { value: 'year', label: 'Cette année' },
  { value: 'last-year', label: 'Année dernière' },
  { value: 'month', label: 'Ce mois' },
  { value: 'last-month', label: 'Mois dernier' },
  { value: 'custom', label: 'Période personnalisée' }
]

// Chargement des commandes
const loadOrders = () => {
  const savedOrders = localStorage.getItem('presso_orders')
  if (savedOrders) {
    try {
      orders.value = JSON.parse(savedOrders)
    } catch (e) {
      console.error('Erreur lors du chargement des commandes:', e)
      orders.value = []
    }
  } else {
    orders.value = []
  }
}

// Filtrage des commandes selon la période sélectionnée
const filteredOrders = computed(() => {
  let filtered = orders.value
  
  if (selectedPeriod.value === 'all') {
    return filtered
  }
  
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  
  switch (selectedPeriod.value) {
    case 'year':
      // Cette année
      return filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.getFullYear() === currentYear
      })
      
    case 'last-year':
      // Année dernière
      return filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.getFullYear() === currentYear - 1
      })
      
    case 'month':
      // Ce mois
      return filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth
      })
      
    case 'last-month':
      // Mois dernier
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
      
      return filtered.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.getFullYear() === lastMonthYear && orderDate.getMonth() === lastMonth
      })
      
    case 'custom':
      // Période personnalisée
      if (customDateRange.value.start && customDateRange.value.end) {
        const startDate = new Date(customDateRange.value.start)
        const endDate = new Date(customDateRange.value.end)
        endDate.setHours(23, 59, 59, 999)
        
        return filtered.filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= startDate && orderDate <= endDate
        })
      }
      return filtered
      
    default:
      return filtered
  }
})

// Calcul des statistiques mensuelles
const monthlyStats = computed(() => {
  const monthlyData: { [key: string]: MonthlyStats } = {}
  
  // Grouper les commandes par mois
  filteredOrders.value.forEach(order => {
    const orderDate = new Date(order.createdAt)
    const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        revenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        statusCounts: {
          completed: 0,
          accepted: 0,
          pending: 0,
          refused: 0
        },
        acceptanceRate: 0
      }
    }
    
    // Ajouter les données de la commande
    monthlyData[monthKey].revenue += order.price
    monthlyData[monthKey].totalOrders += 1
    
    // Incrémenter le compteur de statut si le statut est valide
    const status = order.status as keyof MonthlyStats['statusCounts']
    if (status in monthlyData[monthKey].statusCounts) {
      monthlyData[monthKey].statusCounts[status] += 1
    }
  })
  
  // Calculer les valeurs moyennes et les taux
  Object.keys(monthlyData).forEach(monthKey => {
    const month = monthlyData[monthKey]
    if (month) {
      month.averageOrderValue = month.totalOrders > 0 ? month.revenue / month.totalOrders : 0
      
      const totalProcessed = month.statusCounts.completed + month.statusCounts.accepted + month.statusCounts.refused
      month.acceptanceRate = totalProcessed > 0 
        ? Math.round(((month.statusCounts.completed + month.statusCounts.accepted) / totalProcessed) * 100)
        : 0
    }
  })
  
  // Trier par mois (du plus récent au plus ancien)
  return Object.values(monthlyData)
    .sort((a, b) => b.month.localeCompare(a.month))
})

// Statistiques de revenus
const revenueStats = computed(() => {
  const currentMonthStats = monthlyStats.value.find(month => 
    isCurrentMonth(month.month)
  ) || { revenue: 0, totalOrders: 0, averageOrderValue: 0 }
  
  const lastMonthStats = monthlyStats.value.find(month => 
    isPreviousMonth(month.month)
  ) || { revenue: 0, totalOrders: 0, averageOrderValue: 0 }
  
  const totalRevenue = monthlyStats.value.reduce((sum, month) => sum + month.revenue, 0)
  const monthlyRevenue = currentMonthStats.revenue
  const dailyAvg = monthlyRevenue > 0 ? Math.round(monthlyRevenue / 30) : 0
  
  const monthlyGrowth = lastMonthStats.revenue > 0 
    ? Math.round(((monthlyRevenue - lastMonthStats.revenue) / lastMonthStats.revenue) * 100)
    : monthlyRevenue > 0 ? 100 : 0
  
  return [
    {
      title: 'Revenu Total',
      value: `${formatCurrency(totalRevenue)} FCFA`,
      icon: 'fas fa-money-bill-wave',
      bgColor: 'bg-blue-dark',
      trendValue: 'Total',
      trendIcon: 'fas fa-chart-bar',
      trendClass: 'trend-neutral',
    },
    {
      title: 'Revenu Mensuel',
      value: `${formatCurrency(monthlyRevenue)} FCFA`,
      icon: 'fas fa-calendar-alt',
      bgColor: 'bg-blue',
      trendValue: `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth}%`,
      trendIcon: monthlyGrowth >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
      trendClass: monthlyGrowth >= 0 ? 'trend-positive' : 'trend-negative',
    },
    {
      title: 'Moyenne Journalière',
      value: `${formatCurrency(dailyAvg)} FCFA`,
      icon: 'fas fa-chart-line',
      bgColor: 'bg-blue-light',
      trendValue: 'Moyenne',
      trendIcon: 'fas fa-calculator',
      trendClass: 'trend-neutral',
    },
  ]
})

// Statistiques de commandes
const orderStats = computed(() => {
  const currentMonthStats = monthlyStats.value.find(month => 
    isCurrentMonth(month.month)
  ) || { revenue: 0, totalOrders: 0, averageOrderValue: 0 }
  
  const lastMonthStats = monthlyStats.value.find(month => 
    isPreviousMonth(month.month)
  ) || { revenue: 0, totalOrders: 0, averageOrderValue: 0 }
  
  const totalOrders = monthlyStats.value.reduce((sum, month) => sum + month.totalOrders, 0)
  const monthlyOrders = currentMonthStats.totalOrders
  const dailyAvg = monthlyOrders > 0 ? Math.round(monthlyOrders / 30 * 10) / 10 : 0
  
  const monthlyGrowth = lastMonthStats.totalOrders > 0 
    ? Math.round(((monthlyOrders - lastMonthStats.totalOrders) / lastMonthStats.totalOrders) * 100)
    : monthlyOrders > 0 ? 100 : 0
  
  return [
    {
      title: 'Total Commandes',
      value: totalOrders,
      icon: 'fas fa-boxes',
      bgColor: 'bg-sky-dark',
      trendValue: 'Total',
      trendIcon: 'fas fa-chart-pie',
      trendClass: 'trend-neutral',
    },
    {
      title: 'Commandes ce Mois',
      value: monthlyOrders,
      icon: 'fas fa-chart-bar',
      bgColor: 'bg-sky',
      trendValue: `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth}%`,
      trendIcon: monthlyGrowth >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down',
      trendClass: monthlyGrowth >= 0 ? 'trend-positive' : 'trend-negative',
    },
    {
      title: 'Moyenne Journalière',
      value: dailyAvg,
      icon: 'fas fa-box',
      bgColor: 'bg-sky-light',
      trendValue: 'Moyenne',
      trendIcon: 'fas fa-calculator',
      trendClass: 'trend-neutral',
    },
  ]
})

// Statistiques de statut des commandes
const statusStats = computed(() => {
  const statusCounts = {
    completed: 0,
    accepted: 0,
    pending: 0,
    refused: 0
  }
  
  // Compter les statuts pour toutes les commandes filtrées
  filteredOrders.value.forEach(order => {
    if (statusCounts.hasOwnProperty(order.status)) {
      statusCounts[order.status as keyof typeof statusCounts] += 1
    }
  })
  
  return [
    {
      title: 'Acceptées',
      value: statusCounts.accepted,
      icon: 'fas fa-check-circle',
      bgColor: 'bg-green',
      cardClass: 'status-card-green',
    },
    {
      title: 'En Attente',
      value: statusCounts.pending,
      icon: 'fas fa-clock',
      bgColor: 'bg-orange',
      cardClass: 'status-card-orange',
    },
    {
      title: 'Terminées',
      value: statusCounts.completed,
      icon: 'fas fa-flag-checkered',
      bgColor: 'bg-blue',
      cardClass: 'status-card-blue',
    },
    {
      title: 'Refusées',
      value: statusCounts.refused,
      icon: 'fas fa-times-circle',
      bgColor: 'bg-red',
      cardClass: 'status-card-red',
    },
  ]
})

// Statistiques par service
const serviceStats = computed(() => {
  const serviceData: { [key: string]: ServiceStat } = {}
  const totalRevenue = monthlyStats.value.reduce((sum, month) => sum + month.revenue, 0)
  
  // Grouper par service
  filteredOrders.value.forEach(order => {
    if (!serviceData[order.serviceType]) {
      serviceData[order.serviceType] = {
        serviceType: order.serviceType,
        orderCount: 0,
        revenue: 0,
        percentage: 0,
        trend: 0
      }
    }
    
    const service = serviceData[order.serviceType]
    if (service) {
      service.orderCount += 1
      service.revenue += order.price
    }
  })
  
  // Calculer les pourcentages
  Object.keys(serviceData).forEach(serviceType => {
    const service = serviceData[serviceType]
    if (service) {
      service.percentage = totalRevenue > 0 
        ? Math.round((service.revenue / totalRevenue) * 100)
        : 0
    }
  })
  
  // Trier par revenu (décroissant)
  return Object.values(serviceData)
    .sort((a, b) => b.revenue - a.revenue)
})

// Méthodes utilitaires
const formatCurrency = (amount: number) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const formatMonthYear = (monthKey: string | undefined) => {
  if (!monthKey) return ''
  const [year, month] = monthKey.split('-')
  if (!year || !month) return ''
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  const monthIndex = parseInt(month) - 1
  return `${monthNames[monthIndex] || ''} ${year}`
}

const isCurrentMonth = (monthKey: string) => {
  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return monthKey === currentMonthKey
}

const isPreviousMonth = (monthKey: string) => {
  const now = new Date()
  const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const prevMonthKey = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}`
  return monthKey === prevMonthKey
}

const getMonthTrendClass = (monthData: MonthlyStats) => {
  // Cette logique simplifiée compare avec le mois précédent
  // Dans une implémentation réelle, vous compareriez avec le même mois de l'année précédente
  const currentIndex = monthlyStats.value.findIndex(m => m.month === monthData.month)
  if (currentIndex < monthlyStats.value.length - 1) {
    const prevMonth = monthlyStats.value[currentIndex + 1]
    if (prevMonth && prevMonth.revenue > 0) {
      const growth = ((monthData.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
      return growth >= 0 ? 'trend-positive' : 'trend-negative'
    }
  }
  return 'trend-neutral'
}

const getMonthTrendIcon = (monthData: MonthlyStats) => {
  const trendClass = getMonthTrendClass(monthData)
  return trendClass === 'trend-positive' ? 'fas fa-arrow-up' : 
         trendClass === 'trend-negative' ? 'fas fa-arrow-down' : 'fas fa-minus'
}

const getMonthTrendText = (monthData: MonthlyStats) => {
  const currentIndex = monthlyStats.value.findIndex(m => m.month === monthData.month)
  if (currentIndex < monthlyStats.value.length - 1) {
    const prevMonth = monthlyStats.value[currentIndex + 1]
    if (prevMonth && prevMonth.revenue > 0) {
      const growth = Math.round(((monthData.revenue - prevMonth.revenue) / prevMonth.revenue) * 100)
      return `${growth >= 0 ? '+' : ''}${growth}%`
    }
  }
  return 'Nouveau'
}

const getAcceptanceRateClass = (rate: number) => {
  if (rate >= 80) return 'rate-high'
  if (rate >= 60) return 'rate-medium'
  return 'rate-low'
}

const getServiceIcon = (serviceType: string) => {
  const icons: { [key: string]: string } = {
    'pressing': 'fas fa-tshirt',
    'lavage': 'fas fa-soap',
    'repassage': 'fas fa-iron',
    'nettoyage': 'fas fa-broom',
    'couture': 'fas fa-cut',
    'retouche': 'fas fa-scissors'
  }
  return icons[serviceType.toLowerCase()] || 'fas fa-concierge-bell'
}

const getServiceLabel = (serviceType: string) => {
  const labels: { [key: string]: string } = {
    'pressing': 'Pressing',
    'lavage': 'Lavage',
    'repassage': 'Repassage',
    'nettoyage': 'Nettoyage',
    'couture': 'Couture',
    'retouche': 'Retouche'
  }
  return labels[serviceType.toLowerCase()] || serviceType
}

// Gestion des filtres
const setPeriodFilter = (period: string) => {
  selectedPeriod.value = period
  
  // Initialiser la période personnalisée avec le dernier mois si sélectionné
  if (period === 'custom' && !customDateRange.value.start) {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    
    customDateRange.value.start = lastMonth.toISOString().split('T')[0] as string
    customDateRange.value.end = endOfLastMonth.toISOString().split('T')[0] as string
  }
}

const applyCustomDateRange = () => {
  // Le changement de date déclenche automatiquement le recalcul via la computed property
}

const toggleMonthlyView = () => {
  showDetailedMonthly.value = !showDetailedMonthly.value
}

const exportStatistics = () => {
  const data = {
    period: selectedPeriod.value,
    customDateRange: customDateRange.value,
    summary: {
      revenue: revenueStats.value,
      orders: orderStats.value,
      status: statusStats.value
    },
    monthlyStats: monthlyStats.value,
    serviceStats: serviceStats.value,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `statistiques-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Initialisation
onMounted(() => {
  loadOrders()
})
</script>

<style scoped src="@/DashboardOthers/Assets/Styles/Statistics.css"></style>