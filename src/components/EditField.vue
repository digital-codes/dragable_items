<!-- src/components/EditField.vue -->
<template>
  <div class="cardContainer">
    <!-- Header -->
    <div class="cardHeader">
      <h3>{{ title }}</h3>
      <button v-if="button" @click="$emit('button-click')">{{ button }}</button>
    </div>

    <!-- Textarea – full‑width, non‑resizable, vertical scroll -->
    <textarea
      v-model="content"
      class="editTextarea"
      :placeholder="placeHolder"
      :disabled="disabled"
    ></textarea>

    <!-- Named slot "comments" — render only if provided and non-empty -->
    <div v-if="comments" class="editComments">
        <p>{{ comments }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { watch, computed } from 'vue';

const props = withDefaults(defineProps<{
    title?: string;
    disabled?: boolean;
    button?: string;
    comments?: string | null;
}>(), {
    title: 'No title',
    disabled: false,
    button: '',
    comments: null
});
const placeHolder = computed(() => fieldContent.value == "" ? (disabled? '':'Write something…') : fieldContent.value);

defineEmits<{
  (e: 'button-click'): void,  // no payload, just the event
}>();

/* Internal state – expose it so a parent can read/write if needed */
const content = ref<string>('');

const fieldContent = defineModel("fieldContent", {
  type: String,
  default: ''
});

// Expose a reactive disabled flag the template can use
const disabled = computed(() => !!props.disabled);

// Keep internal content in sync with the incoming prop
watch(
    () => fieldContent.value,
    (val) => {
        if (val !== undefined && val !== content.value) content.value = val;
    },
    { immediate: true }
);


// Emit updates when the internal content changes
watch(content, (val) => {
    fieldContent.value = val;  // keep the prop in sync
}, { immediate: true });

</script>
