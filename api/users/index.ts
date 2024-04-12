import type { UserIdentifier } from 'firebase-admin/lib/auth/identifier'
import middleware from '../_middleware'
import { sendJson } from '../_utils'
import { auth } from '../_app'

const getUsers = async (req: Request) => {
  const url = new URL(req.url)

  const userIds = url.searchParams.getAll('id')

  if (userIds.length === 0) {
    return sendJson({ error: 'User IDs not found' }, { status: 404 })
  }

  const uids: UserIdentifier[] = userIds.map((uid) => ({ uid }))

  const results = await auth.getUsers(uids)

  const users = results.users.map((user) => ({
    id: user.uid,
    name: user.displayName
  }))

  return sendJson({ data: users })
}

export const GET = middleware(getUsers)
