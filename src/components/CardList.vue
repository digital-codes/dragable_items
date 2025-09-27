<!-- src/components/CardList.vue -->
<template>
  <div :class="['cardContainer', 'listCard']" >
    <!-- ===== Header ===== -->
    <div class="cardHeader">
      <h3>{{ title }}</h3>

      <select v-model="selectedTemplate" @change="addFromTemplate">
        <option disabled value="">Voreinstellung…</option>
        <option v-for="key in Object.keys(itemPresets)" :key="key" :value="key">{{ key }}</option>
      </select>

    <button class="editBtn" @click="addEmptyItem">
      <span class="icon">✏️</span>
      Edit
    </button>

      <select v-model="selectedCondition" @change="addCondition" :disabled="!!condition">
        <option value="">Wetter</option>
        <option v-for="key in Object.keys(conditionPresets)" :key="key" :value="key">
          {{ key }}
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

const itemPresets: Record<string, string[]> = {
  "Aktivist": ["Hello", "Hi", "Hey there"],
  "Alchimist": ["Best regards", "Cheers", "Take care"],
  "Antichrist": ["How are you?", "What's up?"]
}

const conditionPresets: Record<string, string> = {
  'Normal':"20°C, leicht bewölkt",
  'Nass und kalt':"5°C, Regen",
  'Viel zu warm und trocken':"35°C, sonnig"
};

/* ---------- UI bindings ---------- */
const selectedTemplate = ref<string>('');
const selectedCondition = ref<string>('');

/* ---------- Helper functions ---------- */
function addItem(text: string = ''): void {
  items.value.push({ id: nextId++, text });
}


function addFromTemplate() {
  const presetKey = selectedTemplate.value
  if (!presetKey || !itemPresets[presetKey]) return

  // Add each string as a new item
  itemPresets[presetKey].forEach(str => {
    items.value.push({
      id: nextId++,
      text: str,
    })
  })

  // Reset selection
  selectedTemplate.value = ""
}

function addEmptyItem(): void {
  addItem('');
}

function addCondition(): void {
  if (condition.value) return;               // only one allowed
  if (!selectedCondition.value) return;
  condition.value = { id: -1, text: conditionPresets[selectedCondition.value] };
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
  //if (condition.value) parts.push(condition.value.text); // separate
  return parts.join('\n');
}


/* Expose the getter for a possible parent component */
defineExpose({ 
  getCombinedText,  
  getConditions: () => condition.value ? condition.value.text : null 
});
</script>