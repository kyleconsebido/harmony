<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import IconChevronDown from './icons/IconChevronDown.vue'

interface Props {
  btnClass?: string
}

defineProps<Props>()

const open = ref(false)
const containerRef = ref<HTMLDivElement | null>(null)

const openDropdown = () => {
  open.value = true
  document.addEventListener('click', closeFromAnywhere)
}

const closeDropdown = () => {
  open.value = false
  document.removeEventListener('click', closeFromAnywhere)
}

const toggleDropdown = () => {
  if (open.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

function closeFromAnywhere(e: MouseEvent) {
  if (!containerRef.value?.contains?.(e.target as Element)) {
    closeDropdown()
  }
}

onUnmounted(() => {
  document.removeEventListener('click', closeFromAnywhere)
})
</script>

<template>
  <div :ref="(el) => (containerRef = el as HTMLDivElement)" class="container">
    <button @click="toggleDropdown" :class="{ btnClass, open }">
      <IconChevronDown />
    </button>

    <Transition name="popup">
      <div v-if="open" class="items">
        <slot :close="closeDropdown"></slot>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  z-index: var(--z-dropdown);
}

button {
  width: 100%;
  height: 100%;
  background-color: transparent;
  border: none;
  padding: 0;
  color: var(--color-text-dark);
  transition:
    200ms rotate,
    200ms color;

  &:enabled {
    cursor: pointer;

    &:hover {
      color: var(--color-text-dark-mute);
    }
  }

  &.open {
    rotate: -0.5turn;
  }

  svg {
    width: 100%;
    height: 100%;
  }
}

.items {
  position: absolute;
  top: 100%;
  left: 0;
}

:deep(.items) > * {
  --border: 1px solid var(--color-border);

  color: var(--color-text-dark);
  font-family: inherit;
  font-size: 1rem;
  text-align: start;
  width: calc(100px + 1.4em);
  box-sizing: content-box;
  padding: 0.5em 0.7em;
  background-color: var(--color-background);

  border: none;
  border-left: var(--border);
  border-right: var(--border);
}

:deep(.items) > *:first-child {
  border-top: var(--border);
  border-top-left-radius: var(--base-border-radius);
  border-top-right-radius: var(--base-border-radius);
}

:deep(.items) > *:last-child {
  border-bottom: var(--border);
  border-bottom-left-radius: var(--base-border-radius);
  border-bottom-right-radius: var(--base-border-radius);
}

:deep(.items) > button {
  transition: 200ms background-color;
}

:deep(.items) > button:enabled {
  cursor: pointer;
}

:deep(.items) > button:hover {
  background-color: var(--color-input);
}

.popup-enter-active,
.popup-leave-active {
  transform-origin: top left;
  transition:
    200ms scale,
    200ms opacity;
}

.popup-enter-from,
.popup-leave-to {
  scale: 0.95;
  opacity: 0;
}
</style>
