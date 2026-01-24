<template>
  <div class="orders-page">
    <div class="page-header">
      <h1>Mes Commandes</h1>
    </div>

    <div v-if="clientStore.isLoading" class="loading">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>

    <div v-else-if="clientStore.clientOrders.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14,2 14,8 20,8"></polyline>
      </svg>
      <h3>Aucune commande</h3>
      <p>Vos commandes apparaîtront ici</p>
      <router-link to="/client" class="btn-primary">Trouver un pressing</router-link>
    </div>

    <div v-else class="orders-list">
      <div
        v-for="order in clientStore.clientOrders"
        :key="order.id"
        class="order-card"
        @click="goToOrder(order.id)"
      >
        <div class="order-header">
          <span class="order-numero">#{{ order.numero }}</span>
          <span class="order-status" :class="getStatusClass(order.statut)">
            {{ order.statut_display }}
          </span>
        </div>
        <div class="order-body">
          <p class="order-provider">{{ order.provider.nom_commercial }}</p>
          <p class="order-date">{{ formatDate(order.created) }}</p>
        </div>
        <div class="order-footer">
          <span class="order-amount">{{ formatCurrency(order.total_estime) }}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClientStore } from '@/stores/client'

const router = useRouter()
const clientStore = useClientStore()

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    collected: 'status-progress',
    in_progress: 'status-progress',
    ready: 'status-ready',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
  }
  return classes[status] || ''
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

function goToOrder(orderId: string) {
  router.push(`/client/orders/${orderId}`)
}

onMounted(() => {
  clientStore.fetchClientOrders()
})
</script>

<style scoped>
.orders-page {
  padding: 24px 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px;
  color: #6b7280;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #37A1EF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 16px 0 8px;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 24px;
}

.btn-primary {
  padding: 12px 24px;
  background: #37A1EF;
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 500;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-numero {
  font-weight: 600;
  color: #1f2937;
}

.order-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}

.status-pending { background: rgba(249, 161, 59, 0.15); color: #d97706; }
.status-confirmed { background: rgba(55, 161, 239, 0.15); color: #37A1EF; }
.status-progress { background: rgba(55, 161, 239, 0.2); color: #2589d4; }
.status-ready { background: rgba(16, 185, 129, 0.15); color: #059669; }
.status-delivered { background: rgba(100, 116, 139, 0.15); color: #475569; }
.status-cancelled { background: rgba(239, 68, 68, 0.15); color: #dc2626; }

.order-body {
  margin-bottom: 12px;
}

.order-provider {
  font-size: 0.9375rem;
  color: #374151;
  margin: 0 0 4px;
}

.order-date {
  font-size: 0.8125rem;
  color: #9ca3af;
  margin: 0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.order-amount {
  font-weight: 600;
  color: #1f2937;
}
</style>
