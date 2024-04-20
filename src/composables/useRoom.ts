import type { Room } from '@/schema'
import { onUnmounted, ref } from 'vue'
import {
  type Unsubscribe,
  doc,
  onSnapshot,
  writeBatch,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  deleteField
} from 'firebase/firestore'
import { db } from '@/firebase'
import { Collection } from '@/schema'
import chunks from '@/utils/chunks'
import useAuth from './useAuth'

export default ({ roomId, roomData }: { roomId?: Room['id']; roomData?: Room }) => {
  const { user } = useAuth()

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

  const updateName = async (name: string) => {
    if (!user.value || !room.value) return

    try {
      const roomRef = doc(db, Collection.ROOMS, room.value.id)

      await updateDoc(roomRef, { name } satisfies Partial<Room>)
    } catch (error) {
      throw new Error('An error occured')
    }
  }

  const leaveRoom = async () => {
    if (!user.value || !room.value) return

    try {
      const roomRef = doc(db, Collection.ROOMS, room.value.id)

      const field = ('users' satisfies keyof Room) + `.${user.value.uid}`

      await updateDoc(roomRef, {
        [field]: deleteField()
      })
    } catch (error) {
      throw new Error('An error occured')
    }
  }

  const deleteRoom = async () => {
    if (!room.value) return

    const MAX_WRITE_PER_BATCH = 500
    try {
      const messagesCol = collection(db, Collection.ROOMS, room.value.id, Collection.ROOM_MESSAGES)
      const messages = await getDocs(messagesCol)
      const messageChunks = chunks(messages.docs, MAX_WRITE_PER_BATCH)

      const commitBatchPromises: Promise<void>[] = []

      messageChunks.forEach((chunk) => {
        const batch = writeBatch(db)
        chunk.forEach((doc) => batch.delete(doc.ref))
        commitBatchPromises.push(batch.commit())
      })

      await Promise.all(commitBatchPromises)

      const roomRef = doc(db, Collection.ROOMS, room.value.id)

      await deleteDoc(roomRef)
    } catch (error) {
      throw new Error('An error occured')
    }
  }

  onUnmounted(() => unsub?.())

  return {
    room,
    loading,
    error,
    refetchRoom: fetchRoom,
    updateName,
    leaveRoom,
    deleteRoom
  }
}
