import { ref } from 'vue'

export type ToastType = 'default' | 'success' | 'error'

export interface ToastOptions {
  type?: ToastType
  /**
   * The lifetime of the toast in milliseconds before automatically
   * dismissing.
   *
   * Setting the value to `-1` will prevent automatic dismissal.
   *
   * @default ```3000``` 3 seconds
   */
  timeout?: number
  /**
   * @default ```true```
   */
  dismissible?: boolean
  /**
   * The toast persists in the specified paths even when navigating between routes.
   *
   * By default, the toast is dismissed when navigating between routes.
   */
  persistInPaths?: string[]
}

export interface Toast extends ToastOptions {
  id: string
  message: string
  dismiss: () => void
}

const toasts = ref<Toast[]>([])

const dismissToast = (toastId: Toast['id']) => {
  const index = toasts.value.findIndex((toast) => toast.id === toastId)
  toasts.value.splice(index, 1)
}

export const useToast = (message: string, opts?: ToastOptions) => {
  let uniqueId: Toast['id']

  do uniqueId = Date.now() + crypto.getRandomValues(new Uint8Array(2)).join('')
  while (toasts.value.some((toast) => toast.id === uniqueId))

  const toast: Toast = {
    id: uniqueId,
    message: message,
    dismiss: () => dismissToast(uniqueId),
    type: opts?.type || 'default',
    dismissible: opts?.dismissible || true,
    timeout: opts?.timeout || 3000,
    persistInPaths: opts?.persistInPaths
  }

  toasts.value.unshift(toast)

  return toast
}

export default () => toasts
