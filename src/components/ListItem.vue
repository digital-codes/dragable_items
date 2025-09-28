<!-- src/components/ListItem.vue -->
<template>
  <div :class="['listItem', { fixed }]">
    <!-- static class for the drag‑handle (cursor handled in global CSS) -->
    <span v-if="!fixed" class="drag-handle">☰</span>

    <textarea
      :value="modelValue"
      @input="onInput"
      :readonly="fixed"
      placeholder="Enter text…"
      class="itemInput"
    />

    <button class="deleteBtn" @click="$emit('delete')">✕</button>
  </div>
</template>

<script lang="ts" setup>

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
</style>
