import { ref } from 'vue'
import {
  type Timestamp,
  doc,
  collection,
  getDoc,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from '@/firebase'
import mapSnapshot from '@/firebase/utils/mapSnapshot'
import useAuth from './useAuth'
import fetchFn from '@/utils/fetchFn'

export interface RoomUserData {
  name: string
  photoURL: string
  isAdmin?: boolean
  timestamp: Timestamp
}

export interface RoomData {
  id: string
  name: string
  photoURL: string
  users: Record<string, RoomUserData>
}

export interface MessageData {
  id: string
  message: string
  userId: string
  photoURL: string
  timestamp: Timestamp
}

export interface Message extends MessageData {
  userName?: string | null
}

export interface Room extends RoomData {
  messages: Message[]
}

enum Collection {
  ROOMS = 'rooms',
  ROOM_MESSAGES = 'messages'
}

export const useRoom = ({ roomId, roomData }: { roomId?: RoomData['id']; roomData?: RoomData }) => {
  const { user } = useAuth()

  const cachedUsernames: Record<string, string> = {}

  const room = ref<Room | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const cacheMissingUsers = async (missingUserIds: string[]) => {
    const queryString = missingUserIds.reduce<string>((acc, userId, i) => {
      return acc + (i === 0 ? '?' : '&') + `id=${userId}`
    }, '')

    const response = await fetchFn(`/users${queryString}`, user.value)

    const { data } = (await response.json()) as { data: { id: string; name: string }[] }

    for (const user of data) {
      cachedUsernames[user.id] = user?.name
    }
  }

  const getMessages = async (roomData: RoomData) => {
    const q = query(collection(db, Collection.ROOMS, roomData.id, Collection.ROOM_MESSAGES))

    const messagesData = await getDocs(q).then(mapSnapshot<MessageData>)

    const msgIndicesWithMissingUsers: Record<number, string> = {}

    const messages = messagesData.reduce<Message[]>((acc, messageData, i) => {
      const userName =
        roomData.users[messageData.userId]?.name ?? cachedUsernames[messageData.userId]

      if (!userName) msgIndicesWithMissingUsers[i] = messageData.userId

      acc.push({ ...messageData, userName })

      return acc
    }, [])

    const missingEntries = Object.entries(msgIndicesWithMissingUsers)

    if (missingEntries.length > 0) {
      await cacheMissingUsers(Object.values(msgIndicesWithMissingUsers))

      for (const [msgIndex, userId] of missingEntries) {
        messages[+msgIndex].userName = cachedUsernames[userId]
      }
    }

    return messages
  }

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

      newRoomData = roomDoc.data() as RoomData
      newRoomData.id = roomDoc.id
    }

    const messages = await getMessages(newRoomData)

    room.value = { ...newRoomData, messages }
  }

  const fetchRoom = async () => {
    loading.value = true
    error.value = null

    getRoom()
      .catch((err) => (error.value = err))
      .finally(() => (loading.value = false))
  }

  fetchRoom()

  return { loading, room, error, refetch: fetchRoom }
}

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

    // sort by time user joined the room (descending)
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
