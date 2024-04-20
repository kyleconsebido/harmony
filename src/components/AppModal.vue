<script setup lang="ts">
import { ref, watch } from 'vue'
import IconXMark from './icons/IconXMark.vue'

interface Props {
  open: boolean
  title?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{ close: [] }>()

const dialog = ref<HTMLDialogElement | null>(null)

const closeFromBackdrop = (e: MouseEvent) => {
  if (e.target === e.currentTarget) emit('close')
}

watch([props, dialog], () => {
  if (!dialog.value) return

  dialog.value.onclose = () => emit('close')

  if (props.open) {
    dialog.value.showModal()
  }
})
</script>

<template>
  <Transition name="fade">
    <dialog
      v-if="open"
      :ref="(el) => (dialog = el as HTMLDialogElement)"
      @pointerdown="closeFromBackdrop"
      @keydown.esc.prevent="emit('close')"
    >
      <div class="container">
        <div class="header">
          <h2 class="title">{{ title }}</h2>
          <button @click="emit('close')" class="close-btn"><IconXMark /></button>
        </div>
        <slot :Component="dialog" :close="() => emit('close')"></slot>
      </div>
    </dialog>
  </Transition>
</template>

<style scoped>
dialog {
  margin: auto;
  background: var(--color-background);
  padding: 0;
  border: none;
  border-radius: var(--base-border-radius);
  scrollbar-gutter: auto;
  box-shadow: 0 2px 6px 2px rgba(0, 0, 0, 0.05);
}

::backdrop {
  background-color: rgba(0, 0, 0, 0.1);
}

.container {
  padding: 1rem;
}

.header {
  display: grid;
  grid-template-columns: 1fr 2.5em;
  margin-bottom: 1em;

  .title {
    color: var(--color-heading);
    font-weight: 500;
  }

  .close-btn {
    background-color: transparent;
    width: 2.5em;
    height: 2.5em;
    border: none;
    border-radius: 100%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    transition: 200ms background-color;
    cursor: pointer;
    margin-left: auto;
    align-self: flex-start;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}

.fade-enter-active,
.fade-leave-active,
.fade-enter-active::backdrop,
.fade-leave-active::backdrop {
  transition:
    200ms opacity,
    200ms translate;
}

.fade-enter-from,
.fade-leave-to {
  translate: 0 -1rem;
}

.fade-enter-from,
.fade-leave-to,
.fade-enter-from::backdrop,
.fade-leave-to::backdrop {
  opacity: 0;
}
</style>
