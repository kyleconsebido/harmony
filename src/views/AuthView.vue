<script setup lang="ts">
import LoadingDots from '@/components/LoadingDots.vue'
import { onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

if (route.query.mode === 'resetPassword') {
  router.replace({ name: 'Reset Password', query: { code: route.query.oobCode } })
} else if (route.name === 'Auth') {
  router.replace({ name: 'Login' })
}

const scrollGuard = router.afterEach((to) => {
  if (to.matched[0].name === 'Auth') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

onUnmounted(scrollGuard)
</script>

<template>
  <main>
    <div class="wrapper">
      <div class="container">
        <img class="logo" src="@/assets/logotype.svg" />
        <div class="form-container">
          <RouterView v-slot="{ Component }">
            <Suspense timeout="0">
              <template #fallback>
                <LoadingDots class="loading" />
              </template>
              <Transition name="slide" mode="out-in">
                <component :is="Component" :key="route.name" />
              </Transition>
            </Suspense>
          </RouterView>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.loading {
  margin-top: 2rem;
  font-size: 1.5rem;
  display: flex;
  justify-content: center;
}

main {
  overflow: hidden;
  height: 100svh;
}

.wrapper {
  height: 100%;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.container {
  margin: auto;
  padding-top: 5svh;
  padding-bottom: 10svh;
  width: clamp(250px, 50vw, 500px);
}

.logo {
  width: inherit;
}

.form-container {
  margin-top: 1rem;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    200ms opacity,
    200ms translate;
}

.slide-enter-from,
.slide-leave-to {
  translate: 0 -1rem;
  opacity: 0;
}
</style>
