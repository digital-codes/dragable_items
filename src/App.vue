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
        <button @click="submit" class="button">Absenden</button>
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
        <EditField class="editfield" title="Frage" v-model:fieldContent="query" :disabled="false" ref="queryFieldRef"
          button="Suche" @button-click="ctxSearch" :comments="queryComments"/>
        <EditField class="editfield" title="Kontext" v-model:fieldContent="context" :disabled="false" button="Löschen"
          @button-click="ctxClear" />
        <EditField class="editfield" title="Antwort" v-model:fieldContent="response" :disabled="true" />
      </div>
    </div>
  </div>

  <!-- Login popup -->
  <LoginPopup v-if="showLogin" @success="handleLoginSuccess" @close="showLogin = false" />

</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { watch } from "vue";
import CardList from "./components/CardList.vue";
import EditField from "./components/EditField.vue";
import LoginPopup from "./components/LoginPop.vue"

//import { useSearchTopics, getAllTopics } from './composables/SearchTopics';
import { useSearchTopics } from './composables/SearchTopics';
const { search } = useSearchTopics()
import { getTopicClass } from './composables/SearchTopics';

import { contextMatch } from './services/ContextMatch';
import { RefSymbol } from "@vue/reactivity";


const showLogin = ref(false)
const loggedIn = ref(false)

const cardListRef = ref<InstanceType<typeof CardList> | null>(null);

const query = ref("")
const queryComments = ref<string | null>(null)
const context = ref("Nichts ...");

const classifier = ref<string | null>(null);

const fullContext = ref<Array<Record<string, string>>>([]);

const response = ref(".. warte auf Absenden ..");

const loading = ref(false);
const statusText = ref("Gelangweilt");
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

const llmCall = async (p: string, ctx: string, cnd: string, q: string) => {
  // Placeholder for LLM call logic
  console.log("LLM call initiated");
    try {
      const token = localStorage.getItem("auth-token");
      const payload: { query: string; prompt: string; context?: string } = {
        query: q,
        prompt: p
      };
      if (ctx) {
        payload.context = (cnd && cnd.length > 0) ? ctx + "\n" + cnd : ctx
      }
      statusText.value = "Sende Anfrage …";
      const res = await fetch("php/llamaChat.php", {
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
      statusText.value = "Fertig";

      if (!body || !body.text) {
        return null
      } else {
        console.log("Submit success:", body);
        return String(body.text);
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      loading.value = false;
      statusText.value = "Error";
      return null
    }
};


const submit = async() => {
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
  let cd = cardListRef.value?.getConditions()?.trim() ?? null;
  console.log("Conditions:", cd);
  if (cd) {
    console.log("Using conditions:", cd);
    const weather = await getWeather();
    if (weather) {
      console.log("Appending weather to context:", weather);
      cd = weather + "\n" + cd;
    }
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
  let results: string[] = [];
  // for llm, build the call params
  const r = await llmCall(p , context.value?context.value:"", cd?cd:"", q);
  loading.value = false;
  if (typeof r === "string") {
    statusText.value = "Fertig";
    response.value = r.trim()
    console.log("LLM chat results:", results);
  } else {
    response.value = ""
    statusText.value = "Kein Ergebnis";
    console.log("LLM chat returned non-string:", r);
  }

};

const ctxSearch = async () => {
  console.log("Search button clicked. Current query:", query.value);
  // Example action: prepend "Searching for: " to the query field content
  if (query.value !== "") {
    queryComments.value = "Suche nach: " + (query.value || "");
    loading.value = true;
    statusText.value = "Suche ...";
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 1000)); // slight delay to show spinner

    let classes: string[] = [];
    // for llm, build the call params
    if (classifier?.value) {
      const r = await llmCall(classifier?.value , "", "", query.value);
      if (typeof r === "string") {
        classes = r.split(",").map(s => s.trim()).filter(s => s.length > 0);
        console.log("LLM classification results:", classes);
      } else {
        console.log("LLM classification returned non-string:", r);
      }
    }
    if (classes.length === 0 || (classes.length === 1 && classes[0] === "unrelated")) {
      context.value = "";
      loading.value = false;
      statusText.value = "Nichts gefunden";
      queryComments.value = null
      response.value = ".. waiting for submission ..";
      return;
    }
    console.log("Result classes:", classes);
    queryComments.value = `Gefundene Themen: ${classes.join(", ")}`;

    // Keep only context items whose key matches one of the found classes
    const matchedContext = fullContext.value.flatMap(item => {
      // item expected like { "category1": "value" } (possibly multiple keys)
      console.log("Checking item:", item);
      return Object.entries(item)
        .filter(([k]) => classes.includes(k))
        .map(([k, v]) => `${v}\n`);
    });
    //console.log("Matched context:", matchedContext);
    if (matchedContext.length > 0) {
      context.value = matchedContext.join("\n");
      statusText.value = "Fertig";
    } else {
      context.value = "";
      statusText.value = "Nichts gefunden";
    }
    loading.value = false;
    response.value = ".. warte auf Absenden ..";
  }
};

const ctxClear = () => {
  console.log("Clear button clicked.");
  if (context.value) {
    context.value = "";
    response.value = ".. warte auf Absenden ..";
  }
};

const getWeather = async () => {
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=49.0069&longitude=8.4037&current=temperature_2m,rain');
      if (!res.ok) throw new Error(`Failed to load weather.php (${res.status})`);
      const data = await res.json();
      if (!data) {
        console.warn('No weather data');
      } else {
        const curr = data.current ?? data.current_weather;
        if (!curr) {
          console.warn('Weather payload missing current/current_weather');
        } else {
          // numeric values
          const temperature = Number(curr.temperature_2m ?? curr.temperature ?? NaN);
          const rainVal = Number(curr.rain ?? 0);

          // normalize time string: if it has no timezone/offset and the payload is GMT/utc, treat as UTC
          let timeIso = String(curr.time ?? '');
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(timeIso)) {
            const tzStr = String(data.timezone ?? '').toUpperCase();
            if (tzStr.includes('GMT') || data.utc_offset_seconds === 0 || data.timezone_abbreviation === 'GMT') {
              timeIso += 'Z';
            }
          }
          const dateUtc = new Date(timeIso);

          // format for Karlsruhe (Europe/Berlin) with DST automatically handled by Intl
          const targetZone = 'Europe/Berlin';
          const fmt = new Intl.DateTimeFormat('de-DE', {
            timeZone: targetZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          const localTime = fmt.format(dateUtc);

          const weekday = new Intl.DateTimeFormat('de-DE', { timeZone: targetZone, weekday: 'long' }).format(dateUtc);
          const localTimeWithWeekday = `${weekday}, ${localTime}`;

          const weather = `Heute ist ${localTimeWithWeekday}, Temperatur beträgt ${temperature.toFixed(1)}°C, ${rainVal ? `${rainVal} ${data.current_units?.rain ?? 'mm'}` : 'Kein Regen'}`;
          return weather;
        }
      }

    } catch (err) {
      console.warn('Could not load weather.php:', err);
    }
    return undefined;
  }

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
  // load context.json
  (async () => {
    try {
      const res = await fetch('data/context.json', { cache: 'no-cache' });
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
  // load classifier promt
  (async () => {
    try {
      const res = await fetch('data/classifier_prompt.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to load classifier_prompt.json (${res.status})`);
      const data = await res.json();
      if (typeof(data) === 'object') {
        classifier.value = data.prompt; 
        console.log('Loaded classifier from /data/classifier_prompt.json' ) //, classifier.value);
      } else {
        console.warn('Invalid format in /data/classifier_prompt.json');
      }
    } catch (err) {
      console.warn('Could not load /data/classifier_prompt.json:', err);
    }
  })();

  // Test weather fetch
  getWeather().then(weather => {
    console.log(weather);
  });

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
