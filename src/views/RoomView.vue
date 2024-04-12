<script setup lang="ts">
import type { Room } from '@/schema'
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoom } from '@/composables/useRoom'

interface Props {
  roomData?: Room
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
      <h1>Messages</h1>
      <div v-for="msg of room.messages" :key="msg.id">
        <p>{{ msg.message }}</p>
        <span> - {{ msg.userName ?? '[deleted]' }}</span>
      </div>
    </main>
    <section>
      <h1>Members</h1>
      <div v-for="[id, user] of Object.entries(room.users)" :key="id">
        {{ user }}
      </div>
    </section>
  </template>
</template>
