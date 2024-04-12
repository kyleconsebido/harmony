import type { Timestamp } from 'firebase/firestore'

export interface RoomUser {
  name: string
  photoURL: string
  isAdmin?: boolean
  timestamp: Timestamp
}

export interface Room {
  id: string
  name: string
  photoURL: string
  users: Record<string, RoomUser>
}

export interface Message {
  id: string
  message: string
  userId: string
  photoURL: string
  timestamp: Timestamp
}

export enum Collection {
  ROOMS = 'rooms',
  ROOM_MESSAGES = 'messages'
}
