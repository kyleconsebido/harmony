import middleware from '../_middleware'
import { sendJson } from '../_utils'
import { auth } from '../_app'

const getUserByEmail = async (req: Request) => {
  const url = new URL(req.url)
  const email = url.searchParams.get('email')

  if (!email) return sendJson({ error: 'Email not found' }, { status: 404 })

  const user = await auth.getUserByEmail(decodeURIComponent(email)).catch(() => null)

  if (!user) return sendJson({ error: 'User not found' }, { status: 404 })

  return sendJson({ data: user })
}

export const GET = middleware(getUserByEmail)
