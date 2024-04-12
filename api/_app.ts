import dotenv from 'dotenv'
import admin, { type ServiceAccount } from 'firebase-admin'

if (process.env.__VERCEL_DEV_RUNNING == '1') {
  dotenv.config()
  dotenv.config({ path: '.env.development' })
}

let app: ReturnType<typeof admin.app>

export let auth: ReturnType<typeof app.auth>
export let db: ReturnType<typeof app.firestore>

try {
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || ''
  }

  admin.initializeApp({    credential: admin.credential.cert(serviceAccount) })

  app = admin.app()
  auth = app.auth()
  db = app.firestore()
} catch (error) {
  console.error(error)
}

export default async () => ({ app })
