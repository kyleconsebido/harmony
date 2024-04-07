<script setup lang="ts">
import { toRef } from 'vue'
import { isEmailValid } from '@/utils'
import LoadingDots from './LoadingDots.vue'

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
        {{ input.label ?? input.name }}
        <span class="required">{{ input.required ? ' *' : '' }}</span>
      </label>
      <input
        v-model="values[i].value"
        :id="input.name"
        :name="input.label ?? input.name"
        :type="input.type"
        :class="{ error: !!errors[i].value }"
        @input="handleInput(i)"
      />
      <Transition name="drawer" mode="out-in">
        <span v-if="errors[i].value" class="error-message">
          {{ errors[i].value }}
        </span>
      </Transition>
      <slot :name="input.name"></slot>
    </div>
    <button class="submit" :disabled="loading">
      <template v-if="!loading"> {{ submitText ?? 'Submit' }} </template>
      <LoadingDots v-else class="loading" color="white" />
    </button>
    <slot name="bottom"></slot>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

h1 {
  color: var(--color-heading);
  font-weight: 500;
  text-align: center;
  margin-bottom: 0.5em;
}

label {
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-dark-mute);
}

input {
  background-color: var(--color-input);
  border: none;
  outline: none;
  border-radius: var(--base-border-radius);
  transition: 200ms box-shadow;
}

input,
.submit {
  padding: 0.5em 0.75em;
  font-family: inherit;
  font-size: 1rem;
}

input:focus-visible {
  box-shadow: 0 0 0 1px var(--color-border);
}

input.error:focus-visible {
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-border) 50%, var(--color-error) 50%);
}

.input-container {
  display: flex;
  flex-direction: column;
}

.required {
  color: var(--color-error);
}

.error {
  box-shadow: 0 0 0 1px var(--color-error);
}

.error-message {
  color: var(--color-error);
  max-height: 2rem;
  font-size: 0.8rem;
}

.submit {
  background-color: var(--color-brand);
  color: var(--color-text-light);
  margin-top: 1em;
  border: none;
  border-radius: var(--base-border-radius);
  transition: 200ms background-color;
}

.submit:disabled {
  background-color: var(--color-disabled);
}

.submit:enabled {
  cursor: pointer;
}

.submit:enabled:hover {
  background-color: var(--color-brand-hover);
}

.loading {
  font-size: 0.6rem;
}

:slotted(span) {
  color: var(--color-text-light-mute);
}

:slotted(a) {
  color: var(--color-brand);
  text-decoration: none;
  width: fit-content;
}

:slotted(a:hover) {
  text-decoration: underline;
}

.drawer-enter-active,
.drawer-leave-active {
  transition:
    200ms max-height,
    200ms opacity;
}

.drawer-enter-from,
.drawer-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
