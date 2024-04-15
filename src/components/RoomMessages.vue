<script setup lang="ts">
import type { Room } from '@/schema'
import { ref } from 'vue'
import useMessages from '@/composables/useMessages'

interface Props {
  room: Room
}

const { room } = defineProps<Props>()

const { messages, sendMessage } = useMessages(room)

const input = ref('')
</script>

<template>
  <div class="messages">
    <div class="chat">
      <div v-for="msg of messages" :key="msg.id">
        <p>{{ msg.message }}</p>
        <span> - {{ msg.userName }} ~ {{ msg.sending }}</span>
      </div>
    </div>
    <form class="send-chat" @submit.prevent="sendMessage(input)">
      <input v-model.trim="input" :placeholder="`Message ${room.name}`" />
      <button>Send</button>
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
  display: grid;
  grid-template-columns: 1fr 2.5em;
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

    &::placeholder {
      color: var(--color-text-light-mute)
    }
  }
}
</style>
