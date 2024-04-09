import admin, { type ServiceAccount } from 'firebase-admin'

let app: ReturnType<typeof admin.app>

try {
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || ''
  }

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

  app = admin.app()
} catch (error) {
  console.error(error)
}

export default app
