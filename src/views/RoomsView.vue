<script setup lang="ts">
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
        <form class="create" @submit.prevent="createRoom(input)">
          <input v-model.trim="input" class="input" placeholder="Room Name" required />
          <button class="btn">+</button>
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
        <ProfileButton
          :user-id="user?.uid!"
          :display-name="user?.displayName!"
          :photo-url="user?.photoURL"
          :email="user?.email!"
          position="top-right"
          btn-class="room-btn"
          include-auth
        />
      </div>
    </section>

    <div class="main">
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" :roomData="selectedRoom" />
      </RouterView>
    </div>
  </div>
</template>

<style scoped>
.view {
  display: flex;
  height: 100svh;
  overflow: hidden;
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
  padding: var(--room-padding);
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
  left: calc(0em - var(--room-padding));
  width: 0.5em;
  height: 100%;
  background-color: var(--color-border);
  border-radius: 0 var(--base-border-radius) var(--base-border-radius) 0;
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
  display: block;
  width: var(--room-btn-size);
  height: var(--room-btn-size);
  min-height: var(--room-btn-size);
  position: relative;
  border: none;
  overflow: hidden;
  border-radius: calc(var(--base-border-radius));
  background-color: transparent;
  transition:
    200ms border-radius,
    400ms scale;
}

:deep(.room-btn):hover {
  scale: 1.1;
  border-radius: calc(var(--base-border-radius));
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
  padding: var(--room-padding);
  box-shadow: 0 -1px 2px -2px rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.create {
  display: flex;
  gap: 1em;
}

.btn {
  background-color: var(--color-success);
  font-weight: 500;
  font-size: 1.5rem;
  padding: 0 0.5em;

  &:hover {
    background-color: var(--color-success-hover);
  }
}

.main {
  flex: 1;
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.1);
}
</style>
