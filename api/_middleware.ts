import type { VercelApiHandler, VercelRequest, VercelResponse } from '@vercel/node'
import { auth } from './_app'

export type MethodHandler = (req: Request, context: FetchEvent) => Promise<Response> | Response

export type Handler = VercelApiHandler | MethodHandler

/**
 * poor man's middleware.
 * @example 
 * // Passing a MethodHandler
 * function getNumber() {
 *  const number = Math.random()
 *  return new Response(number.toString())
 * }
 * 
 * export const GET = middleware(getNumber)
 * 
 * // Passing a VercelApiHandler
 * function handler(req: VercelRequest, res: VercelResponse) {
 *  const number = Math.random()
 *  res.send(number.toString())
 * } 
 * 
 * export default middleware(handler)
 */
const middleware = (handler: Handler): Handler => {
  return (async (arg1: Parameters<Handler>[0], arg2: Parameters<Handler>[1]) => {
    if (arg1 instanceof Request) {
      const headers = arg1.headers
      const token = headers && headers.get('Authorization')?.split('Bearer ')?.[1]

      try {
        if (!token) throw null
        await auth.verifyIdToken(token)
      } catch (error) {
        return Response.redirect(`${process.env.APP_HOST}/login`, 307)
      }

      const methodHandler = handler as MethodHandler
      methodHandler(arg1, arg2 as FetchEvent)
    } else {
      const token = arg1.headers.authorization?.split('Bearer ')?.[1]

      let isAuthenticated = false

      try {
        if (!token) throw null
        const user = await auth.verifyIdToken(token)
        isAuthenticated = !!user
      } catch (error) {
        const response = arg2 as VercelResponse
        response.redirect(307, `${process.env.APP_HOST}/login`)
      }

      if (isAuthenticated) {
        const vercelApiHandler = handler as VercelApiHandler
        vercelApiHandler(arg1 as VercelRequest, arg2 as VercelResponse)
      }
    }
  }) as Handler
}

export default middleware
