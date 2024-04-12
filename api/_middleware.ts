import type { xVercelApiHandler, VercelResponse, xVercelRequest } from '@vercel/node'
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'
import { auth } from './_app'
import { sendJson } from './_utils'

export type MethodHandler = (req: Request, context: FetchEvent) => Promise<Response> | Response

export type Handler = xVercelApiHandler | MethodHandler

type HandlerType = 'method' | 'vercel'

interface MethodHandlerParams {
  arg1: Request
  arg2: FetchEvent
}

interface VercelApiHandlerParams {
  arg1: xVercelRequest
  arg2: VercelResponse
}

type HandlerParams = MethodHandlerParams | VercelApiHandlerParams

interface MiddlewareOptions {
  /**@default ```true``` */
  requiresAuth?: boolean
}

const DEFAULT_OPTS: MiddlewareOptions = {
  requiresAuth: true
}

const AUTH_URL = `${process.env.APP_URL ?? 'https://' + process.env.VERCEL_URL}/login`

const isMethodHandler = (params: HandlerParams): params is MethodHandlerParams => {
  return params.arg1 instanceof Request
}

const verifyRequest = async (request: Request | xVercelRequest, handlerType: HandlerType) => {
  let authorization: string | null | undefined

  if (handlerType === 'method') {
    authorization = (request as Request).headers.get('Authorization')
  } else if (handlerType === 'vercel') {
    authorization = (request as xVercelRequest).headers.authorization
  } else {
    throw new TypeError('handlerType is undefined')
  }

  const token = authorization?.split('Bearer ')?.[1]

  if (!token) return null

  let decodedToken: DecodedIdToken | null

  try {
    decodedToken = await auth.verifyIdToken(token)
  } catch (error) {
    decodedToken = null
  }

  return decodedToken
}

/**
 * For Authentication & Global Error Handling
 * @example
 * import middleware from './_middleware'
 *
 * // Passing a MethodHandler
 * const getHello = () => new Response('Hello World!')
 * export const GET = middleware(getHello)
 *
 * // Passing a xVercelApiHandler
 * const handler: xVercelApiHandler = (req, res) => res.send('OK')
 * export default middleware(handler)
 */
const middleware = (
  handler: Handler,
  { requiresAuth = DEFAULT_OPTS.requiresAuth }: MiddlewareOptions = DEFAULT_OPTS
): Handler => {
  return (async (...args: Parameters<Handler>) => {
    const params = { arg1: args[0], arg2: args[1] } as HandlerParams
    const handlerType: HandlerType = isMethodHandler(params) ? 'method' : 'vercel'

    try {
      if (handlerType === 'method') {
        const methodHandler = handler as MethodHandler
        const { arg1: request, arg2: context } = params as MethodHandlerParams

        const user = await verifyRequest(request, 'method')
        request._user = user

        if (!user && requiresAuth) {
          return Response.redirect(AUTH_URL, 307)
        } else {
          return await methodHandler(request, context)
        }
      } else {
        const vercelApiHandler = handler as xVercelApiHandler
        const { arg1: request, arg2: response } = params as VercelApiHandlerParams

        const user = await verifyRequest(request, 'vercel')
        request._user = user

        if (requiresAuth && !user) {
          response.redirect(307, AUTH_URL)
        } else {
          await vercelApiHandler(request, response)
        }
      }
    } catch (error) {
      console.error(error)

      const errorMessage = { error: 'Internal Server Error' }

      if (handlerType === 'method') {
        return sendJson(errorMessage, { status: 500 })
      } else {
        ;(args[1] as VercelResponse).status(500).send(errorMessage)
      }
    }
  }) as Handler
}

export default middleware
