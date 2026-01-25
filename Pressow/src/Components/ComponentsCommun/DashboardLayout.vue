<template>
  <div class="Dashboard-layout">
    <!-- Main Content -->
    <main class="main-content" :class="{ 'main-content-expanded': isSidebarCollapsed }">
      <div class="content-wrapper">
        <slot></slot>
      </div>
    </main>
    <!-- Mobile Menu Button -->
    <div class="mobile-menu-btn">
      <button class="menu-toggle" @click="toggleSidebar">
        <i :class="sidebarOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
      </button>
    </div>

    <!-- Sidebar -->
    <aside :class="['sidebar', {
      'sidebar-open': sidebarOpen,
      'sidebar-collapsed': isSidebarCollapsed
    }]">
      <div class="sidebar-content">
        <!-- User Info avec logo/photo du provider -->
        <div class="user-info" :class="{ 'user-info-collapsed': isSidebarCollapsed }">
          <div class="user-info-container">
            <!-- Avatar avec logo/photo ou initiales -->
            <div class="user-avatar" :class="{ 'has-image': providerPhoto || providerLogo }">
              <img 
                v-if="providerPhoto || providerLogo" 
                :src="(providerPhoto || providerLogo) ?? undefined" 
                :alt="displayName"
                class="avatar-image"
                @error="handleImageError"
              />
              <span v-else class="avatar-initial">{{ userInitial }}</span>
            </div>
            <div class="user-details" v-if="!isSidebarCollapsed">
              <p class="user-name">{{ displayName }}</p>
              <p class="user-phone">{{ displayPhone }}</p>
            </div>
            <!-- Collapse Toggle Button -->
            <div class="collapse-toggle">
              <button class="collapse-btn" @click="toggleSidebarCollapse">
                <!-- SVG inline au lieu de FontAwesome -->
                <svg v-if="isSidebarCollapsed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <!-- Indicateur de statut ouvert/fermé -->
          <div v-if="!isSidebarCollapsed" class="provider-status">
            <span :class="['status-indicator', isProviderOpen ? 'status-open' : 'status-closed']"></span>
            <span class="status-text">{{ isProviderOpen ? 'Ouvert' : 'Fermé' }}</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="nav-menu">
          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- ACCÈS RAPIDES (Toujours visibles) -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div class="quick-access" :class="{ 'quick-access-collapsed': isSidebarCollapsed }">
            <!-- Tableau de bord -->
            <button @click="navigateTo('/Dashboard')" :class="['quick-btn', { 'quick-btn-active': isActive('/Dashboard') }]" :title="isSidebarCollapsed ? 'Tableau de bord' : ''">
              <!-- SVG Home -->
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span v-if="!isSidebarCollapsed">Accueil</span>
            </button>
            <!-- Notifications (Cloche) -->
            <button @click="navigateTo('/dashboard/notifications')" :class="['quick-btn notification-btn', { 'quick-btn-active': isActive('/dashboard/notifications') }]" :title="isSidebarCollapsed ? 'Notifications' : ''">
              <!-- SVG Bell -->
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span v-if="!isSidebarCollapsed">Alertes</span>
              <div class="notification-badge" v-if="unreadNotifications > 0">{{ unreadNotifications > 99 ? '99+' : unreadNotifications }}</div>
            </button>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- MODULE: GESTION INTERNE -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div class="nav-module" v-if="!isSidebarCollapsed">
            <button class="module-header" @click="toggleModule('gestion')" :class="{ 'module-open': expandedModules.gestion }">
              <div class="module-icon">
                <!-- SVG Clipboard/Tasks -->
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
              <span class="module-title">Gestion Interne</span>
              <!-- SVG Chevron -->
              <svg class="module-chevron" :class="{ 'chevron-rotated': expandedModules.gestion }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="module-content" v-show="expandedModules.gestion">
              <!-- Commandes -->
              <button @click="navigateToSubitem('/Dashboard/Commandes', 'gestion')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/Dashboard/Commandes') }]">
                <!-- SVG Shopping Bag -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>Commandes</span>
                <div class="nav-badge" v-if="pendingOrdersCount > 0">{{ pendingOrdersCount }}</div>
              </button>
              <!-- Portefeuille -->
              <button v-if="!isManager" @click="navigateToSubitem('/dashboard/portefeuille', 'gestion')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/portefeuille') }]">
                <!-- SVG Wallet -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"></path>
                </svg>
                <span>Portefeuille</span>
                <div class="nav-badge wallet-badge" v-if="walletBalance > 0">{{ formatCurrency(walletBalance) }}</div>
              </button>
            </div>
          </div>
          <!-- Collapsed: Commandes icon only -->
          <button v-if="isSidebarCollapsed" @click="navigateTo('/Dashboard/Commandes')" :class="['nav-item', 'nav-item-collapsed', { 'nav-item-active': isActive('/Dashboard/Commandes') }]" title="Commandes">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div class="nav-badge-collapsed" v-if="pendingOrdersCount > 0">{{ pendingOrdersCount }}</div>
          </button>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- MODULE: RELATION CLIENT -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div class="nav-module" v-if="!isSidebarCollapsed">
            <button class="module-header" @click="toggleModule('relation')" :class="{ 'module-open': expandedModules.relation }">
              <div class="module-icon">
                <!-- SVG Users -->
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span class="module-title">Relation Client</span>
              <svg class="module-chevron" :class="{ 'chevron-rotated': expandedModules.relation }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="module-content" v-show="expandedModules.relation">
              <!-- Annuaire Clients -->
              <button @click="navigateToSubitem('/dashboard/clients', 'relation')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/clients') }]">
                <!-- SVG Address Book -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                  <path d="M15 16H9"></path>
                </svg>
                <span>Annuaire Clients</span>
              </button>
              <!-- Avis & Témoignages -->
              <button @click="navigateToSubitem('/dashboard/avis', 'relation')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/avis') }]">
                <!-- SVG Star -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>Avis & Témoignages</span>
                <div class="nav-badge rating-badge">{{ userRating }}</div>
              </button>
              <!-- Marketing -->
              <button @click="navigateToSubitem('/dashboard/marketing', 'relation')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/marketing') }]">
                <!-- SVG Megaphone -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Marketing</span>
              </button>
            </div>
          </div>
          <!-- Collapsed: Relation Client icon only -->
          <button v-if="isSidebarCollapsed" @click="navigateTo('/dashboard/clients')" :class="['nav-item', 'nav-item-collapsed', { 'nav-item-active': isActive('/dashboard/clients') || isActive('/dashboard/avis') || isActive('/dashboard/marketing') }]" title="Relation Client">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </button>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- MODULE: RESSOURCES HUMAINES -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div class="nav-module" v-if="!isSidebarCollapsed">
            <button class="module-header" @click="toggleModule('rh')" :class="{ 'module-open': expandedModules.rh }">
              <div class="module-icon">
                <!-- SVG User Tie -->
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                  <line x1="12" y1="11" x2="12" y2="17"></line>
                  <line x1="9" y1="14" x2="15" y2="14"></line>
                </svg>
              </div>
              <span class="module-title">Ressources Humaines</span>
              <svg class="module-chevron" :class="{ 'chevron-rotated': expandedModules.rh }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="module-content" v-show="expandedModules.rh">
              <!-- Employés -->
              <button @click="navigateToSubitem('/dashboard/employes', 'rh')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/employes') }]">
                <!-- SVG ID Badge -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="12" cy="10" r="3"></circle>
                  <path d="M7 17h10"></path>
                </svg>
                <span>Employés</span>
              </button>
              <!-- Planning -->
              <button @click="navigateToSubitem('/dashboard/planning', 'rh')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/planning') }]">
                <!-- SVG Calendar -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Planning</span>
              </button>
            </div>
          </div>
          <!-- Collapsed: RH icon only -->
          <button v-if="isSidebarCollapsed" @click="navigateTo('/dashboard/employes')" :class="['nav-item', 'nav-item-collapsed', { 'nav-item-active': isActive('/dashboard/employes') || isActive('/dashboard/planning') }]" title="Ressources Humaines">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </button>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- ANALYSE ET RAPPORTS (Direct - Style module) -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div class="nav-module-single" v-if="!isSidebarCollapsed">
            <button class="module-header module-single" @click="navigateTo('/dashboard/statistics')" :class="{ 'module-active': isActive('/dashboard/statistics') }">
              <div class="module-icon">
                <!-- SVG Chart Pie -->
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                  <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                </svg>
              </div>
              <span class="module-title">Analyse et Rapports</span>
            </button>
          </div>
          <!-- Collapsed: Analyse icon only -->
          <button v-if="isSidebarCollapsed" @click="navigateTo('/dashboard/statistics')" :class="['nav-item', 'nav-item-collapsed', { 'nav-item-active': isActive('/dashboard/statistics') }]" title="Analyse et Rapports">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
            </div>
          </button>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- MODULE: CONFIGURATION -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div class="nav-module" v-if="!isSidebarCollapsed">
            <button class="module-header" @click="toggleModule('config')" :class="{ 'module-open': expandedModules.config }">
              <div class="module-icon">
                <!-- SVG Settings -->
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <span class="module-title">Configuration</span>
              <svg class="module-chevron" :class="{ 'chevron-rotated': expandedModules.config }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="module-content" v-show="expandedModules.config">
              <!-- Mes Services -->
              <button @click="navigateToSubitem('/dashboard/services', 'config')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/services') }]">
                <!-- SVG Service Bell -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"></path>
                  <path d="M1 17h22"></path>
                  <path d="M6 17v1a3 3 0 0 0 6 0v-1"></path>
                </svg>
                <span>Mes Services</span>
              </button>
              <!-- Profil -->
              <button @click="navigateToSubitem('/dashboard/profile', 'config')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/profile') }]">
                <!-- SVG User -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Profil</span>
              </button>
              <!-- Paramètres -->
              <button @click="navigateToSubitem('/dashboard/parametres', 'config')" :class="['nav-subitem', { 'nav-subitem-active': isActive('/dashboard/parametres') }]">
                <!-- SVG Sliders -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                <span>Paramètres</span>
              </button>
            </div>
          </div>
          <!-- Collapsed: Config icon only -->
          <button v-if="isSidebarCollapsed" @click="navigateTo('/dashboard/services')" :class="['nav-item', 'nav-item-collapsed', { 'nav-item-active': isActive('/dashboard/services') || isActive('/dashboard/profile') || isActive('/dashboard/parametres') }]" title="Configuration">
            <div class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
          </button>
        </nav>

      </div>
      <!-- Logout Button -->
      <div class="sidebar-footer" :class="{ 'sidebar-footer-collapsed': isSidebarCollapsed }">
        <button class="logout-btn" @click="handleLogout" :disabled="isLoggingOut"
          :title="isSidebarCollapsed ? 'Déconnexion' : ''">
          <div class="logout-icon">
            <!-- SVG Logout -->
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
          <span class="logout-text" v-if="!isSidebarCollapsed">
            {{ isLoggingOut ? 'Déconnexion...' : 'Déconnexion' }}
          </span>
        </button>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <!-- SVG Logout Icon -->
          <svg class="modal-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <h3>Confirmer la déconnexion</h3>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir vous déconnecter de votre compte ?</p>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showLogoutModal = false">
            Annuler
          </button>
          <button class="confirm-logout-btn" @click="confirmLogout" :disabled="isLoggingOut">
            <!-- SVG Logout -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {{ isLoggingOut ? 'Déconnexion...' : 'Se déconnecter' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { useOnboardingStore } from '@/stores/onboarding'
import api from '@/services/api'
import { getImageUrl } from '@/utils/media'

// ====================================================================
// TYPES ET INTERFACES
// ====================================================================

interface User {
  id: string
  name: string
  displayName: string
  first_name: string
  last_name: string
  companyName: string
  phone: string
  email: string
  password: string
  serviceType: string
  type: string
  city: string
  adresse: string
  quartier: string
  role: string
  isVerified: boolean
  statut_kyc: string
  phone_verified_at: string
  date_inscription: string
  currentShopId: string
  shops: any[]
  bankAccounts: any[]
  joinDate: string
}

interface Shop {
  id: string
  name: string
  prestations: string[]
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: string
  meta?: {
    orderId?: string
    service?: string
    amount?: number
    customer?: string
  }
  actions?: Array<{
    type: string
    label: string
    icon: string
  }>
}

// ====================================================================
// ÉTATS RÉACTIFS
// ====================================================================

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
const onboardingStore = useOnboardingStore()

// États de l'interface
const sidebarOpen = ref(false)
const showLogoutModal = ref(false)
const isLoggingOut = ref(false)
const isSidebarCollapsed = ref(false)
const notificationInterval = ref<number | null>(null)
const isLoadingData = ref(false)

// États des modules dépliables (initialisé vide, sera défini au montage)
const expandedModules = ref({
  gestion: false,
  relation: false,
  rh: false,
  config: false
})

// Mapping des routes vers les modules
const routeToModule: Record<string, 'gestion' | 'relation' | 'rh' | 'config'> = {
  '/Dashboard/Commandes': 'gestion',
  '/dashboard/portefeuille': 'gestion',
  '/dashboard/clients': 'relation',
  '/dashboard/avis': 'relation',
  '/dashboard/marketing': 'relation',
  '/dashboard/employes': 'rh',
  '/dashboard/planning': 'rh',
  '/dashboard/services': 'config',
  '/dashboard/profile': 'config',
  '/dashboard/parametres': 'config'
}

// Données utilisateur
const displayUser = ref<User | null>(null)
const activeShop = ref<Shop | null>(null)

// Données de navigation (utilise les stores pour les vraies données)
const unreadNotifications = ref(0)

// Données provider depuis le backend
const providerLogo = ref<string | null>(null)
const providerPhoto = ref<string | null>(null)

// ====================================================================
// COMPUTED PROPERTIES
// ====================================================================

// Utilise les données du store dashboard (vraies données backend)
const providerName = computed(() => {
  return dashboardStore.provider?.name || onboardingStore.businessName || displayUser.value?.companyName || 'Mon Pressing'
})

const userInitial = computed(() => {
  return providerName.value?.charAt(0).toUpperCase() || 'P'
})

const displayName = computed(() => {
  return providerName.value
})

const displayPhone = computed(() => {
  return authStore.user?.phone || displayUser.value?.phone || 'Non renseigné'
})

const isManager = computed(() => {
  return authStore.user?.role === 'provider_manager' || displayUser.value?.role === 'manager'
})

// Données du dashboard depuis le backend
const pendingOrdersCount = computed(() => dashboardStore.pendingOrdersCount)
const walletBalance = computed(() => dashboardStore.wallet?.balance ?? 0)
const userRating = computed(() => '4.8') // TODO: ajouter API pour note moyenne
const isProviderOpen = computed(() => onboardingStore.isOpen || dashboardStore.isOpen)

// ====================================================================
// FONCTIONS UTILITAIRES
// ====================================================================

const loadUserData = (): void => {
  // Essayer d'abord depuis sessionStorage (données fraîches)
  const sessionUser = sessionStorage.getItem('currentUserData')
  if (sessionUser) {
    displayUser.value = JSON.parse(sessionUser)
    updateActiveShop()
    return
  }

  // Sinon charger depuis localStorage
  const localUser = localStorage.getItem('currentUser')
  if (localUser) {
    displayUser.value = JSON.parse(localUser)
    updateActiveShop()
  }
}

/**
 * Charge les données du provider depuis le backend
 */
const loadProviderData = async (): Promise<void> => {
  isLoadingData.value = true
  try {
    // Charger les données du dashboard (provider, stats, wallet, photo, etc.)
    await dashboardStore.fetchDashboard()
    
    // Récupérer la photo depuis le dashboard (ajoutée à l'API)
    const dashboardProvider = dashboardStore.data?.provider
    if (dashboardProvider?.photo) {
      providerPhoto.value = dashboardProvider.photo
    }
    
    // Charger le statut d'onboarding pour le nom commercial
    await onboardingStore.fetchStatus()
    
    // Charger les settings provider pour récupérer le logo
    try {
      const settingsResponse = await api.get('/providers/settings/')
      if (settingsResponse.data?.logo_url) {
        providerLogo.value = getImageUrl(settingsResponse.data.logo_url)
      }
      // Si pas de logo mais une photo storefront, l'utiliser
      if (!providerLogo.value && settingsResponse.data?.storefront_photo_url) {
        providerPhoto.value = getImageUrl(settingsResponse.data.storefront_photo_url)
      }
    } catch (settingsErr) {
      console.warn('Settings non disponibles:', settingsErr)
    }
  } catch (err) {
    console.error('Erreur chargement données provider:', err)
  } finally {
    isLoadingData.value = false
  }
}

/**
 * Formate un montant en devise FCFA
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-CI', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' F'
}

/**
 * Gère les erreurs de chargement d'image (affiche les initiales)
 */
const handleImageError = (event: Event): void => {
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.display = 'none'
  }
  // Réinitialiser pour afficher les initiales
  providerPhoto.value = null
  providerLogo.value = null
}

const updateActiveShop = (): void => {
  if (displayUser.value?.shops && displayUser.value.shops.length > 0) {
    activeShop.value = displayUser.value.shops[0]
  }
}

const getServiceLabel = (serviceType: string): string => {
  const services: Record<string, string> = {
    'pressing-linge': 'Pressing Linge',
    'pressing-chaussures': 'Pressing Chaussures',
    'blanchisserie': 'Blanchisserie',
    'laverie': 'Laverie',
    'fanico': 'Fanico',
    'nettoyage': 'Nettoyage'
  }
  return services[serviceType] || serviceType
}

// Fonctions pour les prestations
const getPrestationLabel = (prestation: string) => {
  const labels: Record<string, string> = {
    'pressing': 'Pressing',
    'pressing-linge': 'Pressing Linge',
    'pressing_lingerie': 'Pressing Lingerie',
    'pressing-chaussures': 'Pressing Chaussures',
    'pressing_chaussures': 'Pressing Chaussures',
    'blanchisserie': 'Blanchisserie',
    'laverie': 'Laverie',
    'fanico': 'Fanico',
    'nettoyage': 'Nettoyage'
  };
  return labels[prestation] || prestation;
};

const getPrestationIcon = (prestation: string) => {
  const icons: Record<string, string> = {
    'pressing': 'fas fa-tshirt',
    'pressing-linge': 'fas fa-tshirt',
    'pressing_lingerie': 'fas fa-tshirt',
    'pressing-chaussures': 'fas fa-shoe-prints',
    'pressing_chaussures': 'fas fa-shoe-prints',
    'blanchisserie': 'fas fa-wind',
    'laverie': 'fas fa-soap',
    'fanico': 'fas fa-home',
    'nettoyage': 'fas fa-broom'
  };
  return icons[prestation] || 'fas fa-concierge-bell';
};

const getPrestationBadgeClass = (prestation: string) => {
  const classes: Record<string, string> = {
    'pressing': 'prestation-badge-blue',
    'pressing-linge': 'prestation-badge-blue',
    'pressing_lingerie': 'prestation-badge-blue',
    'pressing-chaussures': 'prestation-badge-indigo',
    'pressing_chaussures': 'prestation-badge-indigo',
    'blanchisserie': 'prestation-badge-purple',
    'laverie': 'prestation-badge-green',
    'fanico': 'prestation-badge-orange',
    'nettoyage': 'prestation-badge-teal'
  };
  return classes[prestation] || 'prestation-badge-blue';
};

// Fonction pour calculer le nombre de notifications non lues (local)
const calculateUnreadNotifications = (): number => {
  try {
    const savedNotifications = localStorage.getItem('presso_notifications')
    if (savedNotifications) {
      const notifications = JSON.parse(savedNotifications)
      return notifications.filter((notification: any) => !notification.read).length
    }
  } catch (error) {
    console.error('Erreur lors du calcul des notifications non lues:', error)
  }
  return 0
}

// Fonction pour mettre à jour le compteur de notifications non lues
const updateUnreadNotificationsCount = (): void => {
  unreadNotifications.value = calculateUnreadNotifications()
}

// Rafraîchir les données du dashboard (pour les compteurs)
const refreshDashboardData = async (): Promise<void> => {
  try {
    await dashboardStore.fetchDashboard()
  } catch (err) {
    console.debug('Erreur rafraîchissement dashboard:', err)
  }
}

// ====================================================================
// GESTION GLOBALE DES NOTIFICATIONS
// ====================================================================

// Méthode pour simuler les notifications globalement
const simulateGlobalNotification = (): void => {
  if (Math.random() > 0.2) { // 80% de chance
    const types = [
      'order_new',
      'payment_received', 
      'system_alert',
      'order_completed',
      'service_added'
    ]
    
    const randomType = types[Math.floor(Math.random() * types.length)] as string
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: randomType,
      title: getRandomTitle(randomType),
      message: getRandomMessage(randomType),
      timestamp: new Date().toISOString(),
      read: false,
      priority: Math.random() > 0.7 ? 'high' : 'medium'
    }
    
    // Ajouter des métadonnées selon le type
    if (randomType === 'order_new') {
      newNotification.meta = {
        orderId: 'CMD' + (1000 + Math.floor(Math.random() * 900)),
        service: ['Nettoyage à sec', 'Repassage', 'Lavage'][Math.floor(Math.random() * 3)],
        amount: parseFloat((20 + Math.floor(Math.random() * 80)).toFixed(2)),
        customer: ['Marie', 'Pierre', 'Sophie', 'Jean'][Math.floor(Math.random() * 4)] + ' ' + ['Martin', 'Dubois', 'Lambert', 'Moreau'][Math.floor(Math.random() * 4)]
      }
      newNotification.actions = [
        { type: 'view_order', label: 'Voir la commande', icon: 'fas fa-eye' },
        { type: 'accept_order', label: 'Accepter', icon: 'fas fa-check' }
      ]
    } else if (randomType === 'payment_received') {
      newNotification.meta = {
        amount: parseFloat((50 + Math.floor(Math.random() * 200)).toFixed(2))
      }
    }
    
    addGlobalNotification(newNotification)
  }
}

const getRandomTitle = (type: string): string => {
  const titles: Record<string, string> = {
    'order_new': 'Nouvelle commande reçue',
    'payment_received': 'Paiement reçu',
    'system_alert': 'Alerte système',
    'order_completed': 'Commande terminée',
    'service_added': 'Nouveau service'
  }
  return titles[type] || 'Nouvelle notification'
}

const getRandomMessage = (type: string): string => {
  const messages: Record<string, string> = {
    'order_new': 'Une nouvelle commande a été créée pour vos services.',
    'payment_received': 'Un paiement a été crédité sur votre compte.',
    'system_alert': 'Une mise à jour système est disponible.',
    'order_completed': 'Une commande a été livrée avec succès.',
    'service_added': 'Un nouveau service a été configuré.'
  }
  return messages[type] || 'Vous avez une nouvelle notification.'
}

const addGlobalNotification = (newNotification: Notification): void => {
  try {
    const savedNotifications = localStorage.getItem('presso_notifications')
    let notifications = savedNotifications ? JSON.parse(savedNotifications) : []
    
    // Ajouter la nouvelle notification au début
    notifications.unshift(newNotification)
    
    // Sauvegarder dans localStorage
    localStorage.setItem('presso_notifications', JSON.stringify(notifications))
    
    // Émettre l'événement de mise à jour
    window.dispatchEvent(new CustomEvent('notificationsUpdated'))
    
    console.log('Nouvelle notification globale générée:', newNotification)
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la notification globale:', error)
  }
}

// Démarrer la simulation globale des notifications
const startGlobalNotificationSimulation = (): void => {
  // Nettoyer l'intervalle existant
  if (notificationInterval.value) {
    clearInterval(notificationInterval.value)
  }
  
  // Démarrer un nouvel intervalle (toutes les 30 secondes pour les tests)
  notificationInterval.value = setInterval(simulateGlobalNotification, 30000)
  
  console.log('Simulation globale des notifications démarrée')
}

// Arrêter la simulation
const stopGlobalNotificationSimulation = (): void => {
  if (notificationInterval.value) {
    clearInterval(notificationInterval.value)
    notificationInterval.value = null
    console.log('Simulation globale des notifications arrêtée')
  }
}

// ====================================================================
// GESTION DE L'INTERFACE
// ====================================================================

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const toggleSidebarCollapse = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  // Sauvegarder l'état dans localStorage
  localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed.value))
}

const toggleModule = (moduleName: 'gestion' | 'relation' | 'rh' | 'config') => {
  expandedModules.value[moduleName] = !expandedModules.value[moduleName]
  // Sauvegarder l'état dans localStorage
  saveModulesState()
}

const saveModulesState = () => {
  localStorage.setItem('expandedModules', JSON.stringify(expandedModules.value))
}

const loadModulesState = () => {
  const saved = localStorage.getItem('expandedModules')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      expandedModules.value = { ...expandedModules.value, ...parsed }
    } catch {
      // Ignorer les erreurs de parsing
    }
  }
}

const openModuleForCurrentRoute = () => {
  const currentPath = route.path
  const moduleName = routeToModule[currentPath]
  if (moduleName) {
    expandedModules.value[moduleName] = true
    saveModulesState()
  }
}

const navigateTo = (path: string) => {
  sidebarOpen.value = false
  router.push(path)
}

const navigateToSubitem = (path: string, moduleName: 'gestion' | 'relation' | 'rh' | 'config') => {
  sidebarOpen.value = false
  // Garder le module ouvert
  expandedModules.value[moduleName] = true
  saveModulesState()
  router.push(path)
}

const isActive = (path: string) => {
  return route.path === path
}

const handleLogout = () => {
  showLogoutModal.value = true
}

const confirmLogout = async () => {
  isLoggingOut.value = true

  try {
    // Déconnexion via le store auth
    await authStore.logout()

    // Effacer les données locales
    localStorage.removeItem('userToken')
    localStorage.removeItem('currentUser')
    sessionStorage.removeItem('currentUserData')
    localStorage.removeItem('sidebarCollapsed')

    // Arrêter la simulation des notifications
    stopGlobalNotificationSimulation()

    // Réinitialiser les données affichées
    displayUser.value = null
    activeShop.value = null

    // Fermer le modal AVANT la redirection
    showLogoutModal.value = false
    isLoggingOut.value = false

    // Rediriger vers la page de connexion
    router.push('/Connexion')

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    // Même en cas d'erreur, on déconnecte l'utilisateur localement
    authStore.clearSession()
    showLogoutModal.value = false
    isLoggingOut.value = false
    router.push('/Connexion')
  }
}

// ====================================================================
// GESTION DES ÉVÉNEMENTS
// ====================================================================

const handleUserDataUpdate = (event: CustomEvent) => {
  if (event.detail.user) {
    displayUser.value = event.detail.user
    updateActiveShop()
  }
}

// Écouter les changements de statut des commandes
const handleOrderStatusChange = (event: CustomEvent) => {
  const { orderId, newStatus } = event.detail
  console.log(`Statut de la commande ${orderId} changé en: ${newStatus}`)
  // Rafraîchir les données du dashboard pour mettre à jour les compteurs
  refreshDashboardData()
}

// Écouter les mises à jour des commandes
const handleOrdersUpdated = (event: CustomEvent) => {
  console.log('Commandes mises à jour, rafraîchissement du dashboard')
  refreshDashboardData()
}

// Écouter les mises à jour des notifications
const handleNotificationsUpdated = (event: CustomEvent) => {
  console.log('Notifications mises à jour, recalcul des notifications non lues')
  updateUnreadNotificationsCount()
}

// Écouter les changements de statut des notifications
const handleNotificationStatusChange = (event: CustomEvent) => {
  const { notificationId, read } = event.detail
  console.log(`Statut de la notification ${notificationId} changé en: ${read ? 'lu' : 'non lu'}`)
  updateUnreadNotificationsCount()
}

// Gestionnaire des changements de localStorage
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'presso_notifications') {
    console.log('Stockage localStorage des notifications modifié')
    updateUnreadNotificationsCount()
  }
}

const handleResize = () => {
  if (window.innerWidth >= 1024) {
    sidebarOpen.value = false
  }
  // Sur mobile, désactiver le mode réduit
  if (window.innerWidth < 1024) {
    isSidebarCollapsed.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && sidebarOpen.value) {
    sidebarOpen.value = false
  }
}

// ====================================================================
// LIFECYCLE HOOKS
// ====================================================================

onMounted(async () => {
  // Charger les données utilisateur au montage
  loadUserData()

  // Charger les données du provider depuis le backend (logo, nom, stats...)
  loadProviderData()

  // Charger l'état du sidebar depuis localStorage
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState) {
    isSidebarCollapsed.value = JSON.parse(savedState)
  }

  // Charger l'état des modules dépliables
  loadModulesState()
  // Ouvrir le module correspondant à la route actuelle
  openModuleForCurrentRoute()

  // Les compteurs sont maintenant calculés via les stores
  updateUnreadNotificationsCount()

  // DÉMARRER LA SIMULATION GLOBALE DES NOTIFICATIONS
  startGlobalNotificationSimulation()

  // Écouter les mises à jour des données utilisateur
  window.addEventListener('userDataUpdated', handleUserDataUpdate as EventListener)

  // Écouter les changements de statut des commandes
  window.addEventListener('orderStatusChanged', handleOrderStatusChange as EventListener)
  
  // Écouter les mises à jour générales des commandes
  window.addEventListener('ordersUpdated', handleOrdersUpdated as EventListener)

  // Écouter les mises à jour des notifications
  window.addEventListener('notificationsUpdated', handleNotificationsUpdated as EventListener)
  window.addEventListener('notificationStatusChanged', handleNotificationStatusChange as EventListener)

  // Écouter le stockage localStorage pour les notifications
  window.addEventListener('storage', handleStorageChange)

  // Autres écouteurs d'événements
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)

  // Forcer une vérification initiale
  setTimeout(() => {
    updateUnreadNotificationsCount()
  }, 100)
})

onUnmounted(() => {
  // Arrêter la simulation des notifications
  stopGlobalNotificationSimulation()

  // Nettoyer les écouteurs d'événements
  window.removeEventListener('userDataUpdated', handleUserDataUpdate as EventListener)
  window.removeEventListener('orderStatusChanged', handleOrderStatusChange as EventListener)
  window.removeEventListener('ordersUpdated', handleOrdersUpdated as EventListener)
  window.removeEventListener('notificationsUpdated', handleNotificationsUpdated as EventListener)
  window.removeEventListener('notificationStatusChanged', handleNotificationStatusChange as EventListener)
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped src="@/Assets/AssetsCommun/DashboardLayout.css"></style>