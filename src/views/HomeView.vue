<script setup lang="ts">
import useAuth from '@/composables/useAuth'

const { user, logOut } = useAuth()
</script>

<template>
  <header>
    <button v-if="user" @click="logOut">Log out</button>
    <RouterLink to="/login" v-else>Log In</RouterLink>
  </header>

  <main>Home</main>
</template>
