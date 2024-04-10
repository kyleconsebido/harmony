import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'
import type { VercelRequest as _VercelRequest, VercelResponse } from '@vercel/node'

type CurrentUser = DecodedIdToken | null | undefined

declare global {
  interface Request {
    _user?: CurrentUser
  }
}

declare module '@vercel/node' {
  export type xVercelRequest = _VercelRequest & {
    _user: CurrentUser
  }

  export type xVercelApiHandler = (req: xVercelRequest, res: VercelResponse) => void | Promise<void>
}
