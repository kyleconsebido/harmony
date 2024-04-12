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
  <h1>Messages</h1>
  <div v-for="msg of messages" :key="msg.id">
    <p>{{ msg.message }}</p>
    <span> - {{ msg.userName }} ~ {{ msg.sending }}</span>
  </div>
  <button>refetch</button>
  <form @submit.prevent="sendMessage(input)">
    <input v-model.trim="input" :placeholder="`Message ${room.name}`" />
    <button>Send</button>
  </form>
</template>
