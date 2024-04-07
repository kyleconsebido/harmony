<script setup lang="ts">
import useAuth from '@/composables/useAuth'

const { logOut } = useAuth()
</script>

<template>
  <main>
    Rooms
    <button @click="logOut">Log Out</button>
    <RouterView />
  </main>
</template>
