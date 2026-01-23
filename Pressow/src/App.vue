<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isReady = computed(() => authStore.authReady)
</script>

<template>
  <div v-if="!isReady" class="auth-boot">
    <div class="auth-boot__content">
      <span class="auth-boot__spinner"></span>
      <span>Connexion en cours...</span>
    </div>
  </div>
  <router-view v-else/>
</template>

<style scoped>
.auth-boot {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #1f2937;
  font-size: 16px;
}

.auth-boot__content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-boot__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-top-color: #2563eb;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
