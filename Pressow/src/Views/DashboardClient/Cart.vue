<template>
  <div class="cart-page">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
      </button>
      <h1>Mon panier</h1>
      <button v-if="clientStore.cart.length > 0" class="clear-btn" @click="showClearConfirm = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3,6 5,6 21,6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
      <div v-else class="header-spacer"></div>
    </header>

    <!-- Empty Cart -->
    <div v-if="clientStore.cart.length === 0" class="empty-cart">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      </div>
      <h2>Votre panier est vide</h2>
      <p>Ajoutez des articles depuis un pressing pour commencer</p>
      <router-link to="/client" class="browse-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        Trouver un pressing
      </router-link>
    </div>

    <!-- Cart Content -->
    <div v-else class="cart-content">
      <!-- Cart Items by Provider -->
      <div class="cart-sections">
        <div
          v-for="(items, providerId) in clientStore.cartByProvider"
          :key="providerId"
          class="provider-section"
        >
          <!-- Provider Header -->
          <div class="provider-header">
            <div class="provider-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
            </div>
            <div class="provider-info">
              <h3>{{ items[0]?.providerName || 'Pressing' }}</h3>
              <span class="items-count">{{ items.length }} article{{ items.length > 1 ? 's' : '' }}</span>
            </div>
            <span class="provider-total">{{ formatPrice(getProviderTotal(items)) }} FCFA</span>
          </div>

          <!-- Items List -->
          <div class="items-list">
            <div v-for="(item, idx) in items" :key="idx" class="cart-item">
              <div class="item-info">
                <h4>{{ item.serviceName }}</h4>
                <p v-if="item.articleTypeName" class="item-details">
                  {{ item.articleTypeName }}
                  <span v-if="item.matiereName"> - {{ item.matiereName }}</span>
                </p>
                <span class="item-price">{{ formatPrice(item.prix) }} FCFA / unité</span>
              </div>

              <div class="item-actions">
                <div class="quantity-control">
                  <button class="qty-btn" @click="decreaseQuantity(getCartIndex(item))">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button class="qty-btn" @click="increaseQuantity(getCartIndex(item))">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
                <span class="item-total">{{ formatPrice(item.prix * item.quantity) }} FCFA</span>
              </div>

              <button class="remove-btn" @click="removeItem(getCartIndex(item))">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <h3>Récapitulatif</h3>
        
        <div class="summary-row">
          <span>Sous-total</span>
          <span>{{ formatPrice(clientStore.cartTotal) }} FCFA</span>
        </div>
        
        <div class="summary-row">
          <span>Frais de service</span>
          <span>{{ formatPrice(serviceFees) }} FCFA</span>
        </div>
        
        <div class="summary-row estimated">
          <span>Livraison estimée</span>
          <span class="delivery-note">Calculée au checkout</span>
        </div>
        
        <div class="summary-divider"></div>
        
        <div class="summary-row total">
          <span>Total estimé</span>
          <span>{{ formatPrice(estimatedTotal) }} FCFA</span>
        </div>
      </div>

      <!-- Info Notice -->
      <div class="info-notice">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <p>Le prix final sera calculé après vérification des articles par le pressing.</p>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div v-if="clientStore.cart.length > 0" class="bottom-actions">
      <router-link to="/client" class="continue-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15,18 9,12 15,6"></polyline>
        </svg>
        Continuer mes achats
      </router-link>
      <router-link to="/client/checkout" class="checkout-btn">
        Commander
        <span class="checkout-amount">{{ formatPrice(estimatedTotal) }} FCFA</span>
      </router-link>
    </div>

    <!-- Clear Cart Confirmation Modal -->
    <div v-if="showClearConfirm" class="modal-overlay" @click.self="showClearConfirm = false">
      <div class="confirm-modal">
        <div class="confirm-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>
        <h3>Vider le panier ?</h3>
        <p>Cette action supprimera tous les articles de votre panier.</p>
        <div class="confirm-actions">
          <button class="cancel-btn" @click="showClearConfirm = false">Annuler</button>
          <button class="confirm-btn" @click="clearCart">Vider le panier</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useClientStore, type CartItem } from '@/stores/client'

const router = useRouter()
const clientStore = useClientStore()

// State
const showClearConfirm = ref(false)

// Computed
const serviceFees = computed(() => {
  // Frais de service: 2% du total avec minimum 100 FCFA
  const fees = Math.round(clientStore.cartTotal * 0.02)
  return Math.max(fees, 100)
})

const estimatedTotal = computed(() => {
  return clientStore.cartTotal + serviceFees.value
})

// Methods
function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(price))
}

function goBack() {
  router.back()
}

function getCartIndex(item: CartItem): number {
  return clientStore.cart.findIndex(
    i => i.providerServiceId === item.providerServiceId &&
         i.articleTypeId === item.articleTypeId &&
         i.matiereId === item.matiereId
  )
}

function getProviderTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.prix * item.quantity), 0)
}

function increaseQuantity(index: number) {
  if (index >= 0) {
    clientStore.updateCartItemQuantity(index, clientStore.cart[index].quantity + 1)
  }
}

function decreaseQuantity(index: number) {
  if (index >= 0) {
    const item = clientStore.cart[index]
    if (item.quantity > 1) {
      clientStore.updateCartItemQuantity(index, item.quantity - 1)
    } else {
      removeItem(index)
    }
  }
}

function removeItem(index: number) {
  if (index >= 0) {
    clientStore.removeFromCart(index)
  }
}

function clearCart() {
  clientStore.clearCart()
  showClearConfirm.value = false
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 100px;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 64px;
  z-index: 50;
}

.back-btn,
.clear-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 10px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover,
.clear-btn:hover {
  background: #e5e7eb;
}

.clear-btn {
  color: #ef4444;
}

.clear-btn:hover {
  background: #fef2f2;
}

.page-header h1 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

/* Empty Cart */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  width: 100px;
  height: 100px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  margin-bottom: 24px;
}

.empty-cart h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.empty-cart p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.browse-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: #37A1EF;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-size: 0.938rem;
  font-weight: 600;
  transition: background 0.2s;
}

.browse-btn:hover {
  background: #2b8dd4;
}

/* Cart Content */
.cart-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

/* Provider Section */
.cart-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.provider-section {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.provider-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.provider-icon {
  width: 40px;
  height: 40px;
  background: rgba(55, 161, 239, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #37A1EF;
}

.provider-info {
  flex: 1;
}

.provider-info h3 {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 2px 0;
}

.items-count {
  font-size: 0.813rem;
  color: #6b7280;
}

.provider-total {
  font-size: 0.938rem;
  font-weight: 600;
  color: #37A1EF;
}

/* Items List */
.items-list {
  padding: 8px 0;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  position: relative;
  border-bottom: 1px solid #f3f4f6;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h4 {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.item-details {
  font-size: 0.813rem;
  color: #6b7280;
  margin: 0 0 6px 0;
}

.item-price {
  font-size: 0.813rem;
  color: #9ca3af;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: none;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.qty-btn:hover {
  background: #37A1EF;
  color: white;
}

.qty-value {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1f2937;
  min-width: 24px;
  text-align: center;
}

.item-total {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1f2937;
}

.remove-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* Order Summary */
.order-summary {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.order-summary h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.summary-row span:last-child {
  color: #374151;
  font-weight: 500;
}

.summary-row.estimated .delivery-note {
  font-size: 0.813rem;
  color: #9ca3af;
  font-style: italic;
  font-weight: 400;
}

.summary-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 12px 0;
}

.summary-row.total {
  font-size: 1rem;
  color: #1f2937;
  font-weight: 600;
}

.summary-row.total span:last-child {
  font-size: 1.25rem;
  color: #37A1EF;
  font-weight: 700;
}

/* Info Notice */
.info-notice {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(55, 161, 239, 0.08);
  border-radius: 12px;
  color: #37A1EF;
}

.info-notice svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.info-notice p {
  font-size: 0.813rem;
  line-height: 1.5;
  margin: 0;
}

/* Bottom Actions */
.bottom-actions {
  position: fixed;
  bottom: 64px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e5e7eb;
  z-index: 100;
}

.continue-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 16px;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.2s;
}

.continue-link:hover {
  background: #f3f4f6;
  color: #374151;
}

.checkout-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #37A1EF;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
}

.checkout-btn:hover {
  background: #2b8dd4;
}

.checkout-amount {
  font-weight: 500;
  opacity: 0.9;
}

/* Confirm Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.confirm-modal {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.confirm-icon {
  width: 64px;
  height: 64px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.confirm-modal h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.confirm-modal p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.confirm-btn {
  background: #ef4444;
  color: white;
}

.confirm-btn:hover {
  background: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    top: 64px;
  }
  
  .bottom-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .continue-link {
    width: 100%;
    justify-content: center;
    order: 2;
    padding: 12px;
  }
  
  .checkout-btn {
    width: 100%;
    order: 1;
  }
}

@media (max-width: 480px) {
  .cart-item {
    flex-wrap: wrap;
  }
  
  .item-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed #e5e7eb;
  }
}
</style>
