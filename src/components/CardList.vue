<!-- src/components/CardList.vue -->
<template>
  <div :class="['cardContainer', 'listCard']" >
    <!-- ===== Header ===== -->
    <div class="cardHeader">
      <h3>{{ title }}</h3>

      <select v-model="selectedTemplate" @change="addFromTemplate">
        <option disabled value="">Add preset…</option>
        <option v-for="(t, i) in itemPresets" :key="i" :value="t">{{ t }}</option>
      </select>

      <button @click="addEmptyItem">✏️ Edit</button>

      <select v-model="selectedCondition" @change="addCondition" :disabled="condition">
        <option value="">Add condition…</option>
        <option v-for="(c, i) in conditionPresets" :key="i" :value="c">
          {{ c }}
        </option>
      </select>

    </div>

    <!-- ===== Draggable list ===== -->
    <draggable
      v-model="items"
      :group="{ name: 'items', pull: true, put: true }"
      handle=".drag-handle"
      item-key="id"
    >
      <template #item="{ element, index }">
        <ListItem
          v-model="element.text"
          @delete="removeItem(index)"
        />
      </template>
    </draggable>

    <!-- ===== Fixed condition (bottom) ===== -->
    <ListItem
      v-if="condition"
      :model-value="condition.text"
      fixed
      @delete="removeCondition"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import draggable from 'vuedraggable';
import ListItem from './ListItem.vue';

/* ---------- Types ---------- */
interface ListItemData {
  id: number;
  text: string;
}

withDefaults(defineProps<{
    title?: string;
}>(), {
    title: 'No title',
});


/* ---------- Reactive state ---------- */
let nextId = 1;
const items = ref<ListItemData[]>([]);
const condition = ref<ListItemData | null>(null);

/* ---------- Presets ---------- */
const itemPresets = ['First preset line', 'Second preset line', 'Third preset line'];
const conditionPresets = [
  'Condition A – always present',
  'Condition B – always present',
  'Condition C – always present'
];

/* ---------- UI bindings ---------- */
const selectedTemplate = ref<string>('');
const selectedCondition = ref<string>('');

/* ---------- Helper functions ---------- */
function addItem(text: string = ''): void {
  items.value.push({ id: nextId++, text });
}

function addFromTemplate(): void {
  if (!selectedTemplate.value) return;
  addItem(selectedTemplate.value);
  selectedTemplate.value = '';
}

function addEmptyItem(): void {
  addItem('');
}

function addCondition(): void {
  if (condition.value) return;               // only one allowed
  if (!selectedCondition.value) return;
  condition.value = { id: -1, text: selectedCondition.value };
  selectedCondition.value = '';
}

function removeCondition(): void {
  condition.value = null;
}

function removeItem(idx: number): void {
  items.value.splice(idx, 1);
}

/* ---------- Text aggregation ---------- */
function getCombinedText(): string {
  const parts = items.value.map(i => i.text);
  if (condition.value) parts.push(condition.value.text);
  return parts.join('\n');
}


/* Expose the getter for a possible parent component */
defineExpose({ getCombinedText });
</script>