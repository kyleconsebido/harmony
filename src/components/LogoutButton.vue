<script setup lang="ts">
import useAuth from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const { logOut } = useAuth()
const router = useRouter()

const handleLogOut = () => {
  logOut().then(() => router.replace({ name: 'Login' }))
}
</script>

<template>
  <button @click="handleLogOut">Log Out</button>
</template>
