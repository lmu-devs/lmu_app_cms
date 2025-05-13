<template>
  <div class="grid">
    <div class="grid-element full">
      <p class="type-label">{{ t('select_field') }}</p>
      <v-select
        v-model="selectedField"
        :items="fieldOptions"
        :placeholder="t('select_field')"
        @update:model-value="updateOptions"
      />
    </div>
    <div v-if="debug" class="grid-element full">
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStores } from '@directus/extensions-sdk';

export default {
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    collection: {
      type: String,
      required: true,
    },
  },
  emits: ['input'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { useFieldsStore } = useStores();
    const fieldsStore = useFieldsStore();
    const selectedField = ref(props.value?.field || '');
    const debug = ref(true); // Set to false in production

    console.log('Options component mounted with value:', props.value);
    console.log('Collection from props:', props.collection);

    const fieldOptions = computed(() => {
      if (!props.collection) {
        console.warn('No collection provided to options component');
        return [];
      }

      const fields = fieldsStore.getFieldsForCollection(props.collection);
      console.log('Fields for collection:', fields);

      return fields
        .filter(field => field.type === 'string' || field.type === 'text')
        .map(field => ({
          text: field.name || field.field,
          value: field.field,
        }));
    });

    const debugInfo = computed(() => ({
      collection: props.collection,
      selectedField: selectedField.value,
      availableFields: fieldOptions.value,
      currentValue: props.value,
    }));

    onMounted(async () => {
      console.log('Options component mounted');
      try {
        await fieldsStore.hydrate();
        console.log('Fields store hydrated');
      } catch (error) {
        console.error('Error hydrating fields store:', error);
      }
    });

    function updateOptions(value) {
      console.log('Updating options with value:', value);
      emit('input', {
        ...props.value,
        field: value,
      });
    }

    return {
      t,
      selectedField,
      fieldOptions,
      updateOptions,
      debug,
      debugInfo,
    };
  },
};
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
}

.grid-element.full {
  grid-column: 1 / -1;
}

.type-label {
  color: var(--theme--foreground-subdued);
  font-size: 0.875rem;
  margin-bottom: 8px;
}

pre {
  background: var(--theme--background-subdued);
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow: auto;
}
</style> 