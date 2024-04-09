type FetchInit = Parameters<typeof fetch>[1]
type PrettyPath = `/${string}`

const trailingSlash = new RegExp(/\/$/)

/**
 * `fetch` wrapper for calling cloudflare worker
 */
export default (prettyPath: PrettyPath, init?: FetchInit) => {
  let path = '/api' + prettyPath

  if (import.meta.env.DEV) {
    const host: string = import.meta.env.VITE_CLOUDFLARE_FUNCTIONS_URL

    if (!host?.trim()) {
      throw new TypeError('VITE_CLOUDFLARE_FUNCTIONS_URL from .env.development is undefined')
    }

    path = host.replace(trailingSlash, '') + path
  }

  return fetch(path, init)
}
