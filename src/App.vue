<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalized } from 'vue-router'
import useAuth from './composables/useAuth'
import useToasts from './composables/useToasts'
import AppToast from './components/AppToast.vue'

const route = useRoute()
const router = useRouter()

const { user, loading } = useAuth()

const toasts = useToasts()

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
  if (isAuthenticated && route.matched[0]?.name === 'Auth' && !route.meta.requiresAuth) {
    router.replace({ name: 'Rooms' })
  } else if (!isAuthenticated && route.meta.requiresAuth) {
    router.replace({ name: 'Login', query: { redirect: btoa(route.fullPath) } })
  }
}
</script>

<template>
  <Transition name="splash">
    <div v-if="showSplash && !!loading" class="splash">
      <img src="./assets/logotype-animated.svg" />
    </div>
  </Transition>

  <RouterView />

  <Transition name="toasts">
    <TransitionGroup
      v-if="toasts.length > 0"
      :style="{ '--count': toasts.length }"
      class="toasts"
      name="toasts"
      tag="div"
    >
      <AppToast
        v-for="(toast, i) of toasts"
        :key="toast.id"
        :toast="toast"
        :style="{ '--index': i }"
        class="toast"
      />
    </TransitionGroup>
  </Transition>
</template>

<style scoped>
.splash {
  position: fixed;
  top: 0;
  left: 0;
  width: 100svw;
  height: 100svh;
  background-color: var(--color-background);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-splash);
}

.splash img {
  width: max(50vw, 250px);
}

.splash-leave-active {
  animation: delay-fade-out 1.25s;
}

.toasts {
  --count: 0;

  position: fixed;
  top: 5svh;
  left: 50%;
  translate: -50% 0;
  width: clamp(300px, 60vw, 600px);
  z-index: var(--z-toasts);
}

.toast {
  --gap: 0.5em;
  --index: 0;

  position: absolute;
  top: calc(var(--height, 3.5em) * var(--index) + var(--gap) * var(--index));
  z-index: calc(var(--count) - var(--index));
  height: var(--height, 3.5em);
  width: 100%;
}

.toasts-move,
.toasts-enter-active,
.toasts-leave-active {
  transform-origin: top;
  transition:
    250ms opacity,
    250ms transform,
    125ms scale;
}

.toasts-enter-from,
.toasts-leave-to {
  opacity: 0;
  transform: translateY(-7svh);
  scale: 0.8;
}

@keyframes delay-fade-out {
  0% {
    opacity: 1;
  }
  84% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
