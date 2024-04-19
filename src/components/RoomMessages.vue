<script setup lang="ts">
import type { Room } from '@/schema'
import { ref } from 'vue'
import useAuth from '@/composables/useAuth'
import useMessages from '@/composables/useMessages'
import IconPlane from './icons/IconPlane.vue'
import ProfileButton from './ProfileButton.vue'
import LoadingDots from './LoadingDots.vue'

interface Props {
  room: Room
}

const { room } = defineProps<Props>()

const { user } = useAuth()

const { messages, sendMessage } = useMessages(room)

const input = ref('')

const getProfileBtnPos = (userId: string, index: number) => {
  let position: InstanceType<typeof ProfileButton>['position'] =
    userId === user.value?.uid ? 'left' : 'right'

  if (index === 0) {
    position = 'top-' + position
  }

  return position as InstanceType<typeof ProfileButton>['position']
}

const handleSend = () => {
  if (!input.value) return

  sendMessage(input.value)

  input.value = ''
}
</script>

<template>
  <div class="messages">
    <div class="chat">
      <div
        v-for="(msg, i) of messages"
        :key="msg.id"
        :class="{ sent: msg.userId === user?.uid }"
        class="message"
      >
        <div class="name-container">
          <div class="name">{{ msg.userName }}</div>
        </div>
        <div class="bubble-container">
          <ProfileButton
            :user-id="msg.userId"
            :display-name="msg.userName!"
            :position="getProfileBtnPos(msg.userId, i)"
            class="msg-profile"
            btn-class="msg-profile-btn"
          />
          <p class="bubble">{{ msg.message }}</p>
          <LoadingDots v-if="msg.sending" class="sent-loading" />
        </div>
      </div>
    </div>
    <form class="send-chat" @submit.prevent="handleSend">
      <textarea
        v-model.trim="input"
        :placeholder="`Message ${room.name}`"
        @keypress.exact.enter.prevent="handleSend"
        @keypress.shift="null"
      ></textarea>
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

.message {
  margin-right: calc(var(--room-padding) - 3px);
}

.chat {
  padding-left: var(--room-padding);
  position: relative;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
  margin-right: 3px;
  gap: 0.5em;

  &::-webkit-scrollbar-track {
    margin-top: 6px;
    margin-bottom: 6px;
    background-color: var(--color-section);
  }
}

.name-container {
  display: flex;

  &::before {
    content: '';
    width: calc(32px + var(--room-padding) / 2);
  }

  .name {
    font-size: 0.8rem;
    color: var(--color-text-dark-mute);
  }
}

.bubble-container {
  display: flex;
  gap: 0.5em;

  .bubble {
    background-color: var(--color-received);
    border-radius: var(--base-border-radius);
    padding: 0.5em;
    white-space: break-spaces;
  }
}

.sent {
  align-self: flex-end;

  .name-container {
    flex-direction: row-reverse;
  }

  .bubble-container {
    flex-direction: row-reverse;

    .bubble {
      background-color: var(--color-sent);
      color: var(--color-text-light);
    }
  }
}

.sent-loading {
  font-size: 0.5rem;
  align-self: center;
  opacity: 0;
  animation: fade-in 200ms 500ms forwards;
}

.msg-profile {
  width: 32px;
  height: 32px;
  align-self: flex-end;
}

:deep(.msg-profile-btn) {
  border-radius: 100%;
  width: 32px;
  height: 32px;
}

.send-chat {
  display: flex;
  column-gap: 0.5em;
  padding: var(--room-padding);

  textarea {
    border: none;
    outline: none;
    resize: none;
    border-radius: var(--base-border-radius);
    padding: var(--room-padding);
    padding-bottom: calc(var(--room-padding) - 2px);
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

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
