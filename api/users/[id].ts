import middleware from '../_middleware'
import { sendJson } from '../_utils'
import { auth } from '../_app'

const getUserById = async (req: Request) => {
  const url = new URL(req.url)
  const id = url.searchParams.get('email')

  if (!id) return sendJson({ error: 'User ID not found' }, { status: 404 })

  const user = await auth.getUserByEmail(id).catch(() => null)

  if (!user) return sendJson({ error: 'User not found' }, { status: 404 })

  return sendJson({ data: user })
}

export const GET = middleware(getUserById)
