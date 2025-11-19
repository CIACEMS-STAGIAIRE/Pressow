import { ref, computed } from 'vue'

interface Shop {
  id: string
  name: string
  city: string
  type: 'manager' | 'vendor'
}

export function useAuth() {
  const user = ref({
    id: 'user_1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'vendor' as 'manager' | 'vendor'
  })

  const activeShop = ref<Shop>({
    id: 'shop_1',
    name: 'Ma Boutique',
    city: 'Abidjan',
    type: 'vendor'
  })

  const isManager = computed(() => user.value.role === 'manager')
  const isVendor = computed(() => user.value.role === 'vendor')

  return {
    user,
    activeShop,
    isManager,
    isVendor
  }
}