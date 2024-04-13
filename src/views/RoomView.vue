<script setup lang="ts">
import type { Room } from '@/schema'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToasts'
import useAuth from '@/composables/useAuth'
import useRoom from '@/composables/useRoom'
import fetchFn from '@/utils/fetchFn'
import RoomMessages from '@/components/RoomMessages.vue'

interface Props {
  roomData?: Room
}

const { user } = useAuth()

const { roomData } = defineProps<Props>()

const route = useRoute()
const router = useRouter()

const { room, loading, error } = useRoom({
  roomData,
  roomId: route.params.id as string
})

const loadingCode = ref(false)

const getInviteCode = () => {
  loadingCode.value = true

  fetchFn(`/room/${route.params.id}/code`, user.value)
    .then((res) => res.json())
    .then((data) => useToast(data.data))
    .catch((error) => useToast(error.message, { type: 'error' }))
    .finally(() => (loadingCode.value = false))
}

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
      <RoomMessages :room="room" />
    </main>
    <section>
      <h1>Members</h1>
      <button :disabled="loadingCode" @click="getInviteCode">Invite Members</button>
      <div v-for="[id, user] of Object.entries(room.users)" :key="id">
        {{ user }}
      </div>
    </section>
  </template>
</template>
