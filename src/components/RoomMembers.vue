<script setup lang="ts">
import type { RoomUser } from '@/schema'
import { computed, ref, watch } from 'vue'
import { useToast } from '@/composables/useToasts'
import useAuth from '@/composables/useAuth'
import fetchFn from '@/utils/fetchFn'
import AppModal from './AppModal.vue'
import LoadingDots from './LoadingDots.vue'
import IconCopy from './icons/IconCopy.vue'
import IconPeopleAdd from './icons/IconPeopleAdd.vue'
import ProfileButton from './ProfileButton.vue'

interface Props {
  roomId: string
  members: Record<string, RoomUser>
}

type Member = RoomUser & { id: string }

const props = defineProps<Props>()

const { user } = useAuth()

let abortController: AbortController

const openModal = ref(false)

const loadingCode = ref(false)
const inviteLink = ref('')

const mapUserCallback = ([userId, user]: [userId: string, user: RoomUser]) => {
  return { id: userId, ...user }
}

const sortUserCallback = (userA: Member, userB: Member) => {
  if (userA.name! < userB.name!) {
    return -1
  }

  if (userA.name! > userB.name!) {
    return 1
  }

  return 0
}

const sortedAdmins = computed<Member[]>(() =>
  Object.entries(props.members)
    .map(mapUserCallback)
    .filter((user) => user.isAdmin)
    .sort(sortUserCallback)
)

const sortedMembers = computed<Member[]>(() =>
  Object.entries(props.members)
    .map(mapUserCallback)
    .filter((user) => !user.isAdmin)
    .sort(sortUserCallback)
)

const getInviteCode = async () => {
  abortController = new AbortController()
  loadingCode.value = true

  openModal.value = true

  const { data } = await fetchFn(`/room/${props.roomId}/code`, user.value, {
    signal: abortController.signal
  })
    .then((res) => res.json())
    .then((data) => data)
    .catch((error) => {
      if (abortController.signal.aborted) return

      useToast(error.message, { type: 'error' })
    })
    .finally(() => (loadingCode.value = false))

  if (!data) return

  inviteLink.value = `${window.location.origin}/${props.roomId}/${data}`
}

const copyLink = () => {
  window.navigator.clipboard.writeText(inviteLink.value)
}

watch(openModal, (to, from) => {
  if (from && !to && abortController) {
    abortController.abort()
  }
})
</script>

<template>
  <section class="members">
    <header>
      <h1>Members</h1>
      <button :disabled="loadingCode" @click="getInviteCode" class="invite-btn">
        <IconPeopleAdd />
      </button>
    </header>

    <div class="member-list">
      <div v-for="(admin, i) of sortedAdmins" :key="admin.id" class="member admin">
        <ProfileButton
          :user-id="admin.id"
          :display-name="admin.name!"
          :position="i === 0 ? 'bottom-right' : 'top-right'"
          class="member-profile"
          btn-class="member-profile-btn"
        />
        <span class="info admin-info">
          <span class="name">{{ admin.name }}</span>
          <span class="admin-tag">Admin</span>
        </span>
      </div>
    </div>

    <div class="member-list">
      <div v-for="member of sortedMembers" :key="member.id" class="member">
        <ProfileButton
          :user-id="member.id"
          :display-name="member.name!"
          class="member-profile"
          btn-class="member-profile-btn"
          position="top-right"
        />
        <span class="info name"> {{ member.name }} </span>
      </div>
    </div>

    <AppModal :open="openModal" @close="openModal = false" title="Invite Link">
      <LoadingDots v-if="loadingCode" class="loading" />
      <div v-else class="invite-link">
        {{ inviteLink }}
        <button @click="copyLink" class="copy"><IconCopy /></button>
      </div>
    </AppModal>
  </section>
</template>

<style scoped>
.members {
  height: 100svh;
  overflow-y: auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-weight: 500;
}

.invite-btn {
  background-color: transparent;
  height: 100%;
  padding: 0;
  border: none;
  width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-dark-mute);
  transition: 200ms color;

  &:hover {
    color: var(--color-text-dark);
  }

  svg {
    height: 100%;
    width: 100%;
  }
}

.member-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
}

.member {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.member-profile {
  width: 32px;
  height: 32px;
  border-radius: 100%;
  display: inline-flex;
}

:deep(.member-profile-btn) {
  border-radius: inherit;
}

.info {
  width: calc(100% - 32px - 0.5rem);
}

.name {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 80%;
}

.admin-info {
  display: flex;
  flex-direction: column;
  line-height: 1rem;
}

.admin-tag {
  font-size: 0.8rem;
  color: var(--color-text-dark-mute);
}

.loading {
  width: 300px;
  justify-content: center;
}

.invite-link {
  background-color: var(--color-section-2);
  color: var(--color-text-dark);
  padding: 1em;
  border-radius: var(--base-border-radius);
  width: 300px;
  column-gap: 1em;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  word-break: break-all;
}

.copy {
  background-color: transparent;
  border: none;
  width: 2.5em;
  height: 2.5em;
  padding: 0;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  cursor: pointer;
  color: var(--color-text-light-mute);
  transition: 200ms color;

  &:hover {
    color: var(--color-text-dark-mute);
  }

  svg {
    width: 100%;
    height: 100%;
  }
}
</style>
