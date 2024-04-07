<script setup lang="ts">
import { ref } from 'vue'
import useAuth from '@/composables/useAuth'
import AuthForm from '@/components/AuthForm.vue'

const { forgotPassword } = useAuth()

const loading = ref(false)

const inputs: InstanceType<typeof AuthForm>['inputs'] = [
  { name: 'email', label: 'Email Address', type: 'email', required: true }
]

const handleSubmit = (email: string) => {
  loading.value = true

  forgotPassword(email)
    .then(() => alert('Email Sent'))
    .catch((err) => alert(err))
    .finally(() => (loading.value = false))
}
</script>

<template>
  <AuthForm
    :inputs="inputs"
    :loading="loading"
    @submit="handleSubmit"
    title="Forgot your Password?"
    submit-text="Send Email"
  >
    <RouterLink to="/login">Log In</RouterLink>
  </AuthForm>
</template>
