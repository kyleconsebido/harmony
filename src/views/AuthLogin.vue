<script setup lang="ts">
import { ref } from 'vue'
import useAuth from '@/composables/useAuth'
import { useToast } from '@/composables/useToasts'
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
    .catch((error) => useToast(error.message, { type: 'error' }))
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
      <RouterLink class="forgot" to="/forgot-password">Forgot your Password?</RouterLink>
    </template>
    <template #bottom>
      <span>
        <span>Need an Account? </span>
        <RouterLink to="/register">Register</RouterLink>
      </span>
    </template>
  </AuthForm>
</template>

<style scoped>
.forgot {
  margin-top: 0.2em;
}
</style>
