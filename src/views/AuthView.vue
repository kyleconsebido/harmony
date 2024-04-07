<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

if (route.query.mode === 'resetPassword') {
  router.replace({ name: 'Reset Password', query: { code: route.query.oobCode } })
} else if (route.name === 'Auth') {
  router.replace({ name: 'Login' })
}
</script>

<template>
  <main>
    <RouterView v-slot="{ Component }">
      <Suspense timeout="0">
        <template #fallback> Loading... </template>
        <component :is="Component" />
      </Suspense>
    </RouterView>
  </main>
</template>
