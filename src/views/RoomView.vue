<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type RoomData, useRoom } from '@/composables/useRooms'

interface Props {
  roomData?: RoomData
}

const { roomData } = defineProps<Props>()

const route = useRoute()
const router = useRouter()

const { room, loading, error } = useRoom({ roomData, roomId: route.params.id as string })

watch(error, () => {
  if (error.value) {
    router.replace({ name: 'Rooms' })
  }
})
</script>

<template>
  <div v-if="loading">Loading</div>
  <template v-else-if="room">
    <h1>{{ room.name }}</h1>
    <main>
      <div v-for="msg of room.messages" :key="msg.id">
        <p>{{ msg.message }}</p>
        <span>{{ msg.userId }}</span>
      </div>
    </main>
    <section>
      <div v-for="[id, user] of Object.entries(room.users)" :key="id">
        {{ user }}
      </div>
    </section>
  </template>
</template>
