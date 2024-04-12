import { ref, type UnwrapRef } from 'vue'
import useAuth from './useAuth'
import fetchFn from '@/utils/fetchFn'

export default <T>(path: `/${string}`, init?: RequestInit) => {
  const { user: currentUser } = useAuth()

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const getData = async (): Promise<T | null> => {
    try {
      const response = await fetchFn(path, currentUser.value, init)

      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new Error('User not found')
          case 404:
            throw new Error('Not found')
          default:
            throw new Error('Fetch failed')
        }
      }

      const { data } = await response.json()

      return data as T | null
    } catch (error) {
      throw (error as Error).message
    }
  }

  const fetchUser = () => {
    loading.value = true
    error.value = null

    getData()
      .then((dat) => (data.value = dat as UnwrapRef<T> | null))
      .catch((err) => (error.value = err))
      .finally(() => (loading.value = false))
  }

  fetchUser()

  return { data, loading, error }
}
