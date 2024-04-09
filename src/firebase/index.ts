import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

export const db = getFirestore(app)

export const storage = getStorage(app)

if (import.meta.env.DEV) {
  const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST

  await Promise.all([
    import('firebase/auth')
      .then((fb) => fb.connectAuthEmulator)
      .then((conn) =>
        conn(auth, `http://${host}:${import.meta.env.VITE_FIREBASE_EMULATOR_AUTH_PORT}`)
      ),
    import('firebase/firestore')
      .then((fb) => fb.connectFirestoreEmulator)
      .then((conn) => conn(db, host, import.meta.env.VITE_FIREBASE_EMULATOR_FIRESTORE_PORT)),
    import('firebase/storage')
      .then((fb) => fb.connectStorageEmulator)
      .then((conn) => conn(storage, host, import.meta.env.VITE_FIREBASE_EMULATOR_STORAGE_PORT))
  ])
}

export default app
