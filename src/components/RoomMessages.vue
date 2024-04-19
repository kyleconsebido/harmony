<script setup lang="ts">
import type { Room } from '@/schema'
import { ref } from 'vue'
import useMessages from '@/composables/useMessages'
import IconPlane from './icons/IconPlane.vue'

interface Props {
  room: Room
}

const { room } = defineProps<Props>()

const { messages, sendMessage } = useMessages(room)

const input = ref('')

const handleSend = () => {
  if (!input.value) return

  input.value = ''
  
  sendMessage(input.value)
}
</script>

<template>
  <div class="messages">
    <div class="chat">
      <div v-for="msg of messages" :key="msg.id">
        <p>{{ msg.message }}</p>
        <span> - {{ msg.userName }} ~ {{ msg.sending }}</span>
      </div>
    </div>
    <form class="send-chat" @submit.prevent="handleSend">
      <input v-model.trim="input" :placeholder="`Message ${room.name}`" />
      <button><IconPlane /></button>
    </form>
  </div>
</template>

<style scoped>
.messages {
  --send-chat-height: calc(var(--room-btn-size) + var(--room-padding) * 2);

  display: grid;
  grid-template-rows: 1fr var(--send-chat-height);
}

.chat {
  padding-left: var(--room-padding);
  position: relative;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
  margin-right: 3px;

  &::-webkit-scrollbar-track {
    margin-top: 6px;
    margin-bottom: 6px;
    background-color: var(--color-section);
  }
}

.send-chat {
  display: flex;
  column-gap: 0.5em;
  padding: var(--room-padding);

  input {
    border: none;
    outline: none;
    border-radius: var(--base-border-radius);
    padding: var(--room-padding);
    background-color: var(--color-input);
    color: var(--color-text-dark);
    font-family: inherit;
    font-size: 1rem;
    box-shadow: inset 0 0 2px 0 rgba(0, 0, 0, 0.1);
    flex: 1;

    &::placeholder {
      color: var(--color-text-light-mute);
    }
  }

  button {
    background-color: var(--color-brand);
    border-radius: 100%;
    border: none;
    width: 3rem;
    height: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-text-light);
    transition:
      200ms background-color,
      200ms scale 100ms;

    &:enabled {
      cursor: pointer;
    }

    &:hover {
      background-color: var(--color-brand-hover);
    }

    &:active {
      transition:
        200ms background-color,
        200ms scale 0s;
      scale: 0.9;
    }

    svg {
      translate: -0.5px 1px;
      width: 90%;
      height: 90%;
    }
  }
}
</style>
