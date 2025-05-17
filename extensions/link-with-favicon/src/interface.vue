<template>
  <div class="simple-interface-display">
    <v-notice v-if="!hasSelectedField" type="info" icon="info">
      Please configure the related field in the interface options.
    </v-notice>
    <div v-if="selectedFieldNameDisplay">
      <p><strong>Selected Related Field:</strong> {{ selectedFieldNameDisplay }}</p>
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
import { computed, onMounted, watch } from "vue";

const props = defineProps<{
  value: string | Record<string, any> | null;
  options?: Record<string, any> | null; // For any other general options
  collection?: string;
  selectedFieldName?: string; // Primary way to get the selected field name
}>();

console.log('[interface.vue] Instance created. Initial selectedFieldName:', props.selectedFieldName);

onMounted(() => {
  console.log('[interface.vue] Component mounted.');
  console.log('[interface.vue] Collection context:', props.collection);
  console.log('[interface.vue] Initial value:', props.value);
  console.log('[interface.vue] Received selectedFieldName:', props.selectedFieldName);
  console.log('[interface.vue] General options object:', props.options);
});

watch(() => props.selectedFieldName, (newFieldName, oldFieldName) => {
  console.log(`[interface.vue] selectedFieldName changed from "${oldFieldName}" to "${newFieldName}"`);
});

const hasSelectedField = computed(() => {
  const hasField = !!props.selectedFieldName;
  console.log('[interface.vue] Computed hasSelectedField:', hasField);
  return hasField;
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
    const extractedName = extractActualFieldName(props.selectedFieldName);
    console.log('[interface.vue] Computed selectedFieldNameDisplay:', extractedName);
    return extractedName;
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

strong {
  color: var(--theme--text);
}
</style>
