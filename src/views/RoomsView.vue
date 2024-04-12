<script setup lang="ts">
import type { Room } from '@/schema'
import { ref } from 'vue'
import useAuth from '@/composables/useAuth'
import useRooms from '@/composables/useRooms'

const { user, logOut } = useAuth()

const { rooms, createRoom } = useRooms(user.value?.uid as string)

const input = ref('')

const selectedRoom = ref<Room | null>(null)
</script>

<template>
  <section>
    <h1>Rooms</h1>
    <form @submit.prevent="createRoom(input)">
      <input v-model.trim="input" placeholder="Room Name" required />
      <button>Add Room</button>
    </form>
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
