import { ref, type Ref } from 'vue'
import useAuth from './useAuth'
import fetchFn from '@/utils/fetchFn'

interface FetchOptions {
  immediate?: boolean
}

interface FetchValues<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  refetch: () => Promise<T | null>
}

const DEFAULT_OPTS: FetchOptions = {
  immediate: true
}

const isFetchOptions = (initOrOpts?: RequestInit | FetchOptions): initOrOpts is FetchOptions => {
  if (!initOrOpts) return false
  return 'immediate' in initOrOpts
}

function useFetch<T>(path: `/${string}`, init?: RequestInit, opts?: FetchOptions): FetchValues<T>

function useFetch<T>(path: `/${string}`, opts?: FetchOptions): FetchValues<T>

function useFetch<T>(
  path: `/${string}`,
  initOrOpts?: RequestInit | FetchOptions,
  opts: FetchOptions = DEFAULT_OPTS
): FetchValues<T> {
  const init: RequestInit | undefined = !isFetchOptions(initOrOpts) ? initOrOpts : undefined
  const options: FetchOptions = isFetchOptions(initOrOpts) ? initOrOpts : opts

  const { user: currentUser } = useAuth()

  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const getData = async <T>(): Promise<T | null> => {
    try {
      const response = await fetchFn(path, currentUser.value, init)

      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new Error('Unauthorized')
          default:
            throw new Error('An error occured')
        }
      }

      const { data } = await response.json()

      return data as T | null
    } catch (error) {
      throw (error as Error).message
    }
  }

  const fetchData = async (): Promise<T | null> => {
    loading.value = true
    error.value = null

    return await getData()
      .then((dat) => (data.value = dat as T | null))
      .catch((err) => (error.value = err))
      .finally(() => (loading.value = false))
  }

  if (options?.immediate) {
    fetchData()
  }

  return { data, loading, error, refetch: fetchData }
}

export default useFetch
