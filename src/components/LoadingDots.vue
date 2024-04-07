<script setup lang="ts">
type Color = 'default' | 'white' | 'gray'

interface Props {
  color?: Color
}

const { color } = defineProps<Props>()
</script>

<template>
  <span class="dots" :class="{ [color as Color]: color }">
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  </span>
</template>

<style scoped>
.dots {
  display: inline-flex;
  gap: 0.6em;
}

.dot {
  --up-color: var(--c-orange-200);

  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: var(--color-brand);
  border-radius: 100%;

  animation: up-and-down 1s infinite;
}

.white .dot {
  --up-color: var(--c-white-200);
  background-color: var(--c-white-100);
}

.gray .dot {
  --up-color: var(--c-gray-200);
  background-color: var(--c-gray-100);
}

.dot:nth-child(1) {
  animation-delay: 0ms;
}
.dot:nth-child(2) {
  animation-delay: 100ms;
}
.dot:nth-child(3) {
  animation-delay: 200ms;
}

@keyframes up-and-down {
  0% {
    translate: 0 0;
  }

  50% {
    translate: 0 -25%;
    background-color: var(--up-color);
  }

  100% {
    translate: 0 0;
  }
}
</style>
