import type { Room } from '@/schema'
import { ref } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { Collection } from '@/schema'

export default ({ roomId, roomData }: { roomId?: Room['id']; roomData?: Room }) => {
  const room = ref<Room | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const getRoom = async () => {
    if (!roomId && !roomData) {
      throw new TypeError('Pass either a roomId or roomData')
    }

    let newRoomData = roomData

    if (!newRoomData) {
      const roomDoc = await getDoc(doc(db, Collection.ROOMS, roomId as string))

      if (!roomDoc.exists()) {
        throw new Error('Room does not exist')
      }

      newRoomData = roomDoc.data() as Room
      newRoomData.id = roomDoc.id
    }

    room.value = { ...newRoomData }
  }

  const fetchRoom = async () => {
    loading.value = true
    error.value = null

    getRoom()
      .catch((err) => (error.value = err))
      .finally(() => (loading.value = false))
  }

  fetchRoom()

  return {
    room,
    loading,
    error,
    refetchRoom: fetchRoom
  }
}
