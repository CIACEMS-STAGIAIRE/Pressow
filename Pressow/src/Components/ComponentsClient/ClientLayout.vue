<template>
  <div class="client-layout">
    <!-- Header -->
    <header class="client-header">
      <div class="header-container">
        <router-link to="/client" class="logo">
          <img src="/logo_v2_r.png" alt="Pressow" />
        </router-link>

        <nav class="header-nav">
          <router-link to="/client" class="nav-link" active-class="active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9,22 9,12 15,12 15,22"></polyline>
            </svg>
            <span>Accueil</span>
          </router-link>

          <router-link to="/client/orders" class="nav-link" active-class="active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span>Commandes</span>
            <span v-if="pendingOrdersCount > 0" class="badge">{{ pendingOrdersCount }}</span>
          </router-link>
        </nav>

        <div class="header-actions">
          <router-link to="/client/cart" class="cart-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span v-if="cartItemsCount > 0" class="cart-badge">{{ cartItemsCount }}</span>
          </router-link>

          <div class="user-menu" @click="toggleUserMenu">
            <div class="user-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span class="user-name">{{ userName }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>

            <div v-if="showUserMenu" class="user-dropdown">
              <router-link to="/client/profile" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Mon profil
              </router-link>
              <button @click="handleLogout" class="dropdown-item logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16,17 21,12 16,7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="client-main">
      <router-view />
    </main>

    <!-- Bottom Navigation (Mobile) -->
    <nav class="bottom-nav">
      <router-link to="/client" class="bottom-nav-item" active-class="active" exact>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9,22 9,12 15,12 15,22"></polyline>
        </svg>
        <span>Accueil</span>
      </router-link>

      <router-link to="/client/orders" class="bottom-nav-item" active-class="active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
        </svg>
        <span>Commandes</span>
        <span v-if="pendingOrdersCount > 0" class="nav-badge">{{ pendingOrdersCount }}</span>
      </router-link>

      <router-link to="/client/cart" class="bottom-nav-item" active-class="active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span>Panier</span>
        <span v-if="cartItemsCount > 0" class="nav-badge">{{ cartItemsCount }}</span>
      </router-link>

      <router-link to="/client/profile" class="bottom-nav-item" active-class="active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Profil</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/client'

const router = useRouter()
const authStore = useAuthStore()
const clientStore = useClientStore()

const showUserMenu = ref(false)

const userName = computed(() => {
  const user = authStore.user
  if (user?.first_name) {
    return user.first_name
  }
  return 'Mon compte'
})

const cartItemsCount = computed(() => clientStore.cartItemsCount)
const pendingOrdersCount = computed(() => clientStore.pendingOrders.length)

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function closeUserMenu(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

async function handleLogout() {
  try {
    await authStore.logout()
  } catch (error) {
    // Même en cas d'erreur, on nettoie la session localement
    console.error('Logout error:', error)
    authStore.clearSession()
  }
  // Toujours rediriger vers la connexion
  router.push('/connexion')
}

onMounted(() => {
  clientStore.init()
  clientStore.fetchClientOrders()
  document.addEventListener('click', closeUserMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu)
})
</script>

<style scoped>
.client-layout {
  min-height: 100vh;
  background: #f8fafc;
}

/* Header */
.client-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo img {
  height: 36px;
  width: auto;
}

.header-nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-link.active {
  background: rgba(55, 161, 239, 0.1);
  color: #37A1EF;
}

.badge {
  background: #F9A13B;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cart-btn {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 10px;
  color: #374151;
  transition: all 0.2s;
}

.cart-btn:hover {
  background: #e5e7eb;
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  background: #37A1EF;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f3f4f6;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-menu:hover {
  background: #e5e7eb;
}

.user-avatar {
  width: 28px;
  height: 28px;
  background: #37A1EF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  color: #374151;
  font-size: 0.875rem;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item.logout {
  color: #dc2626;
  border-top: 1px solid #e5e7eb;
}

/* Main Content */
.client-main {
  padding-top: 64px;
  padding-bottom: 80px;
  min-height: calc(100vh - 64px);
}

/* Bottom Navigation */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  border-top: 1px solid #e5e7eb;
  z-index: 100;
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.75rem;
  position: relative;
  transition: color 0.2s;
}

.bottom-nav-item.active {
  color: #37A1EF;
}

.nav-badge {
  position: absolute;
  top: 4px;
  right: calc(50% - 20px);
  min-width: 16px;
  height: 16px;
  background: #F9A13B;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-nav {
    display: none;
  }

  .user-name {
    display: none;
  }

  .bottom-nav {
    display: flex;
  }

  .client-main {
    padding-bottom: 80px;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 16px;
  }

  .logo img {
    height: 30px;
  }
}
</style>
