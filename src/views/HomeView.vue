<script setup lang="ts">
import useAuth from '@/composables/useAuth'
import LogoutButton from '@/components/LogoutButton.vue'

const { user } = useAuth()
</script>

<template>
  <header>
    <LogoutButton v-if="user" />
    <RouterLink v-else to="/login">Log In</RouterLink>
  </header>

  <main>Home</main>
</template>
