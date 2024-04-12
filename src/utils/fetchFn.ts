import type { User } from 'firebase/auth'

export default async (path: `/${string}`, user: User | null, init?: RequestInit) => {
  const input = '/api' + path.replace(/^\/api/, '')

  const token = await user?.getIdToken()

  const requestInit = init ?? {}

  requestInit.headers = new Headers(init?.headers)
  requestInit.headers.set('Authorization', `Bearer ${token}`)

  return fetch(input, requestInit).then((res) => {
    if (res.redirected) {
      window.location.href = res.url
    }

    return res
  })
}
