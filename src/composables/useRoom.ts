import type { Room } from '@/schema'
import { onUnmounted, ref } from 'vue'
import { type Unsubscribe, doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { Collection } from '@/schema'

export default ({ roomId, roomData }: { roomId?: Room['id']; roomData?: Room }) => {
  let unsub: Unsubscribe | null = null
  const room = ref<Room | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const getRoom = async () => {
    if (!roomId && !roomData) {
      throw new TypeError('Pass either a roomId or roomData')
    }

    if (roomData) {
      room.value = { ...roomData }
    }

    if (unsub) unsub()

    unsub = onSnapshot(doc(db, Collection.ROOMS, roomId as string), (roomDoc) => {
      if (!roomDoc.exists()) {
        error.value = new Error('Room does not exist')
        unsub?.()
        return
      }

      roomData = roomDoc.data() as Room
      roomData.id = roomDoc.id
      room.value = { ...roomData }
    })
  }

  const fetchRoom = async () => {
    loading.value = true
    error.value = null

    getRoom()
      .catch((err) => (error.value = err))
      .finally(() => (loading.value = false))
  }

  fetchRoom()

  onUnmounted(() => unsub?.())

  return {
    room,
    loading,
    error,
    refetchRoom: fetchRoom
  }
}
