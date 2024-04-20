<script setup lang="ts">
import type { Room } from '@/schema'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToasts'
import useAuth from '@/composables/useAuth'
import useRoom from '@/composables/useRoom'
import fetchFn from '@/utils/fetchFn'
import RoomMessages from '@/components/RoomMessages.vue'
import DropdownButton from '@/components/DropdownButton.vue'
import AppModal from '@/components/AppModal.vue'
import IconBox from '@/components/icons/IconBox.vue'
import IconEdit from '@/components/icons/IconEdit.vue'

interface Props {
  roomData?: Room
}

const { user } = useAuth()

const { roomData } = defineProps<Props>()

const route = useRoute()
const router = useRouter()

const { room, loading, error, updateName, leaveRoom, deleteRoom } = useRoom({
  roomData,
  roomId: route.params.id as string
})

const loadingCode = ref(false)

const loadingUpdate = ref(false)
const updatedName = ref('')
const openEditModal = ref(false)

const loadingDelete = ref(false)
const openDeleteModal = ref(false)

const isAdmin = computed(() => {
  return room.value?.users[user.value?.uid || '']?.isAdmin
})

const handleDropdownClick = (modal: 'edit' | 'delete', closeDropdown: () => void) => {
  closeDropdown()

  if (modal === 'edit') {
    openEditModal.value = true
  } else if (modal === 'delete') {
    openDeleteModal.value = true
  }
}

const handleUpdateName = async () => {
  if (!updatedName.value) return

  loadingUpdate.value = true

  await updateName(updatedName.value).catch((error) => useToast(error.message, { type: 'error' }))

  updatedName.value = ''
  loadingUpdate.value = false
  openEditModal.value = false
}

const getInviteCode = () => {
  loadingCode.value = true

  fetchFn(`/room/${route.params.id}/code`, user.value)
    .then((res) => res.json())
    .then((data) => useToast(data.data))
    .catch((error) => useToast(error.message, { type: 'error' }))
    .finally(() => (loadingCode.value = false))
}

watch(error, () => {
  if (error.value) {
    router.replace({ name: 'Rooms' })
  }
})

const handleDeleteRoom = () => {
  loadingDelete.value = true

  deleteRoom()
    .then(() => {
      router.replace({ name: 'Rooms' })
      useToast('Room Deleted', { type: 'success', persistInPaths: ['/rooms'] })
    })
    .catch((error) => useToast(error.message, { type: 'error' }))
    .finally(() => (loadingDelete.value = false))
}

const handleLeaveRoom = () => {
  loadingDelete.value = true

  leaveRoom()
    .then(() => {
      router.replace({ name: 'Rooms' })
      useToast(`Left ${room.value?.name}`, { type: 'success', persistInPaths: ['/rooms'] })
    })
    .catch((error) => useToast(error.message, { type: 'error' }))
    .finally(() => (loadingDelete.value = false))
}
</script>

<template>
  <div v-if="loading">Loading</div>
  <div v-else-if="room" class="room">
    <main>
      <header>
        <h1 class="title">{{ room.name }}</h1>
        <DropdownButton class="room-actions" v-slot="{ close }">
          <button @click="handleDropdownClick('edit', close)"><IconEdit /> Edit Name</button>
          <button @click="handleDropdownClick('delete', close)" class="delete">
            <IconBox /> {{ isAdmin ? 'Delete' : 'Leave' }} Room
          </button>
        </DropdownButton>
        <AppModal
          :open="openEditModal"
          @close="openEditModal = false"
          title="Edit Name"
          class="modal"
        >
          <form @submit.prevent="handleUpdateName">
            <input v-model.trim="updatedName" />
            <button><IconEdit /></button>
          </form>
        </AppModal>
        <AppModal
          :title="(isAdmin ? 'Delete ' : 'Leave ') + room.name + '?'"
          :open="openDeleteModal"
          @close="openDeleteModal = false"
          class="modal"
          v-slot="{ close }"
        >
          <div style="margin-bottom: 1rem;">This action cannot be undone</div>
          <div class="delete">
            <button @click="close" class="cancel">Cancel</button>
            <button v-if="isAdmin" @click="handleDeleteRoom" class="submit">Delete Room</button>
            <button v-else @click="handleLeaveRoom" class="submit">Leave Room</button>
          </div>
        </AppModal>
      </header>
      <RoomMessages v-if="room" :room="room" class="messages" />
    </main>
    <section class="members">
      <h1>Members</h1>
      <button :disabled="loadingCode" @click="getInviteCode">Invite Members</button>
      <div v-for="[id, user] of Object.entries(room.users)" :key="id">
        {{ user }}
      </div>
    </section>
  </div>
</template>

<style scoped>
.room {
  height: 100svh;
  display: grid;
  grid-template-columns: 1fr 250px;
  overflow: hidden;
}

main {
  height: 100%;
  display: grid;
  grid-template-rows: 80px calc(100svh - 80px);
}

main header {
  padding: var(--room-padding);
  display: flex;
  box-shadow: 0 0 2px 0 var(--color-border);
  align-items: center;

  .title {
    font-weight: 500;
    margin-right: 0.5em;
  }
}

.room-actions {
  translate: 0 3px;
  width: 1.5rem;
  height: 1.5rem;

  button {
    display: flex;
    align-items: center;
    gap: 3px;

    svg {
      height: 100%;
    }
  }

  .delete {
    color: var(--color-error);
  }
}

form {
  display: flex;
  gap: 1em;
}

.modal input {
  background-color: var(--color-input);
  font-family: inherit;
  padding: 0.5em 1em;
  outline: none;
  border: none;
  border-radius: var(--base-border-radius);
}

.modal button {
  border-radius: var(--base-border-radius);
  border: none;
  font-family: inherit;
  padding: 0.5em 1em;
  color: var(--color-text-light);
  background-color: var(--color-success);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  transition: 200ms background-color;

  &:enabled {
    cursor: pointer;

    &:hover {
      background-color: var(--color-success-hover);
    }
  }
}

.modal .delete {
  display: flex;
  gap: 0.5em;

  button {
    padding: 0.5rem 1rem;
  }
  .cancel {
    background-color: var(--color-text-dark-mute);

    &:enabled:hover {
      background-color: var(--color-text-dark);
    }
  }

  .submit {
    background-color: var(--color-error);

    &:enabled:hover {
      background-color: var(--color-error-hover);
    }
  }
}

.members {
  background-color: var(--color-section);
  padding: var(--room-padding);
}
</style>
