<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalized } from 'vue-router'
import useAuth from './composables/useAuth'

const route = useRoute()
const router = useRouter()

const { user, loading } = useAuth()

const showSplash = ref(false)

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth && to.matched[0]?.name !== 'Auth') {
    return
  }

  showSplash.value = true

  await loading.value

  authRedirect(!!user.value, to)
})

watch(user, () => {
  authRedirect(!!user.value, route)
})

function authRedirect(isAuthenticated: boolean, route: RouteLocationNormalized) {
  if (isAuthenticated && route.matched[0]?.name === 'Auth') {
    router.replace({ name: 'Rooms' })
  } else if (!isAuthenticated && route.meta.requiresAuth) {
    router.replace({ name: 'Login' })
  }
}
</script>

<template>
  <div v-if="showSplash && !!loading" class="splash">Loading</div>
  <RouterView />
</template>

<style scoped>
.splash {
  position: absolute;
  top: 0;
  left: 0;
  width: 100svw;
  height: 100svh;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
