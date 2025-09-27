
/**
 * Provides composable functions for searching and retrieving a list of programming topics.
 * 
 * @module SearchTopics
 */

// Node
import stopwords from 'stopwords-de'; // array of stopwords 
import { ref } from 'vue';
import Fuse, { IFuseOptions }  from 'fuse.js';
const fuseOpts: IFuseOptions<string> = {
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 3,
  threshold: 0.2,
};

const fuse = ref<Fuse<string> | null>(null);

const topics = ref<Record<string, string>>({});
let initialized = false;


/**
 * Initializes the list of available topics if not already initialized.
 * This function is used internally and should not be called directly.
 */
function initializeTopics() {
    topics.value = {
        "klimawandel": "climate",
        "nachhaltigkeit": "politics",
        "erneuerbare energien": "politics",
        "umweltschutz": "politics",
        "co2-fußabdruck": "climate",
        "energieeffizienz": "climate",
        "baum": "nature",
        "bäume": "nature",
        "platane": "nature",
        "fällen": "politics",
        "gefällt": "politics",
        "ersetzen": "politics",
        "pflanzen": "nature",
        "wetter": "climate",
        "stadt": "politics",
        "stadtplanung": "politics",
        "umwelt": "nature",
        "ökologie": "nature",
        "geht": "condition",
        "heißt": "condition",
        "heisst": "condition",
        "regen": "climate",
        "sonne": "climate",
        "wind": "climate",
        "warm": "climate",
        "kalt": "climate",
        "strasse": "politics",
        "straße": "x",
        "straßen": "x",
        "kaiserstraße": "x",
        "umbau": "politics",
        "umgestaltung": "politics",
        "renovierung": "politics",
        "protest": "activism",
        "demonstration": "activism",
        "aktion": "activism",
        "widerstand": "activism",
        "verhindern": "activism",
        "behindern": "activism",
        "verwaltung": "politics",
        "politik": "politics",
        "stadtverwaltung": "politics",
        "stadtpolitik": "politics",
        "gesundheit": "nature",
        "leben": "nature"
    };
    fuse.value = new Fuse(Object.keys(topics.value), fuseOpts);  initialized = true;
}

/**
 * Composable function that provides a search utility for topics.
 *
 * @returns An object containing the `search` function.
 *
 * @example
 * const { search } = useSearchTopics();
 * const results = search('vue');
 */
export function useSearchTopics() {
    function search(input: string): string[] {
        if (!initialized) {
            initializeTopics();
        }
        const query = input.trim().toLowerCase();
        if (!query) return [];

        const words = query.split(/[^\p{L}\p{N}]+/u).filter(word => word && !stopwords.includes(word));  if (words.length === 0) return [];
        //const words = query.split(/\s+/).filter(word => !stopwords.includes(word));
        if (words.length === 0) return [];
        //const cleanWords = words.map(word => word.replace(/^[.,;:!?]+|[.,;:!?]+$/g, ''));
        console.log("Searching topics for:", words);
        const categoryList: string[] = [];
        words.forEach(word => {
            const fs = fuse.value?.search(word);
            console.log(`Fuse search for "${word}":`, fs);
            if (fs && fs.length > 0) {
                fs.forEach(result => {
                    const r = result.item;
                    if (!categoryList.includes(r)) {
                        categoryList.push(r);
                    }
                })
            }
        })
        return categoryList.filter((item, idx, arr) => arr.indexOf(item) === idx);
    }

    return { search };
}

/**
 * Retrieves all available topics as an array of strings.
 * 
 * If the topics have not been initialized, this function will initialize them before returning the list.
 *
 * @returns {string[]} An array containing the names of all topics.
 */
export function getAllTopics(): string[] {
    if (!initialized) {
        initializeTopics();
    }
    return Object.keys(topics.value);
}

export function getTopicClass(topic: string): string {
    if (!initialized) {
        initializeTopics();
    }
    return topics.value[topic] || "";
}



/*
Example usage in a Vue component:

<script setup lang="ts">

const { search } = useSearchTopics()
const query = ref('')
const results = ref<string[]>([])

function onInput() {
    results.value = search(query.value)
}

// Optionally, get all topics:
const allTopics = getAllTopics()
</script>

<template>
    <input v-model="query" @input="onInput" placeholder="Search topics..." />
    <ul>
        <li v-for="topic in results" :key="topic">{{ topic }}</li>
    </ul>
</template>
*/