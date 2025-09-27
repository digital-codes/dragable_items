
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

const topics = ref<string[]>([]);
let initialized = false;

/**
 * Initializes the list of available topics if not already initialized.
 * This function is used internally and should not be called directly.
 */
function initializeTopics() {
    topics.value = [
        "klimawandel",
        "nachhaltigkeit",
        "erneuerbare energien",
        "umweltschutz",
        "co2-fußabdruck",
        "energieeffizienz",
        "baum",
        "bäume",
        "platane",
        "fällen",
        "ersetzen",
        "pflanzen",
        "wetter",
        "stadt",
        "stadtplanung",
        "verkehr",
        "auto",
        "umwelt",
        "ökologie",
        "geht",
        "heißt",
        "heisst",
        "regen",
        "sonne",
        "wind",
        "warm",
        "kalt",
        "strasse",
        "straße",
        "straßen",
        "kaiserstraße",
        "umbau",
        "umgestaltung",
        "renovierung",
    ];
    fuse.value = new Fuse(topics.value, fuseOpts);
    initialized = true;
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
            if (topics.value.includes(word) && !categoryList.includes(word)) {
                categoryList.push(word);
            }
        })
        return categoryList
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
    return topics.value;
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