import { FirebaseError } from 'firebase/app'
import {
  type User,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth'
import { ref } from 'vue'

const auth = getAuth()

let resolveLoading: typeof Promise.resolve

const loading = ref<Promise<void> | null>(
  new Promise((resolve) => (resolveLoading = resolve as typeof Promise.resolve))
)

const user = ref<User | null>(null)

const register = async (name: string, email: string, password: string) => {
  if (!name?.trim()) {
    throw new Error('Username is required')
  }

  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredentials) => updateProfile(userCredentials.user, { displayName: name }))
    .catch((error) => {
      throw new Error(getErrorMessage(error))
    })
}

const logIn = async (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password).catch((error) => {
    throw new Error(getErrorMessage(error))
  })

const logOut = async () => auth.signOut()

const forgotPassword = async (email: string) =>
  sendPasswordResetEmail(auth, email).catch((error) => {
    throw new Error(getErrorMessage(error))
  })

const verifyResetCode = async (code: string) =>
  verifyPasswordResetCode(auth, code).catch((error) => {
    throw new Error(getErrorMessage(error))
  })

const resetPassword = async (code: string, password: string) => {
  return confirmPasswordReset(auth, code, password).catch((error) => {
    throw new Error(getErrorMessage(error))
  })
}

onAuthStateChanged(auth, (currentUser) => {
  if (loading.value) {
    resolveLoading()
    loading.value = null
  }

  user.value = currentUser
})

export default () => ({
  loading,
  user,
  register,
  logIn,
  logOut,
  forgotPassword,
  verifyResetCode,
  resetPassword
})

function getErrorMessage(error?: FirebaseError) {
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'Email is invalid'
    case 'auth/missing-password':
      return 'Password is required'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters'
    case 'auth/missing-email':
      return 'Email is required'
    case 'auth/email-already-in-use':
      return 'Email is already in use'
    case 'auth/invalid-credential':
      return 'Email or password is incorrect'
    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return 'Reset password code is invalid'
    default:
      return 'An error occured. Please try again'
  }
}
