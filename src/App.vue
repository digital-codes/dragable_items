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
        <button class="button loginBtn" @click="openLogin">
          <span v-if="loggedIn" class="tick">✔</span>
          Login
        </button>
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
        <EditField class="editfield" title="Query" v-model:fieldContent="query" :disabled="false" ref="queryFieldRef"
          button="Search" @button-click="ctxSearch" />
        <EditField class="editfield" title="Context" v-model:fieldContent="context" :disabled="true" button="Clear"
          @button-click="ctxClear" />
        <EditField class="editfield" title="Response" v-model:fieldContent="response" :disabled="true" />
      </div>
    </div>
  </div>

  <!-- Login popup -->
  <LoginPopup v-if="showLogin" @success="handleLoginSuccess" @close="showLogin = false" />

</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { watch } from "vue";
import CardList from "./components/CardList.vue";
import EditField from "./components/EditField.vue";
import LoginPopup from "./components/LoginPop.vue"

//import { useSearchTopics, getAllTopics } from './composables/SearchTopics';
import { useSearchTopics } from './composables/SearchTopics';
const { search } = useSearchTopics()
import { getTopicClass } from './composables/SearchTopics';

import { contextMatch } from './services/ContextMatch';


const showLogin = ref(false)
const loggedIn = ref(false)

const cardListRef = ref<InstanceType<typeof CardList> | null>(null);

const query = ref("")
const context = ref("No contex ...");

const fullContext = ref<Array<{ id: number; key: string; value: string }>>([]);

const response = ref(".. waiting for submission ..");

const loading = ref(false);
const statusText = ref("Idle");
const theme = ref("light");


// query is bound to modelValue of EditField
watch(query, (newVal, oldVal) => {
  console.log("query changed:", { newVal, oldVal });
  console.log("QueryField content:", query.value);
});

const openLogin = () => {
  loggedIn.value = false
  localStorage.removeItem("auth-token")
  showLogin.value = true
}


function handleLoginSuccess(token: string) {
  localStorage.setItem("auth-token", token)
  loggedIn.value = true
  showLogin.value = false
}



const submit = () => {
  response.value = ".. waiting for response .."
  console.log("Submitting data:");
  const q = query.value.trim();
  console.log("Query:", q);
  const p = cardListRef.value?.getCombinedText().trim() ?? "";
  console.log("Prompt:", p);
  if (p.length === 0) {
    statusText.value = "Prompt is empty";
    response.value = "Please add some prompt text before submitting.";
    return;
  }
  const cd = cardListRef.value?.getConditions()?.trim() ?? null;
  console.log("Conditions:", cd);
  if (cd && cd.length > 0) {
    context.value += "\n" + cd;
    console.log("Including conditions in prompt.");
  }
  console.log("Context:", context.value);
  loading.value = true;
  statusText.value = "Loading...";
  if (!loggedIn.value) {
    loading.value = false;
    statusText.value = "Not logged in";
    response.value = "Please log in to submit your query.";
    return;
  }
  (async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const payload = {
        query: q,
        prompt: p,
        context: context.value
      };
      statusText.value = "Sending request…";
      const res = await fetch("/php/llamaChat.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Request failed (${res.status}): ${errText}`);
      }

      // try parse JSON, fall back to text
      let body: any;
      try {
        body = await res.json();
      } catch {
        body = await res.text();
      }

      loading.value = false;
      statusText.value = "Done";
      if (body && typeof body === "object" && "text" in body) {
        response.value = String(body.text);
      } else {
        response.value = String(body ?? "No response body");
      }
      console.log("Submit success:", body);
    } catch (err: any) {
      console.error("Submit error:", err);
      loading.value = false;
      statusText.value = "Error";
      response.value = err?.message ?? String(err);
    }
  })();
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
    if (results.length === 0) {
      context.value = "";
      loading.value = false;
      statusText.value = "Nichts gefunden";
      response.value = ".. waiting for submission ..";
      return;
    }
    const classes = Array.from(new Set(results.map(r => getTopicClass(r)).filter(Boolean)));
    console.log("Result classes:", classes);    
    const matchedContext = contextMatch(classes, fullContext.value);
    console.log("Matched context:", matchedContext);
    if (matchedContext) {
      context.value = matchedContext;
      statusText.value = "Done";
    } else {
      context.value = "";
      statusText.value = "Nichts gefunden";
    }
    loading.value = false;
    response.value = ".. waiting for submission ..";
    /*
    setTimeout(() => {
      loading.value = false;
      statusText.value = "Done";
      context.value = results.length > 0 ? "Results: " + results.join(", ") : "No results found.";
    }, 2000);
    */
  }
};

const ctxClear = () => {
  console.log("Clear button clicked.");
  if (context.value) {
    context.value = "No context ...";
    response.value = ".. waiting for submission ..";
  }
};

onMounted(() => {
  // Check saved preference
  const saved = localStorage.getItem("app-theme");
  if (saved === "light" || saved === "dark") {
    theme.value = saved;
  } else {
    // Use system preference if no saved theme
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    theme.value = prefersDark ? "dark" : "light";
  }

  applyTheme();

  (async () => {
    try {
      const res = await fetch('/data/context.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to load context.json (${res.status})`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
        fullContext.value = data
        console.log('Loaded context from /data/context.json') //, data);
        const uniqueKeys = Array.from(
          new Set(fullContext.value.flatMap(obj => Object.keys(obj)))
        );
        console.log("Unique keys in /data/context.json:", uniqueKeys);
      } else {
        console.warn('Invalid format in /data/context.json');
      }
    } catch (err) {
      console.warn('Could not load /data/context.json:', err);
    }
  })();

});

function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
  localStorage.setItem("app-theme", theme.value);
  applyTheme();
}

function applyTheme() {
  const appContainer = document.querySelector(".app-container");
  if (appContainer) {
    appContainer.classList.remove("light", "dark");
    appContainer.classList.add(theme.value);
  }
}
</script>

<style scoped></style>
