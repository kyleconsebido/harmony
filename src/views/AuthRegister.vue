<script setup lang="ts">
import { ref } from 'vue'
import useAuth from '@/composables/useAuth'
import { useToast } from '@/composables/useToasts'
import AuthForm from '@/components/AuthForm.vue'

const { register } = useAuth()

const loading = ref(false)

const inputs: InstanceType<typeof AuthForm>['inputs'] = [
  { name: 'username', label: 'User Name', required: true },
  { name: 'email', label: 'Email Address', type: 'email', required: true },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    error: (value: string) => (value.length < 6 ? 'Password must have at least 6 characters' : '')
  },
  {
    name: 'rePassword',
    label: 'Re-enter Password',
    type: 'password',
    required: true,
    error: (value: string, otherValues: Record<string, string>) =>
      value !== otherValues.password ? 'Passwords do not match' : '',
    validateWith: 'password'
  }
]

const handleSubmit = (username: string, email: string, password: string) => {
  loading.value = true

  register(username, email, password)
    .then(() =>
      useToast('Registered successfully', { type: 'success', persistInPaths: ['/rooms'] })
    )
    .catch((error) => useToast(error.message, { type: 'error' }))
    .finally(() => (loading.value = false))
}
</script>

<template>
  <AuthForm
    :inputs="inputs"
    :loading="loading"
    @submit="handleSubmit"
    title="Create an Account"
    submit-text="Register"
  >
    <template #bottom>
      <span>
        <span>Already have an account? </span>
        <RouterLink class="link" to="/login">Login</RouterLink>
      </span>
    </template>
  </AuthForm>
</template>
