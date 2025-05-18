<!--
  This Vue component serves as the custom interface for the 'Link with Favicon' Directus extension.
  Its primary responsibilities are:
  1. Receiving the name of a "related field" from the interface options (props.selectedFieldName).
  2. Accessing the complete data of the current item being edited in the Directus form (via inject('values')).
  3. Extracting the actual field name to use (handling potential template syntax like {{field_name}}).
  4. Displaying the name of this selected related field.
  5. Retrieving and displaying the content (value) of that related field from the current item's data.
-->
<template>
  <div class="simple-interface-display">
    <v-notice v-if="!hasSelectedField" type="info" icon="info">
      Please configure the related field in the interface options.
    </v-notice>

    <div v-if="selectedFieldNameDisplay">
      <p><strong>Selected Related Field:</strong> {{ selectedFieldNameDisplay }}</p>
      <div v-if="relatedFieldContent !== null && relatedFieldContent !== undefined">
        <p><strong>Content:</strong></p>
        <pre>{{ relatedFieldContent }}</pre>
      </div>
      <v-notice v-else-if="hasSelectedField" type="warning">
        Could not retrieve content for the field "{{ selectedFieldNameDisplay }}". It might be empty, not yet available, or the field doesn't exist in the item data.
      </v-notice>
    </div>

    <div v-else-if="props.selectedFieldName && !selectedFieldNameDisplay">
      <p><strong>Selected Related Field (raw):</strong> {{ props.selectedFieldName }}</p>
      <v-notice type="warning" icon="warning">
        The selected field name appears to be a template string that couldn't be processed or is empty. Check the field configuration.
      </v-notice>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, Ref } from "vue";

const props = defineProps<{
  /** The name of the current collection being edited. */
  collection?: string;
  /** 
   * The name of the related field (whose content we want to use to generate a favicon url).
   * This is configured in the interface options (index.ts) and passed as a prop.
   */
  selectedFieldName?: string;
}>();

/**
 * Injects the 'values' object from the parent Directus form context.
 * This object contains all the field values of the current item being edited.
 * It can be a Vue Ref or a plain object, so a computed property `currentItemValues` handles this.
 * 
 * @see https://github.com/directus/directus/discussions/16603
 */
const injectedValues = inject<Ref<Record<string, any> | null> | Record<string, any> | null>('values', null);

/**
 * A computed property that provides access to the current item's data from injected values.
 * This ensures reactivity if the item data changes.
 */
const currentItemValues = computed(() => {
  if (injectedValues && typeof (injectedValues as Ref).value !== 'undefined') {
    return (injectedValues as Ref<Record<string, any> | null>).value; // Access .value if it's a Ref
  }
  if (injectedValues && typeof injectedValues === 'object' && !('value' in injectedValues)) {
    return injectedValues as Record<string, any> | null; // Use directly if it's a plain object
  }
  return null;
});

/**
 * Computed property to check if a related field has been selected in the options.
 */
const hasSelectedField = computed(() => {
  return !!props.selectedFieldName;
});

/**
 * Helper function to extract the actual field name if `selectedFieldName` is provided
 * in a template syntax (e.g., "{{actual_field_name}}").
 * If no template syntax is found, it returns the input string as is.
 * @param {string} templateOrFieldName - The field name string, possibly with template syntax.
 * @returns {string} The extracted field name or the original string.
 */
function extractActualFieldName(templateOrFieldName: string): string {
  if (typeof templateOrFieldName !== 'string') {
    return '';
  }
  const match = templateOrFieldName.match(/\{\{(.*?)\}\}/);
  return match && match[1] ? match[1] : templateOrFieldName;
}

/**
 * Computed property that provides the processed name of the selected related field,
 * after extracting it from any potential template syntax.
 * This is what's displayed to the user as "Selected Related Field".
 */
const selectedFieldNameDisplay = computed(() => {
  if (props.selectedFieldName && typeof props.selectedFieldName === 'string') {
    return extractActualFieldName(props.selectedFieldName);
  }
  return null;
});

/**
 * Computed property that retrieves the content (value) of the `selectedFieldNameDisplay`
 * from the `currentItemValues` (the data of the item being edited).
 * This is the core logic for displaying the related field's content.
 */
const relatedFieldContent = computed(() => {
  const itemData = currentItemValues.value;
  if (itemData && selectedFieldNameDisplay.value) {
    const fieldKey = selectedFieldNameDisplay.value; // The actual key to look up in itemData
    if (Object.prototype.hasOwnProperty.call(itemData, fieldKey)) {
      const content = itemData[fieldKey];
      return content;
    }
    // Warn if the specified field key doesn't exist in the item's data
    console.warn(`[interface.vue] Field key "${fieldKey}" not found in itemData. Available keys:`, Object.keys(itemData));
    return null;
  }
  return null;
});

</script>

<style scoped>
/* Styles for the interface display wrapper */
.simple-interface-display {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  font-family: sans-serif;
}

/* Basic paragraph styling */
.simple-interface-display p {
  margin: 5px 0;
}

/* Styling for preformatted text, used to display the related field's content */
.simple-interface-display pre {
  white-space: pre-wrap;       /* CSS3 */
  white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
  white-space: -pre-wrap;      /* Opera 4-6 */
  white-space: -o-pre-wrap;    /* Opera 7 */
  word-wrap: break-word;       /* Internet Explorer 5.5+ */
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
}

/* Styling for strong text elements */
strong {
  color: var(--theme--text);
}
</style>
