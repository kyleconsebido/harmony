import { ref } from 'vue'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { type Room as RoomData, Collection } from '@/schema'
import mapSnapshot from '@/firebase/utils/mapSnapshot'

export default (userId: string) => {
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

  fetchUserRooms()

  return { rooms, loading, error, refetch: fetchUserRooms }
}
