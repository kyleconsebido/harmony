<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToasts'
import useAuth from '@/composables/useAuth'
import AuthForm from '@/components/AuthForm.vue'

const route = useRoute()
const router = useRouter()
const { logIn } = useAuth()

const { redirect } = route.query
const decodedRedirect = atob(typeof redirect === 'string' ? redirect : redirect?.[0] || '')

const loading = ref(false)

const inputs: InstanceType<typeof AuthForm>['inputs'] = [
  { name: 'email', label: 'Email Address', type: 'email', required: true },
  { name: 'password', label: 'Password', type: 'password', required: true }
]

const handleSubmit = (email: string, password: string) => {
  loading.value = true

  logIn(email, password)
    .then(() => router.replace(redirect ? decodedRedirect : { name: 'Rooms' }))
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
