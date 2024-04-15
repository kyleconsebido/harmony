<script setup lang="ts">
import type { User } from 'firebase/auth'
import { onUnmounted, ref, watch } from 'vue'
import LogoutButton from './LogoutButton.vue'
import IconEdit from './icons/IconEdit.vue'
import useAuth from '@/composables/useAuth'

type Position = 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface Props {
  btnClass?: string
  position?: Position
  user: User | null
}

defineProps<Props>()

const { user: currentUser } = useAuth()

const open = ref(false)
const profile = ref<HTMLDivElement | null>(null)

const getFallbackImg = (seed?: string | null) => {
  const backgroundColors = 'backgroundColor=f1f4dc,f88c49'
  const shapeColors = 'shapeColor=1c799f,f1f4dc,f88c49&'
  const fallbackImgSrc = `https://api.dicebear.com/8.x/thumbs/svg?${backgroundColors}&${shapeColors}&seed=`

  return fallbackImgSrc + seed
}

const closeFromAnywhere = (e: MouseEvent) => {
  if (!profile.value?.contains?.(e.target as Element)) {
    open.value = false
  }
}

watch(profile, () => {
  if (profile.value) {
    document.addEventListener('click', closeFromAnywhere)
  } else {
    document.removeEventListener('click', closeFromAnywhere)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeFromAnywhere)
})
</script>

<template>
  <div class="container">
    <button class="open-btn" @click.stop="open = !open" :class="btnClass">
      <img :src="user?.photoURL || getFallbackImg(user?.email)" />
    </button>

    <Transition name="popup">
      <div
        v-if="open"
        :ref="(el) => (profile = el as HTMLDivElement)"
        :class="{ [position as Position]: position }"
        class="profile"
      >
        <button v-if="currentUser" class="edit-btn">
          <span class="overlay"><IconEdit class="" /></span>
          <img :src="user?.photoURL || getFallbackImg(user?.email)" />
        </button>
        <img v-else :src="user?.photoURL || getFallbackImg(user?.email)" />
        <div class="info">
          <span class="name">{{ user?.displayName }}</span>
          <span class="email">{{ user?.email }}</span>
          <LogoutButton />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  overflow: visible;
}

button {
  padding: 0;
  border: none;

  &:enabled {
    cursor: pointer;
  }
}

img {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.profile {
  --margin: var(--base-border-radius);

  z-index: var(--z-profile);
  position: absolute;
  padding: 0.8em;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  background-color: var(--color-background);
  border-radius: var(--base-border-radius);
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 0.8em;

  img {
    border-radius: inherit;
    width: 80px;
    height: 80px;
  }
}

.edit-btn {
  position: relative;
  border-radius: inherit;
  width: 80px;
  height: 80px;
  font-family: inherit;

  &:hover > .overlay {
    opacity: 1;
  }

  .overlay {
    color: var(--color-text-light);
    font-weight: 500;
    border-radius: inherit;
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: 400ms opacity;

    svg {
      height: 50%;
      width: 50%;
    }
  }
}

.info {
  display: grid;
  grid-template-rows: repeat(1fr);
  align-items: center;

  .name {
    font-weight: 500;
    color: var(--color-text-dark);
  }

  .email {
    color: var(--color-text-dark-mute);
  }
}

.profile.left {
  transform-origin: right;
  margin-right: var(--margin);
  top: 50%;
  translate: 0 -50%;
  right: 100%;
  margin-right: 1em;
}

.profile.right {
  transform-origin: left;
  margin-left: var(--margin);
  top: 50%;
  translate: 0 -50%;
  left: 100%;
}

.profile.top-left {
  transform-origin: bottom right;
  margin-bottom: var(--margin);
  bottom: 100%;
  right: 0;
}

.profile.top-right {
  transform-origin: bottom left;
  margin-bottom: var(--margin);
  bottom: 100%;
  left: 0;
}

.profile.bottom-left {
  transform-origin: top right;
  margin-top: var(--margin);
  top: 100%;
  left: 0;
}

.profile.bottom-right {
  transform-origin: top left;
  margin-top: var(--margin);
  top: 100%;
  left: 0;
}

.popup-enter-active,
.popup-leave-active {
  transition:
    200ms opacity,
    200ms scale;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  scale: 0.8;
}
</style>
