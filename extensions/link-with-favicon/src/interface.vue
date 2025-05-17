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
import { computed, onMounted, watch, inject, Ref } from "vue";

const props = defineProps<{
  value: string | Record<string, any> | null; // Value of the field this interface is for
  values?: Record<string, any> | null;      // All values of the current item in the form (prop fallback)
  options?: Record<string, any> | null;    // For any other general options
  collection?: string;
  selectedFieldName?: string;            // Name of the related field to get content from
}>();

const injectedValues = inject<Ref<Record<string, any> | null> | Record<string, any> | null>('values', null);

const currentItemValues = computed(() => {
  if (injectedValues && typeof (injectedValues as Ref).value !== 'undefined') {
    return (injectedValues as Ref<Record<string, any> | null>).value;
  }
  if (injectedValues && typeof injectedValues === 'object' && !('value' in injectedValues)){
    return injectedValues as Record<string, any> | null;
  }
  return props.values;
});

console.log('[interface.vue] Instance created. Initial selectedFieldName:', props.selectedFieldName);

onMounted(() => {
  console.log('[interface.vue] Component mounted. Collection:', props.collection);
  console.log('[interface.vue] Initial value (this fields value):', props.value);
  console.log('[interface.vue] Resolved item values at mount:', currentItemValues.value);
  console.log('[interface.vue] Received selectedFieldName from props:', props.selectedFieldName);
});

watch(() => props.selectedFieldName, (newFieldName, oldFieldName) => {
  console.log(`[interface.vue] selectedFieldName prop changed from "${oldFieldName}" to "${newFieldName}"`);
});

watch(currentItemValues, (newValues, oldValues) => {
  let logMessage = '[interface.vue] currentItemValues changed.';
  if (newValues && oldValues) {
    logMessage += ` Keys: ${Object.keys(newValues).join(', ')}`;
  } else if (newValues) {
    logMessage += ` Now has keys: ${Object.keys(newValues).join(', ')}`;
  } else {
    logMessage += ' Now null or undefined.';
  }
  // console.log(logMessage); // Commenting out due to persistent linter issues on this line
}, { deep: true });

const hasSelectedField = computed(() => {
  return !!props.selectedFieldName;
});

function extractActualFieldName(templateOrFieldName: string): string {
  if (typeof templateOrFieldName !== 'string') {
    return '';
  }
  const match = templateOrFieldName.match(/\{\{(.*?)\}\}/);
  return match && match[1] ? match[1] : templateOrFieldName;
}

const selectedFieldNameDisplay = computed(() => {
  if (props.selectedFieldName && typeof props.selectedFieldName === 'string') {
    return extractActualFieldName(props.selectedFieldName);
  }
  return null;
});

const relatedFieldContent = computed(() => {
  const itemData = currentItemValues.value;
  if (itemData && selectedFieldNameDisplay.value) {
    const fieldKey = selectedFieldNameDisplay.value;
    if (Object.prototype.hasOwnProperty.call(itemData, fieldKey)) {
      const content = itemData[fieldKey];
      // console.log(`[interface.vue] Content for field "${fieldKey}":`, content); // Can be verbose
      return content;
    }
    console.warn(`[interface.vue] Field key "${fieldKey}" not found in itemData. Available keys:`, Object.keys(itemData));
    return null;
  }
  return null;
});

</script>

<style scoped>
.simple-interface-display {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  font-family: sans-serif;
}

.simple-interface-display p {
  margin: 5px 0;
}

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

strong {
  color: var(--theme--text);
}
</style>
