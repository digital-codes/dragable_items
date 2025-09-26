<!-- src/components/EditField.vue -->
<template>
  <div :class="styles.cardContainer">
    <!-- Header -->
    <div :class="styles.cardHeader">
      <h3>{{ title }}</h3>
    </div>

    <!-- Textarea – full‑width, non‑resizable, vertical scroll -->
    <textarea
      v-model="content"
      :class="styles.editTextarea"
      :placeholder="placeHolder"
      :disabled="disabled"
    ></textarea>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import styles from '@/styles/style.module.scss'

import { watch, computed } from 'vue';

const props = withDefaults(defineProps<{
    title?: string;
    content?: string;
    disabled?: boolean;
}>(), {
    title: 'No title',
    content: '',
    disabled: false,
});

const placeHolder = computed(() => props.content == "" ? 'Write something…' : props.content);

const emit = defineEmits<{
    (e: 'update:content', value: string): void;
}>();

/* Internal state – expose it so a parent can read/write if needed */
const content = ref<string>('');
defineExpose({ content });

// Expose a reactive disabled flag the template can use
const disabled = computed(() => !!props.disabled);

// Keep internal content in sync with the incoming prop
watch(
    () => props.content,
    (val) => {
        if (val !== undefined && val !== content.value) content.value = val;
    },
    { immediate: true }
);


// Emit updates when the internal content changes
watch(content, (val) => {
    console.log("EditField content changed:", val);
    emit('update:content', val);
});

</script>
