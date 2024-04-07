<script setup lang="ts">
import { ref } from 'vue'
import useAuth from '@/composables/useAuth'
import AuthForm from '@/components/AuthForm.vue'

const { logIn } = useAuth()

const loading = ref(false)

const inputs: InstanceType<typeof AuthForm>['inputs'] = [
  { name: 'email', label: 'Email Address', type: 'email', required: true },
  { name: 'password', label: 'Password', type: 'password', required: true }
]

const handleSubmit = (email: string, password: string) => {
  loading.value = true

  logIn(email, password)
    .then(() => alert('Logged in successfully'))
    .catch((err) => alert(err.message))
    .finally(() => (loading.value = false))
}
</script>

<template>
  <AuthForm
    :inputs="inputs"
    :loading="loading"
    @submit="handleSubmit"
    title="Welcome Back!"
    submit-text="Log In"
  >
    <template #password>
      <RouterLink class="link" to="/forgot-password">Forgot your Password?</RouterLink>
    </template>
    <template>
      <span>Need an Account? </span>
      <RouterLink class="link" to="/register">Register</RouterLink>
    </template>
  </AuthForm>
</template>
