<template>
  <div class="video-backdrop" @click="close">
    <div class="modal" @click.stop>
      <button class="close" @click="close" aria-label="Close">✕</button>
      <video
        ref="videoEl"
        class="video"
        :src="src"
        controls
        autoplay
        playsinline
      ></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  src: { type: String, required: true }
})

const emit = defineEmits<{
  (e: 'close'): void
}>()  

const videoEl = ref<HTMLVideoElement | null>(null)

function close() {
  // pause and reset video
  if (videoEl.value) {
    videoEl.value.pause()
    try { videoEl.value.currentTime = 0 } catch {}
  }
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}


onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.video-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
}

.video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: black;
  border-radius: 6px;
}

/* Close button */
.close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 1;
}
.close:hover {
  background: rgba(0,0,0,0.75);
}
</style>
