<!-- src/App.vue (or any parent view) -->
<template>
  <div class="app-container" :class="theme">
    <!-- Header -->
    <header class="app-header">
      <h2 class="app-title">Frag die Platane</h2>
      <div class="left-controls">
        <div class="status">
          <span>Status: {{ statusText }}</span>
          <span v-if="loading" class="spinner"></span>
        </div>
      </div>

      <div class="right-controls">
        <button @click="submit" class="button">Submit</button>
        <button class="button" @click="toggleTheme">
          <font-awesome-icon :icon="['fas', theme === 'light' ? 'moon' : 'sun']" />
        </button>
      </div>
    </header>

    <!-- Main layout -->
    <div class="wrapper">
      <!-- CardList -->
      <div class="cardlist-container">
        <CardList ref="cardListRef" title="Prompt" />
      </div>

      <!-- EditFields -->
      <div class="editfields-container">
        <EditField class="editfield" title="Query" v-model:fieldContent="query" :disabled="false" ref="queryFieldRef" button="Search"
          @button-click="ctxSearch" />
        <EditField class="editfield" title="Context" v-model:fieldContent="context" :disabled="true" button="Clear"
          @button-click="ctxClear" />
        <EditField class="editfield" title="Response" v-model:fieldContent="response" :disabled="true" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { watch } from "vue";
import CardList from "./components/CardList.vue";
import EditField from "./components/EditField.vue";

//import { useSearchTopics, getAllTopics } from './composables/SearchTopics';
import { useSearchTopics } from './composables/SearchTopics';
const { search } = useSearchTopics()

const cardListRef = ref<InstanceType<typeof CardList> | null>(null);

const query = ref("")
const context = ref("No contex ...");

const response = ref(".. waiting for submission ..");

const loading = ref(false);
const statusText = ref("Idle");
const theme = ref("light");


// query is bound to modelValue of EditField
watch(query, (newVal, oldVal) => {
  console.log("query changed:", { newVal, oldVal });
  console.log("QueryField content:", query.value);
});

const submit = () => {
  response.value = ".. waiting for response .."
  console.log("Submitting data:");
  console.log("Query:", query.value);
  console.log("CardList items:", cardListRef.value?.getCombinedText());
  console.log("Context:", context.value);
  loading.value = true;
  statusText.value = "Loading...";
  // Simulate a response
  setTimeout(() => {
    loading.value = false;
    statusText.value = "Done";
    response.value = "This is a simulated response based on the query and card list.";
  }, 2000);
};

const ctxSearch = () => {
  console.log("Search button clicked. Current query:", query.value);
  // Example action: prepend "Searching for: " to the query field content
  if (query.value !== "") {
    context.value = "Searching for: " + (query.value || "");
    loading.value = true;
    statusText.value = "Searching...";
    const results = search(query.value);
    console.log("Search results:", results);
    response.value = ".. waiting for submission ..";
    setTimeout(() => {
      loading.value = false;
      statusText.value = "Done";
      context.value = results.length > 0 ? "Results: " + results.join(", ") : "No results found.";
    }, 2000);
  }
};

const ctxClear = () => {
  console.log("Clear button clicked.");
  if (context.value) {
    context.value = "No context ...";
    response.value = ".. waiting for submission ..";
  }
};

function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
  localStorage.setItem("app-theme", theme.value);
}

onMounted(() => {
  const saved = localStorage.getItem("app-theme");
  if (saved) {
    theme.value = saved;
  }
});

</script>

<style scoped>
</style>
