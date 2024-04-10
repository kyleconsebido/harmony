/**
 * TypeScript shows error when executing `Response.json()` even though it works
 */
export const sendJson = <T>(data: T, init?: ResponseInit) => {
  const responseInit = init ?? {}

  responseInit.headers = new Headers(init?.headers)
  responseInit.headers.set('Content-Type', 'application/json')

  return new Response(JSON.stringify(data), responseInit)
}
