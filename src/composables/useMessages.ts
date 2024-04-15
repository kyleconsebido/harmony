import type { Room, Message as MessageData } from '@/schema'
import { onUnmounted, ref } from 'vue'
import {
  type Unsubscribe,
  collection,
  addDoc,
  Timestamp,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/firebase'
import { Collection } from '@/schema'
import mapSnapshot from '@/firebase/utils/mapSnapshot'
import useAuth from './useAuth'
import fetchFn from '@/utils/fetchFn'

interface Message extends MessageData {
  userName?: string | null
  sending?: boolean
}

export default (room: Room) => {
  const { user } = useAuth()

  const cachedUsernames: Record<string, string> = {}

  let unsub: Unsubscribe | null = null
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const cacheMissingUsers = async (missingUserIds: Set<string>) => {
    let query = '?'

    missingUserIds.forEach((userId) => (query += `id=${userId}&`))

    const response = await fetchFn(`/users${query}`, user.value)

    const { data } = (await response.json()) as { data: { id: string; name: string }[] }

    for (const user of data) {
      cachedUsernames[user.id] = user?.name
    }
  }

  const mapMessages = (messagesData: MessageData[], room: Room) => {
    const msgIndicesWithMissingUsers: Record<number, string> = {}

    const newMessages = messagesData.reduce<Message[]>((acc, messageData, i) => {
      const userName = room.users[messageData.userId]?.name ?? cachedUsernames[messageData.userId]

      if (!userName) msgIndicesWithMissingUsers[i] = messageData.userId

      acc.push({ ...messageData, userName })

      return acc
    }, [])

    messages.value = newMessages
    loading.value = false;

    const missingEntries = Object.entries(msgIndicesWithMissingUsers)

    if (missingEntries.length === 0) return

    const missingUserIds = new Set(Object.values(msgIndicesWithMissingUsers))

    cacheMissingUsers(missingUserIds).then(() => {
      for (const [msgIndex, userId] of missingEntries) {
        messages.value[+msgIndex].userName = cachedUsernames[userId]
      }
    })
  }

  const getMessages = async (room: Room) => {
    const q = query(
      collection(db, Collection.ROOMS, room.id, Collection.ROOM_MESSAGES),
      orderBy('timestamp' satisfies keyof MessageData, 'desc')
    )

    if (unsub) unsub()

    unsub = onSnapshot(q, { includeMetadataChanges: true }, (messagesData) => {
      const messages = mapSnapshot<Message>(messagesData, {
        additionalFields: { sending: (doc) => doc.metadata.hasPendingWrites }
      })

      mapMessages(messages, room)
    })
  }

  const sendMessage = async (message: string) => {
    if (!room || !user.value) return
    await addDoc(collection(db, Collection.ROOMS, room.id, Collection.ROOM_MESSAGES), {
      message,
      userId: user.value.uid,
      photoURL: user.value.photoURL,
      timestamp: Timestamp.now()
    } satisfies Omit<Message, 'id'>).catch((error) => {
      console.error(error)
    })
  }

  const fetchMessages = async () => {
    if (!room) {
      throw new TypeError('room is undefined')
    }

    loading.value = true
    error.value = null

    getMessages(room).catch((err) => (error.value = err))
  }

  fetchMessages()

  onUnmounted(() => unsub?.())

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetchMessages: fetchMessages
  }
}
