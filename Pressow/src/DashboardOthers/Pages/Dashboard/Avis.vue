<template>
    <DashboardLayout>
        <!-- Reviews Section -->
        <section class="reviews-section">
            <div class="section-content">
                <!-- Header Section -->
                <div class="section-header">
                    <h1 class="section-title">Avis clients sur <span class="highlight">votre pressing</span></h1>
                    <p class="section-description">
                        Découvrez ce que vos clients pensent de vos services et améliorez continuellement votre qualité
                    </p>
                </div>

                <!-- Statistics Overview -->
                <div class="reviews-overview">
                    <!-- Rating Overview Card -->
                    <div class="overview-card">
                        <div class="overview-main">
                            <div class="rating-display">
                                <div class="average-rating">
                                    <span class="rating-number">{{ averageRating }}</span>
                                    <span class="rating-max">/5</span>
                                </div>
                                <div class="stars">
                                    <div class="stars-background">
                                        <i class="fas fa-star" v-for="n in 5" :key="n"></i>
                                    </div>
                                    <div class="stars-filled"
                                        :style="{ width: `${(Number(averageRating) / 5) * 100}%` }">
                                        <i class="fas fa-star" v-for="n in 5" :key="n"></i>
                                    </div>
                                </div>
                                <div class="rating-count">{{ totalReviews }} avis</div>
                            </div>
                        </div>

                        <!-- Rating Breakdown -->
                        <div class="rating-breakdown">
                            <div v-for="(count, index) in ratingDistribution" :key="5 - index" class="breakdown-item">
                                <span class="star-label">{{ 5 - index }} étoiles</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" :style="{ width: `${(count / totalReviews) * 100}%` }"
                                        :data-count="count"></div>
                                </div>
                                <span class="count-label">{{ count }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Review Stats Cards -->
                    <div class="stats-cards">
                        <div class="stat-card" @click="setFilter('4')">
                            <div class="stat-icon">
                                <i class="fas fa-trophy"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ positiveReviewsPercentage }}%</div>
                                <div class="stat-label">Avis positifs</div>
                            </div>
                        </div>
                        <div class="stat-card" @click="scrollToComments">
                            <div class="stat-icon">
                                <i class="fas fa-comments"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ totalComments }}</div>
                                <div class="stat-label">Avis</div>
                            </div>
                        </div>
                        <div class="stat-card" @click="setFilter('new')">
                            <div class="stat-icon">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ thisMonthReviews }}</div>
                                <div class="stat-label">Ce mois-ci</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reviews Filter and Sort Controls -->
                <div class="reviews-controls">
                    <div class="filter-buttons">
                        <button v-for="filter in filters" :key="filter.key"
                            :class="['filter-btn', { active: activeFilter === filter.key }]"
                            @click="setFilter(filter.key)" :disabled="filter.count === 0">
                            {{ filter.label }} ({{ filter.count }})
                        </button>
                    </div>

                    <div class="sort-controls">
                        <span class="sort-label">Trier par:</span>
                        <select v-model="sortBy" class="sort-select" @change="applySort">
                            <option value="newest">Plus récents</option>
                            <option value="oldest">Plus anciens</option>
                            <option value="highest">Note la plus haute</option>
                            <option value="lowest">Note la plus basse</option>
                        </select>
                    </div>
                </div>

                <!-- Reviews List -->
                <div class="reviews-list">
                    <!-- Empty State -->
                    <div v-if="filteredReviews.length === 0" class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>Aucun avis trouvé</h3>
                        <p>Aucun avis ne correspond à vos critères de filtrage.</p>
                        <button class="load-more-btn" @click="resetFilters" style="margin-top: 20px;">
                            <i class="fas fa-redo"></i>
                            <span>Voir tous les avis</span>
                        </button>
                    </div>

                    <!-- Review Cards -->
                    <div v-for="review in filteredReviews" :key="review.id" class="review-card"
                        :class="{ 'new-review': isNewReview(review.date) }">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <div class="reviewer-avatar">
                                    {{ getInitials(review.customerName) }}
                                </div>
                                <div class="reviewer-details">
                                    <h4 class="reviewer-name">{{ review.customerName }}</h4>
                                    <div class="review-meta">
                                        <i class="fas fa-calendar"></i>
                                        <span class="review-date">{{ formatDate(review.date) }}</span>
                                        <i class="fas fa-concierge-bell"></i>
                                        <span class="review-service">{{ review.serviceType }}</span>
                                        <span v-if="review.commentCount > 0" class="comment-count">
                                            <i class="fas fa-reply"></i>
                                            {{ review.commentCount }} réponse{{ review.commentCount > 1 ? 's' : '' }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="review-rating">
                                <div class="star-rating-display">
                                    <i v-for="n in 5" :key="n"
                                        :class="['star', 'fas', n <= review.rating ? 'fa-star filled' : 'fa-star empty']"></i>
                                </div>
                                <span class="rating-value">{{ review.rating }}/5</span>
                            </div>
                        </div>

                        <div class="review-content">
                            <p class="review-comment">
                                <i class="fas fa-quote-left quote-icon"></i>
                                {{ review.comment }}
                            </p>

                            <!-- Service Details -->
                            <div class="service-details" v-if="review.serviceDetails">
                                <div class="service-items">
                                    <span v-for="item in review.serviceDetails.items" :key="item" class="service-item">
                                        <i class="fas fa-tshirt"></i>
                                        {{ item }}
                                    </span>
                                </div>
                                <div class="service-total">
                                    <i class="fas fa-receipt"></i>
                                    Total: {{ review.serviceDetails.total }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Load More Button -->
                <div class="load-more-container">
                    <button class="load-more-btn" @click="loadMoreReviews" v-if="hasMoreReviews && !loading"
                        :disabled="loading">
                        <i class="fas fa-plus"></i>
                        <span>Charger plus d'avis</span>
                    </button>
                    <button class="load-more-btn loading" v-if="loading" disabled>
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Chargement...</span>
                    </button>
                </div>
            </div>
        </section>
    </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import DashboardLayout from '@/DashboardOthers/Components/DashboardLayout.vue'

// Données réactives
const reviews = ref([
    {
        id: '1',
        customerName: 'Marie Koné',
        rating: 5,
        comment: 'Service exceptionnel ! Mon costume est revenu parfaitement repassé. Livraison ponctuelle et personnel très professionnel. Je recommande vivement !',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        serviceType: 'Pressing Lingerie',
        serviceDetails: {
            items: ['Costume 3 pièces', '2 chemises'],
            total: '12 500 FCFA'
        },
        commentCount: 3
    },
    {
        id: '2',
        customerName: 'Jean Traoré',
        rating: 4,
        comment: 'Bon rapport qualité-prix. Le pressing est bien fait mais la livraison avait un peu de retard. Dans l\'ensemble satisfait.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        serviceType: 'Blanchisserie',
        commentCount: 1
    },
    {
        id: '3',
        customerName: 'Aïcha Diarra',
        rating: 5,
        comment: 'Mes robes délicates ont été parfaitement traitées. Le service client est aux petits soins. Je suis une cliente fidèle maintenant !',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        serviceType: 'Pressing Lingerie',
        serviceDetails: {
            items: ['Robe de soirée', '2 robes en soie'],
            total: '18 000 FCFA'
        },
        commentCount: 5
    },
    {
        id: '4',
        customerName: 'Paul Kouassi',
        rating: 3,
        comment: 'Le pressing est correct mais j\'ai eu une petite tache qui n\'est pas partie complètement. Le prix est raisonnable.',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        serviceType: 'Nettoyage',
        commentCount: 0
    },
    {
        id: '5',
        customerName: 'Fatoumata Sy',
        rating: 5,
        comment: 'Excellente qualité de service. Mes vêtements sont toujours impeccables. Je recommande sans hésitation !',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        serviceType: 'Pressing Complet',
        serviceDetails: {
            items: ['5 chemises', '2 pantalons', '1 veste'],
            total: '15 000 FCFA'
        },
        commentCount: 2
    },
    {
        id: '6',
        customerName: 'Mohamed Cissé',
        rating: 4,
        comment: 'Bon service dans l\'ensemble. Délais respectés et prix corrects. Je reviendrai.',
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        serviceType: 'Blanchisserie',
        commentCount: 1
    },
    {
        id: '7',
        customerName: 'Sophie Bamba',
        rating: 5,
        comment: 'Service rapide et efficace. Mes vêtements sont toujours parfaitement entretenus. Un pressing de confiance !',
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        serviceType: 'Pressing Express',
        serviceDetails: {
            items: ['3 chemisiers', '1 jupe'],
            total: '8 000 FCFA'
        },
        commentCount: 2
    },
    {
        id: '8',
        customerName: 'David Keita',
        rating: 2,
        comment: 'Déçu par le service. Retard de livraison et qualité moyenne. J\'espère que cela s\'améliorera.',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        serviceType: 'Nettoyage',
        commentCount: 1
    }
])

const activeFilter = ref('all')
const sortBy = ref('newest')
const displayedReviews = ref(6)
const loading = ref(false)

// Computed properties
const totalReviews = computed(() => reviews.value.length)

const averageRating = computed(() => {
    if (totalReviews.value === 0) return '0.0'
    const total = reviews.value.reduce((sum, review) => sum + review.rating, 0)
    return (total / totalReviews.value).toFixed(1)
})

const ratingDistribution = computed(() => {
    const distribution = [0, 0, 0, 0, 0] // 5,4,3,2,1 étoiles
    reviews.value.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
            distribution[5 - review.rating]++
        }
    })
    return distribution
})

const positiveReviewsPercentage = computed(() => {
    const positive = reviews.value.filter(review => review.rating >= 4).length
    return Math.round((positive / totalReviews.value) * 100)
})

const totalComments = computed(() => {
    return reviews.value.reduce((total, review) => total + review.commentCount, 0)
})

const thisMonthReviews = computed(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return reviews.value.filter(review => new Date(review.date) >= startOfMonth).length
})

const filters = computed(() => {
    const newReviews = reviews.value.filter(review => isNewReview(review.date)).length

    return [
        { key: 'all', label: 'Tous les avis', count: totalReviews.value },
        { key: '5', label: '5 étoiles', count: ratingDistribution.value[0] },
        { key: '4', label: '4 étoiles', count: ratingDistribution.value[1] },
        { key: '3', label: '3 étoiles', count: ratingDistribution.value[2] },
        { key: '2', label: '2 étoiles', count: ratingDistribution.value[3] },
        { key: '1', label: '1 étoile', count: ratingDistribution.value[4] },
        { key: 'new', label: 'Nouveaux', count: newReviews }
    ]
})

const filteredReviews = computed(() => {
    let filtered = [...reviews.value]

    // Appliquer le filtre
    if (activeFilter.value !== 'all') {
        if (activeFilter.value === 'new') {
            filtered = filtered.filter(review => isNewReview(review.date))
        } else {
            filtered = filtered.filter(review => review.rating === parseInt(activeFilter.value))
        }
    }

    // Appliquer le tri
    switch (sortBy.value) {
        case 'newest':
            filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            break
        case 'oldest':
            filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            break
        case 'highest':
            filtered.sort((a, b) => b.rating - a.rating)
            break
        case 'lowest':
            filtered.sort((a, b) => a.rating - b.rating)
            break
    }

    return filtered.slice(0, displayedReviews.value)
})

const hasMoreReviews = computed(() => {
    let filtered = [...reviews.value]
    if (activeFilter.value !== 'all') {
        if (activeFilter.value === 'new') {
            filtered = filtered.filter(review => isNewReview(review.date))
        } else {
            filtered = filtered.filter(review => review.rating === parseInt(activeFilter.value))
        }
    }
    return displayedReviews.value < filtered.length
})

// Methods
const setFilter = (filter) => {
    activeFilter.value = filter
    displayedReviews.value = 6
    scrollToReviews()
}

const resetFilters = () => {
    activeFilter.value = 'all'
    sortBy.value = 'newest'
    displayedReviews.value = 6
    scrollToReviews()
}

const applySort = () => {
    scrollToReviews()
}

const isNewReview = (date) => {
    const reviewDate = new Date(date)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return reviewDate >= sevenDaysAgo
}

const getInitials = (name) => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`

    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

const loadMoreReviews = async () => {
    loading.value = true

    // Simuler un délai de chargement
    await new Promise(resolve => setTimeout(resolve, 1000))

    displayedReviews.value += 6
    loading.value = false
}

const scrollToReviews = () => {
    nextTick(() => {
        const reviewsSection = document.querySelector('.reviews-section')
        if (reviewsSection) {
            reviewsSection.scrollIntoView({ behavior: 'smooth' })
        }
    })
}

const scrollToComments = () => {
    nextTick(() => {
        const reviewsList = document.querySelector('.reviews-list')
        if (reviewsList) {
            reviewsList.scrollIntoView({ behavior: 'smooth' })
        }
    })
}

// Lifecycle
onMounted(() => {
    // Animation pour les barres de progression
    nextTick(() => {
        const progressBars = document.querySelectorAll('.progress-fill')
        progressBars.forEach(bar => {
            const count = bar.dataset.count
            if (count > 0) {
                bar.style.width = '0%'
                setTimeout(() => {
                    bar.style.width = `${(count / totalReviews.value) * 100}%`
                }, 300)
            }
        })
    })
})
</script>

<style scoped src="@/DashboardOthers/Assets/Styles/Avis.css"></style>