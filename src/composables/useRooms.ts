import { onUnmounted, ref } from 'vue'
import {
  type Unsubscribe,
  collection,
  query,
  orderBy,
  addDoc,
  Timestamp,
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/firebase'
import { type Room, Collection } from '@/schema'
import mapSnapshot from '@/firebase/utils/mapSnapshot'
import useAuth from './useAuth'

export default (userId: string) => {
  const { user } = useAuth()

  let unsub: Unsubscribe | null = null
  const rooms = ref<Room[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const getUserRooms = async () => {
    const q = query(collection(db, Collection.ROOMS), orderBy(`users.${userId}`))

    if (unsub) unsub()

    unsub = onSnapshot(q, (snapshot) => {
      const newRooms = mapSnapshot<Room>(snapshot)

      if (newRooms.length > 1) {
        // sort by time the user joined the room (descending)
        newRooms.sort((a, b) => {
          const timestampA = a.users[userId].timestamp
          const timestampB = b.users[userId].timestamp

          return timestampB.toDate().valueOf() - timestampA.toDate().valueOf()
        })
      }

      rooms.value = newRooms
    })
  }

  const fetchUserRooms = async () => {
    loading.value = true
    error.value = null

    getUserRooms()
      .catch((err) => {
        console.error(err)
        error.value = err
      })
      .finally(() => (loading.value = false))
  }

  const createRoom = async (name: string) => {
    if (!user.value) throw new Error('Unauthenticated')
    if (!name) throw new Error('Name required')

    await addDoc(collection(db, Collection.ROOMS), {
      name,
      photoURL: '',
      users: {
        [user.value.uid]: {
          isAdmin: true,
          name: user.value.displayName,
          photoURL: user.value.photoURL,
          timestamp: Timestamp.now()
        }
      }
    } satisfies Omit<Room, 'id'>)
  }

  fetchUserRooms()

  onUnmounted(() => unsub?.())

  return { rooms, loading, error, createRoom, refetch: fetchUserRooms }
}
