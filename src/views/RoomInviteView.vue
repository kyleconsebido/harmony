<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToasts'
import useAuth from '@/composables/useAuth'
import useFetch from '@/composables/useFetch'
import useRoom from '@/composables/useRoom'

const { user } = useAuth()

const route = useRoute()
const router = useRouter()

const { id, code } = route.params

const { room, loading: loadingRoom } = useRoom({ roomId: id as string })

const { data: isVerified, loading: loadingCode } = useFetch<boolean>(
  `/room/${id}/code?verify=${code}`
)

watch([loadingRoom, loadingCode], () => {
  if (loadingRoom.value) return

  if (room.value?.users[user.value?.uid || '']) {
    useToast('You are already a member of ' + room.value.name, {
      type: 'error',
      persistInPaths: [`/rooms/${id}`]
    })

    router.replace(`/rooms/${id}`)

    return
  }

  if (loadingCode.value) return

  if (!isVerified.value) {
    useToast('Invalid invite code', { type: 'error', persistInPaths: ['/rooms'] })

    router.replace('/rooms')

    return
  }
})

/**@todo Join Room */
const joinRoom = () => {
  if (!room.value || !isVerified.value) return
}
</script>

<template>
  <div v-if="loadingRoom || loadingCode">Loading...</div>
  <form v-else>
    {{ isVerified }}
    You have been invited
    <button @click="joinRoom">Join</button>
  </form>
</template>
