<script setup lang="ts">
import type { Toast } from '@/composables/useToasts'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import IconXMark from './icons/IconXMark.vue'

const router = useRouter()

const { toast } = defineProps<{ toast: Toast }>()

const element = ref<HTMLDivElement | null>()

let timeoutId: number

const dismissGuard = router.beforeEach((to) => {
  if (!toast.persistInPaths?.includes?.(to.path)) {
    toast.dismiss()
  }
})

onMounted(() => {
  if (toast.timeout !== -1) {
    timeoutId = window.setTimeout(toast.dismiss, toast.timeout)
  }
})

onUnmounted(() => {
  clearTimeout(timeoutId)
  dismissGuard()
})
</script>

<template>
  <div
    :ref="(el) => (element = el as HTMLDivElement)"
    :class="{ [toast.type as string]: toast.type }"
    :style="{ '--height': element?.clientHeight + 'px' }"
    class="toast"
  >
    <span>{{ toast.message }}</span>
    <button v-if="toast.dismissible" @click="toast.dismiss()" class="close">
      <IconXMark class="icon" />
    </button>
  </div>
</template>

<style scoped>
.toast {
  background-color: var(--color-background);
  padding: 1em;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: var(--base-border-radius);
  display: flex;
  align-items: center;
  gap: 1em;
}

.toast.success {
  background-color: var(--color-success);
  color: var(--color-text-light);
}

.toast.error {
  background-color: var(--color-error);
  color: var(--color-text-light);
}

.close {
  margin-left: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 2em;
  width: 2em;
  border-radius: 100%;
  padding: none;
  border: none;
  cursor: pointer;
  scale: 1.2;
  background-color: transparent;
  transition:
    200ms color,
    200ms background-color;
}

.success .close,
.error .close {
  color: var(--c-gray-100);
}

.close:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.success .close:hover,
.error .close:hover {
  color: var(--c-white-100);
}

.icon {
  width: 100%;
  height: 100%;
}
</style>
