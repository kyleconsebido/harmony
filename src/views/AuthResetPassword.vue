<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useAuth from '@/composables/useAuth'
import AuthForm from '@/components/AuthForm.vue'

const route = useRoute()
const router = useRouter()

const { verifyResetCode, resetPassword } = useAuth()

const email = ref('')

const loading = ref(false)

if (!route.query.code || typeof route.query.code !== 'string') {
  router.replace({ name: 'Login' })
} else {
  await verifyResetCode(route.query.code)
    .then((emailAddress) => (email.value = emailAddress))
    .catch(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
      router.replace({ name: 'Login' })
    })
}

const handleSubmit = (password: string) => {
  loading.value = true

  resetPassword(route.query.code as string, password)
    .then(() => alert('Password reset successfully'))
    .catch((error) => alert(error))
    .finally(() => router.replace({ name: 'Login' }))
}

const inputs: InstanceType<typeof AuthForm>['inputs'] = [
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
</script>

<template>
  <AuthForm
    :inputs="inputs"
    :loading="loading"
    :title="`Change Password for ${email}`"
    @submit="handleSubmit"
    submit-text="Send Email"
  >
    <template #bottom>
      <RouterLink to="/login" replace>Log In</RouterLink>
    </template>
  </AuthForm>
</template>
