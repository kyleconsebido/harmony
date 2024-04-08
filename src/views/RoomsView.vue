<script setup lang="ts">
import { ref } from 'vue'
import useAuth from '@/composables/useAuth'
import useRooms, { type RoomData } from '@/composables/useRooms'

const { user, logOut } = useAuth()

const { rooms } = useRooms(user.value?.uid as string)

const selectedRoom = ref<RoomData | null>(null)
</script>

<template>
  <section>
    <h1>Rooms</h1>
    <div v-for="room of rooms" :key="room.id">
      <RouterLink :to="{ name: 'Room', params: { id: room.id } }" @click="selectedRoom = room">
        {{ room.name }}
      </RouterLink>
    </div>
    <div>
      <div>{{ user?.displayName }}</div>
      <button @click="logOut">Log Out</button>
    </div>
  </section>

  <RouterView v-slot="{ Component, route }">
    <component :is="Component" :key="route.path" :roomData="selectedRoom" />
  </RouterView>
</template>
