<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToasts'
import useAuth from '@/composables/useAuth'
import useFetch from '@/composables/useFetch'
import useRoom from '@/composables/useRoom'
import fetchFn from '@/utils/fetchFn'

const { user } = useAuth()

const route = useRoute()
const router = useRouter()

const { id, code } = route.params

const { room, loading: loadingRoom } = useRoom({ roomId: id as string })

const { data: isVerified, loading: loadingCode } = useFetch<boolean>(
  `/room/${id}/code?verify=${code}`
)

const loadingJoin = ref(false)

const successPath = `/rooms/${id}`

const joinRoom = async () => {
  if (!room.value || !isVerified.value) return

  loadingJoin.value = true

  try {
    const response = await fetchFn(`/room/${id}/code`, user.value, {
      method: 'POST',
      body: JSON.stringify({ code })
    })

    if (!response.ok) {
      throw new Error('An error occured. Please try again later.')
    }

    const { data } = await response.json()

    if (data) {
      useToast(`Successfully joined ${room.value.name}`, {
        type: 'success',
        persistInPaths: [successPath]
      })

      router.replace(successPath)
    }
  } catch (error) {
    useToast((error as Error).message, { type: 'error', timeout: -1 })
  }

  loadingJoin.value = false
}

let stopLoading: () => void

watch([loadingRoom, loadingCode], () => {
  if (!loadingRoom.value && !loadingCode.value) {
    stopLoading?.()
  }

  if (loadingRoom.value) return

  if (room.value?.users[user.value?.uid || '']) {
    useToast('You are already a member of ' + room.value.name, {
      type: 'error',
      persistInPaths: [successPath]
    })

    router.replace(successPath)
    return
  }

  if (loadingCode.value) return

  if (!isVerified.value) {
    useToast('Invalid invite code', { type: 'error', persistInPaths: ['/rooms'] })
    router.replace('/rooms')
    return
  }
})

await new Promise<void>((resolve) => (stopLoading = resolve))
</script>

<template>
  <div v-if="loadingRoom || loadingCode">Loading...</div>
  <form v-else @submit.prevent="joinRoom">
    You have been invited to {{ room?.name }}
    <button :disabled="loadingJoin">Join</button>
  </form>
</template>
