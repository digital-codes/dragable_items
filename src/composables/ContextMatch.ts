import { ref } from 'vue'

/**
 * useContextMatch
 * Vue 3 composable (works with plain arrays or refs)
 *
 * Inputs:
 *  - features: array of feature strings (or a ref to such an array)
 *  - context: array of objects like { key: 'k', value: 'v' } (or a ref)
 *
 * Returns:
 *  - matchString (ref): human-readable dummy match result string (call computeMatch() to refresh)
 *  - computeMatch(): function to recompute and return the string immediately
 *
 * Dummy matching logic:
 *  - a feature is considered matched if it equals a context key, or if it appears
 *    in the stringified context value, or if "key:value" contains the feature.
 */
export function useContextMatch(
    features?: string[] | any,
    context?: Array<{ key?: string; value?: unknown }> | any
) {
    // keep refs if caller passed refs; otherwise create internal refs with the provided (or empty) arrays
    const _features = (features && (features as any).__v_isRef)
        ? features
        : ref(features ?? []) 

    const _context = (context && (context as any).__v_isRef)
        ? context
        : ref(context ?? [])

    function isMatch(feature: unknown, ctxItem: { key?: string; value?: unknown } | undefined): boolean {
        if (!feature) return false
        const f = String(feature).toLowerCase()
        const key = String(ctxItem?.key ?? '').toLowerCase()
        const value = String(ctxItem?.value ?? '').toLowerCase()
        if (f === key) return true
        if (value.includes(f)) return true
        if (`${key}:${value}`.includes(f)) return true
        return false
    }

    function computeMatchString(): string {
        const feats = Array.isArray((_features as any).value) ? (_features as any).value : []
        const ctx = Array.isArray((_context as any).value) ? (_context as any).value : []

        if (feats.length === 0) return 'No features provided'
        if (ctx.length === 0) return 'No context provided'

        const matched: string[] = []
        for (const feature of feats) {
            const found = ctx.some((c: any) => isMatch(feature, c))
            if (found) matched.push(String(feature))
        }

        if (matched.length === 0) return `0/${feats.length} features matched`
        return `${matched.length}/${feats.length} features matched: ${matched.join(', ')}`
    }

    const matchString = ref<string>(computeMatchString())

    function computeMatch() {
        const s = computeMatchString()
        matchString.value = s
        return s
    }

    return {
        matchString,
        computeMatch
    }
}


/* Usage example (component) - comment only

<script setup lang="ts">
import { useContextMatch } from '@/composables/ContextMatch' // adjust path as needed

// reactive inputs
const features = ref(['alpha', 'beta', 'gamma'])
const context = ref([
    { key: 'alpha', value: '1' },
    { key: 'other', value: 'contains beta' },
])

// obtain composable outputs
const { matchString, computeMatch } = useContextMatch(features, context)

// keep matchString up to date when inputs change
watch([features, context], () => computeMatch(), { deep: true })

// call computeMatch() manually after async updates if needed
// e.g. await fetch(...) then computeMatch()
</script>

<template>
    <!-- display the human-readable match result -->
    <div>{{ matchString }}</div>
</template>

*/
