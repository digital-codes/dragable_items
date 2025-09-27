
// "biology", "politics", "activism", "climate", "nature", "condition"

const matchMatrix = [
    { "nature": { "nature": true } },
    { "climate": { "climate": true } },
    { "politics": { "politics": true } },
    { "activism": { "activism": true } },
    { "condition": { "condition": true } },
    { "politics": { "activism": true, "climate": true } },
    { "politics": { "politics": false, "climate": true, "nature": true, "condition": false } },
    { "activism": { "politics": true, "climate": true, "nature": true } },
]

export function getClasses(features: string[]): string[] {
    const featureSet = new Set(features);
    const classes = new Set<string>();

    for (const entry of matchMatrix) {
        const [className, conditions] = Object.entries(entry)[0];

        // check all conditions
        let isValid = true;
        for (const [feature, required] of Object.entries(conditions)) {
            if (required && !featureSet.has(feature)) {
                isValid = false;
                break;
            }
            if (!required && featureSet.has(feature)) {
                isValid = false;
                break;
            }
        }

        if (isValid) {
            classes.add(className);
        }
    }
    return [...classes];
}

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
export function contextMatch(
    features: string[] ,
    context: Array<{ key: string; value: string }> 
) : string | null {
    const classes = getClasses(features)
    
    if (classes.length === 0) {
        console.log("No classes matched.");
        return null;
    }
    let result = "" 
    classes.forEach(c => {
        context.forEach((ctx) => {
        const [key, value] = Object.entries(ctx)[0];
        if (key === c && value != null) {
            result += (result ? " " : "") + String(value) + "\n";
        }
        });
    });
    return result
}