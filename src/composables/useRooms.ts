import { ref } from 'vue'
import { collection, getDocs, query, orderBy, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { type Room as RoomData, Collection, type Room } from '@/schema'
import mapSnapshot from '@/firebase/utils/mapSnapshot'
import useAuth from './useAuth'

export default (userId: string) => {
  const { user } = useAuth()

  const rooms = ref<RoomData[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const getUserRooms = async () => {
    const q = query(collection(db, Collection.ROOMS), orderBy(`users.${userId}`))
    const snapshot = await getDocs(q)

    if (snapshot.size === 0) {
      return
    }

    const newRooms = mapSnapshot<RoomData>(snapshot)

    // sort by time the user joined the room (descending)
    newRooms.sort((a, b) => {
      const timestampA = a.users[userId].timestamp
      const timestampB = b.users[userId].timestamp

      return timestampB.toDate().valueOf() - timestampA.toDate().valueOf()
    })

    rooms.value = newRooms
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
    if (!user.value) throw new Error('Unauthenticated');
    if (!name) throw new Error('Name required')

    await addDoc(collection(db, Collection.ROOMS), {
      name,
      photoURL: 'https://api.dicebear.com/8.x/initials/svg?seed=',
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

  return { rooms, loading, error, createRoom, refetch: fetchUserRooms }
}
