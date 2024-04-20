<script setup lang="ts">
import useAuth from '@/composables/useAuth'
import IconLogOut from './icons/IconLogOut.vue'

const { logOut } = useAuth()
</script>

<template>
  <button @click="logOut">
    <IconLogOut />
    <span>Sign Out</span>
  </button>
</template>

<style scoped>
button {
  background-color: transparent;
  padding: 0;
  width: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-text-light-mute);
  transition: 200ms color;
  font-family: inherit;
  border: none;

  &:enabled {
    cursor: pointerw;
  }
}

button:hover {
  color: var(--color-text-dark);
}

button svg {
  width: 1.5em;
  height: 1.5em;
  translate: -2px;
}

button span {
  translate: 0 0.5px;
}
</style>
