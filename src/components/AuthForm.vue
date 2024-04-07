<script setup lang="ts">
import { toRef } from 'vue'
import { isEmailValid } from '@/utils'

type InputType = 'email' | 'password' | 'text'

interface Input {
  name: string
  type?: InputType
  label?: string
  required?: boolean
  error?: (value: string, otherValues: Record<string, string>) => string
  /**
   * If this input's value is not empty,
   * run its validation in conjuction with another specified input.
   * Its value must be the name of an existing input in the same array.
   */
  validateWith?: string
}

interface Props {
  title: string
  inputs: Input[]
  loading?: boolean
  submitText?: string
}

const { title, inputs, loading, submitText } = defineProps<Props>()

const emit = defineEmits<{ (e: 'submit', ...args: string[]): void }>()

const values = inputs.map(() => toRef(''))
const errors = inputs.map(() => toRef(''))

const handleInput = (index: number) => {
  if (inputs[index].type !== 'password') {
    values[index].value = values[index].value.trim()
  }

  validate(index)
}

const validate = (index?: number) => {
  let otherValues: Record<string, string> = {}

  inputs.forEach((input, i) => {
    const validateAll = index === undefined
    const isCurrent = index === i

    if (isCurrent || validateAll) {
      errors[i].value = ''

      if (input.required && !values[i].value) {
        errors[i].value = 'Required'
        return
      }

      if (input.type === 'email' && !isEmailValid(values[i].value)) {
        errors[i].value = 'Invalid email'
        return
      }
    }

    const validateInConjuction =
      !validateAll && values[i].value && input.validateWith === inputs[index]?.name

    if (!isCurrent && !validateInConjuction && !validateAll) {
      return
    }

    if (Object.keys(otherValues).length === 0) {
      otherValues = inputs.reduce(
        (acc, input, i) => {
          acc[input.name] = values[i].value
          return acc
        },
        {} as Record<string, string>
      )
    }

    errors[i].value = input.error?.(values[i].value, otherValues) ?? ''
  })
}

const handleSubmit = () => {
  validate()

  if (errors.some((error) => error.value)) {
    return
  }

  emit('submit', ...values.map((val) => val.value))
}
</script>

<template>
  <form @submit.prevent="handleSubmit" novalidate>
    <h1>{{ title }}</h1>
    <div v-for="(input, i) of inputs" :key="input.name" class="input-container">
      <label :for="input.name">
        {{ input.label ?? input.name }}{{ input.required ? ' *' : '' }}
      </label>
      <input
        v-model="values[i].value"
        :id="input.name"
        :name="input.label ?? input.name"
        :type="input.type"
        @input="handleInput(i)"
      />
      <span class="error">{{ errors[i].value }}</span>
      <slot :name="input.name"></slot>
    </div>
    <button :disabled="loading">
      {{ submitText ?? 'Submit' }}
    </button>
    <slot></slot>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
}

.input-container {
  display: flex;
  flex-direction: column;
}

.error {
  color: red;
}
</style>
