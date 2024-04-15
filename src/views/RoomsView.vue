<script setup lang="ts">
import type { User } from 'firebase/auth'
import type { Room } from '@/schema'
import { ref } from 'vue'
import useAuth from '@/composables/useAuth'
import useRooms from '@/composables/useRooms'
import AppModal from '@/components/AppModal.vue'
import ProfileButton from '@/components/ProfileButton.vue'

const { user } = useAuth()

const { rooms, createRoom } = useRooms(user.value?.uid as string)

const selectedRoom = ref<Room | null>(null)
const openAddModal = ref(false)
const input = ref('')

const getFallbackImg = (seed: string) => {
  const fallbackImgSrc = 'https://api.dicebear.com/8.x/initials/svg?fontSize=36&seed='

  return fallbackImgSrc + seed
}

const closeAddModal = () => {
  openAddModal.value = false
  input.value = ''
}
</script>

<template>
  <div class="view">
    <section class="sidebar">
      <AppModal :open="openAddModal" @close="closeAddModal" title="Create Room">
        <form @submit.prevent="createRoom(input)">
          <input v-model.trim="input" placeholder="Room Name" required />
          <button>Add Room</button>
        </form>
      </AppModal>
      <nav class="rooms">
        <div v-for="room of rooms" :key="room.id" class="room">
          <RouterLink
            :to="{ name: 'Room', params: { id: room.id } }"
            @click="selectedRoom = room"
            class="room-btn"
            active-class="active"
          >
            <img :src="room.photoURL || getFallbackImg(room.name + room.id)" />
          </RouterLink>
        </div>
        <button @click="openAddModal = true" class="room-btn add-btn">
          <div class="logo"></div>
        </button>
      </nav>
      <div class="profile">
        <ProfileButton :user="user as User" position="top-right" btn-class="room-btn" />
      </div>
    </section>

    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" :roomData="selectedRoom" class="main" />
    </RouterView>
  </div>
</template>

<style scoped>
.view {
  --padding: 0.8rem;

  display: flex;
  height: 100svh;
}

.sidebar {
  box-sizing: border-box;
  background-color: var(--color-section);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.rooms {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: var(--padding);
  overflow-y: scroll;
  scrollbar-width: none;
  flex: 1;
}

.room {
  position: relative;
}

.room::after {
  content: '';
  position: absolute;
  top: 0;
  right: calc(0em - var(--padding));
  width: 0.5em;
  height: 100%;
  background-color: var(--color-background);
  border-radius: var(--base-border-radius) 0 0 var(--base-border-radius);
  opacity: 0;
  scale: 0.5;
  transition:
    200ms opacity,
    200ms scale;
}

.room:has(.active)::after {
  opacity: 1;
  scale: 1;
}

:deep(.room-btn) {
  --btn-size: 48px;

  display: block;
  width: var(--btn-size);
  height: var(--btn-size);
  min-height: var(--btn-size);
  position: relative;
  border: none;
  overflow: hidden;
  border-radius: calc(var(--base-border-radius) * 4);
  background-color: transparent;
  transition:
    200ms filter,
    400ms border-radius;
}

:deep(.room-btn):hover {
  border-radius: calc(var(--base-border-radius) * 2);
  filter: brightness(0.95);
}

:deep(.room-btn) img {
  width: 100%;
  height: 100%;
}

.add-btn {
  background-color: var(--color-success);
  cursor: pointer;

  .logo::after {
    content: '+';
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    color: var(--color-background);
    font-size: 2rem;
  }
}

.profile {
  margin-top: auto;
  background-color: var(--color-section-2);
  width: 100%;
  padding: var(--padding);
}

.main {
  flex: 1;
  padding: var(--padding) var(--padding);
}
</style>
