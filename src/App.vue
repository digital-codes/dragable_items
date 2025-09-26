<!-- src/App.vue (or any parent view) -->
<template>
  <div class="wrapper">
    <!-- CardList on the left -->
    <div style="flex:0 1 400px;">
      <CardList ref="cardListRef" title="Prompt" />
      <button @click="submit">Submit</button>
    </div>

    <!-- EditField on the right (or below – CSS decides) -->

    <EditField title="Query" v-model:content="query" :disabled="false" ref="queryFieldRef" button="Search" @button-click="ctxSearch"/>
    <EditField title="Context" v-model:content="context" :disabled="true" button="Clear" @button-click="ctxClear"/>
    <EditField title="Response" v-model:content="response" :disabled="true" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { watch } from "vue";
import CardList from "./components/CardList.vue";
import EditField from "./components/EditField.vue";

const cardListRef = ref<InstanceType<typeof CardList> | null>(null);

const query = ref("")
const context = ref("No contex ...");

const response = ref(".. waiting for submission ..");

// queryfield is provided via expose from EditField.vue
/* alternative ...
watch(
  () => queryFieldRef.value?.content,
  (newVal, oldVal) => {
    console.log('QueryField content changed from', oldVal, '→', newVal);
  }
);
*/ 

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
  // Simulate a response
  setTimeout(() => {
    response.value = "This is a simulated response based on the query and card list.";
  }, 2000);
};

const ctxSearch = () => {
  console.log("Search button clicked. Current query:", query.value);
  // Example action: prepend "Searching for: " to the query field content
  if (query.value !== "") {
    context.value = "Searching for: " + (query.value || "");
    response.value = ".. waiting for submission ..";
    setTimeout(() => {
      context.value = "This is a simulated context response based on the query and card list.";
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


</script>

<style scoped>
.wrapper {
  /* Example layout – flex makes them sit side‑by‑side */
  display: flex;
  flex-direction: row;
  /* change to column if you want stacking */
  gap: 1rem;
  /* space between the two cards */
  justify-content: center;
  /* centre them horizontally */
}
</style>
