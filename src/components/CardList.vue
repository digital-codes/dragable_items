<!-- src/components/CardList.vue -->
<template>
  <div :class="['cardContainer', 'listCard']" >
    <!-- ===== Header ===== -->
    <div class="cardHeader">
      <h3>{{ title }}</h3>

      <select v-if="itemPresets" v-model="selectedTemplate" @change="addFromTemplate">
        <option disabled value="">Auswahl</option>
        <option v-for="key in Object.keys(itemPresets)" :key="key" :value="key">{{ key }}</option>
      </select>

    <button class="editBtn tooltip" @click="addEmptyItem">
      <font-awesome-icon :icon="['fas', 'plus']" class="addPrompt"/>
      <span class="tooltiptext">Neue Promptzeile</span>
    </button>

      <select v-model="selectedCondition" @change="addCondition" :disabled="!!condition">
        <option value="">Wetter</option>
        <option v-for="key in Object.keys(conditionPresets)" :key="key" :value="key">
          {{ key }}
        </option>
      </select>

    </div>

    <!-- ===== Draggable list ===== -->
     <div class="carditemContainer">
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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
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

// actual values loaded in onmounted
const itemPresets = ref<Record<string, string[]> | null>(null);

const conditionPresets: Record<string, string> = {
  'Normal':"Das Wetter ist völlig normal für die Jahreszeit",
  'Nass und kalt':"Es ist zu kalt und zu nass für die Jahreszeit",
  'Heiß und trocken':"Es ist zu heiß und trocken für die Jahreszeit",
  'Heiß und feucht':"Es ist heiß und feucht. Das ist nicht normal."
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
  if (!presetKey || !itemPresets.value?.[presetKey]) return

  // Add each string as a new item
      // ensure the presets have been loaded
      const ip = itemPresets.value
      if (!ip) return
      const preset = ip[presetKey]
      if (!preset) return
  
      preset.forEach(str => {
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

onMounted(async () => {
  try {
    const response = await fetch('data/prompts.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const prompts = await response.json();
    // Convert each prompt (a string) into an array of non-empty trimmed lines
    itemPresets.value = Object.fromEntries(
      Object.entries(prompts || {}).map(([key, val]) => [
      key,
      (typeof val === 'string' ? val : String(val))
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
      ])
    );
    console.log("Loaded item presets:", itemPresets.value);
  } catch (error) {
    console.error("Failed to load item presets:", error);
    itemPresets.value = {}; // fallback to empty
  }
});


/* Expose the getter for a possible parent component */
defineExpose({ 
  getCombinedText,  
  getConditions: () => condition.value ? condition.value.text : null 
});
</script>