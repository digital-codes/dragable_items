<!-- src/components/ListItem.vue -->
<template>
  <div :class="[styles.listItem, { [styles.fixed]: fixed }]">
    <!-- static class for the drag‑handle (cursor handled in global CSS) -->
    <span v-if="!fixed" class="drag-handle">☰</span>

    <input
      :value="modelValue"
      @input="onInput"
      :readonly="fixed"
      placeholder="Enter text…"
      :class="styles.itemInput"
    />

    <button :class="styles.deleteBtn" @click="$emit('delete')">✕</button>
  </div>
</template>

<script lang="ts" setup>
import styles from '@/styles/style.module.scss'

// ----- Props ----------------------------------------------------
interface Props {
  modelValue: string;
  fixed?: boolean;
}
defineProps<Props>();

// ----- Emits ----------------------------------------------------
const emit = defineEmits<{
  (e: 'update:modelValue', payload: string): void;
  (e: 'delete'): void;
}>();

// ----- Handlers -------------------------------------------------
function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}
</script>

<!-- Non‑module CSS for the drag‑handle cursor -->
<style>
.drag-handle {
  cursor: grab;
  margin-right: 0.5rem;
  user-select: none;
}
.drag-handle:active {
  cursor: grabbing;
}
</style>
