import type { Room as RoomData, Message as MessageData } from '@/schema'
import { ref } from 'vue'
import { doc, collection, getDoc, getDocs, query } from 'firebase/firestore'
import { db } from '@/firebase'
import { Collection } from '@/schema'
import mapSnapshot from '@/firebase/utils/mapSnapshot'
import useAuth from './useAuth'
import fetchFn from '@/utils/fetchFn'

interface Message extends MessageData {
  userName?: string | null
}

interface Room extends RoomData {
  messages: Message[]
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
