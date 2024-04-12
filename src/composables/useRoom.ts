import type { Room, Message as MessageData } from '@/schema'
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

export const useRoom = ({ roomId, roomData }: { roomId?: Room['id']; roomData?: Room }) => {
  const { user } = useAuth()

  const cachedUsernames: Record<string, string> = {}

  const room = ref<Room | null>(null)
  const loadingRoom = ref(false)
  const errorRoom = ref<Error | null>(null)

  const messages = ref<Message[]>([])
  const loadingMessages = ref(false)
  const errorMessages = ref<Error | null>(null)

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

  const getMessages = async (room: Room) => {
    const q = query(collection(db, Collection.ROOMS, room.id, Collection.ROOM_MESSAGES))

    const messagesData = await getDocs(q).then(mapSnapshot<MessageData>)

    const msgIndicesWithMissingUsers: Record<number, string> = {}

    const newMessages = messagesData.reduce<Message[]>((acc, messageData, i) => {
      const userName = room.users[messageData.userId]?.name ?? cachedUsernames[messageData.userId]

      if (!userName) msgIndicesWithMissingUsers[i] = messageData.userId

      acc.push({ ...messageData, userName })

      return acc
    }, [])

    messages.value = newMessages

    const missingEntries = Object.entries(msgIndicesWithMissingUsers)

    if (missingEntries.length > 0) {
      cacheMissingUsers(Object.values(msgIndicesWithMissingUsers)).then(() => {
        for (const [msgIndex, userId] of missingEntries) {
          messages.value[+msgIndex].userName = cachedUsernames[userId]
        }
      })
    }
  }

  const fetchMessages = async () => {
    if (!room.value) {
      throw new TypeError('room is undefined')
    }

    loadingMessages.value = true
    errorMessages.value = null

    getMessages(room.value)
      .catch((err) => (errorMessages.value = err))
      .finally(() => (loadingMessages.value = false))
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

      newRoomData = roomDoc.data() as Room
      newRoomData.id = roomDoc.id
    }

    room.value = { ...newRoomData }

    fetchMessages()
  }

  const fetchRoom = async () => {
    loadingRoom.value = true
    errorRoom.value = null

    getRoom()
      .catch((err) => (errorRoom.value = err))
      .finally(() => (loadingRoom.value = false))
  }

  fetchRoom()

  return {
    room,
    loadingRoom,
    errorRoom,
    messages,
    loadingMessages,
    errorMessages,
    refetchRoom: fetchRoom,
    refetchMessages: fetchMessages
  }
}
