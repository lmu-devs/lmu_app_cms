<template>
  <v-notice v-if="!hasSelectedField" type="info" icon="info">
    Please configure the related field in the interface options.
  </v-notice>

  <div class="field-wrapper">
    <div class="info-text">
      <v-icon name="link" small />
      <span
        >Manage the favicon URL. You can generate it from the content of "{{
          selectedFieldNameDisplay || "the configured related field"
        }}" or provide a custom URL below.</span
      >
    </div>

    <div class="link-row">
      <v-card
        v-if="faviconDataUrl"
        class="favicon-preview"
        :class="{ loading: isLoading }"
      >
        <img
          :src="faviconDataUrl"
          alt="Favicon Preview"
          @error="handleImageError"
          class="favicon-image"
        />
      </v-card>
      <v-input
        :model-value="currentFaviconUrl"
        placeholder="Enter or generate favicon URL"
        @update:model-value="updateFaviconUrlManually"
        @blur="handleFaviconInputBlur"
      />
      <v-button
        @click="generateFavicon"
        :loading="isLoading"
        :disabled="!relatedFieldContent"
      >
        Generate Favicon
      </v-button>
    </div>

    <!-- Notices for errors, warnings, and info -->
    <v-notice v-if="error" type="danger" icon="error" @close="clearNotices">
      {{ error }}
    </v-notice>
    <v-notice
      v-if="warning"
      type="warning"
      icon="warning"
      @close="clearNotices"
    >
      {{ warning }}
    </v-notice>
    <v-notice v-if="info" type="info" icon="info" @close="clearNotices">
      {{ info }}
    </v-notice>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, Ref, ref, onMounted, watch, onUnmounted } from "vue";
import { FaviconService } from "./services/FaviconService"; // Assuming FaviconService.ts is in this path

const props = defineProps<{
  /** The value of this field (the favicon URL string) */
  value?: string | null;
  /** The name of the current collection being edited. */
  collection?: string;
  /**
   * The name of the related field (whose content we want to use to generate a favicon url).
   * This is configured in the interface options (index.ts) and passed as a prop.
   */
  selectedFieldName?: string;
}>();

const emit = defineEmits<{
  (e: "input", value: string | null): void; // Changed from 'update:modelValue'
}>();

/**
 * Injects the 'values' object from the parent Directus form context.
 * This object contains all the field values of the current item being edited.
 * It can be a Vue Ref or a plain object, so a computed property `currentItemValues` handles this.
 *
 * @see https://github.com/directus/directus/discussions/16603
 */
const injectedValues = inject<
  Ref<Record<string, any> | null> | Record<string, any> | null
>("values", null);

/**
 * A computed property that provides access to the current item's data from injected values.
 * This ensures reactivity if the item data changes.
 */
const currentItemValues = computed(() => {
  if (injectedValues && typeof (injectedValues as Ref).value !== "undefined") {
    return (injectedValues as Ref<Record<string, any> | null>).value;
  }
  if (
    injectedValues &&
    typeof injectedValues === "object" &&
    !("value" in injectedValues)
  ) {
    return injectedValues as Record<string, any> | null;
  }
  return null;
});

const hasSelectedField = computed(() => !!props.selectedFieldName);

/**
 * Helper function to extract the actual field name if `selectedFieldName` is provided
 * in a template syntax (e.g., "{{actual_field_name}}").
 * If no template syntax is found, it returns the input string as is.
 * @param {string} templateOrFieldName - The field name string, possibly with template syntax.
 * @returns {string} The extracted field name or the original string.
 */
function extractActualFieldName(templateOrFieldName: string): string {
  if (typeof templateOrFieldName !== "string") return "";
  const match = templateOrFieldName.match(/\{\{(.*?)\}\}/);
  return match && match[1] ? match[1] : templateOrFieldName;
}

/**
 * Computed property that provides the processed name of the selected related field,
 * after extracting it from any potential template syntax.
 * This is what's displayed to the user as "Selected Related Field".
 */
const selectedFieldNameDisplay = computed(() => {
  if (props.selectedFieldName && typeof props.selectedFieldName === "string") {
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
    const fieldKey = selectedFieldNameDisplay.value;
    if (Object.prototype.hasOwnProperty.call(itemData, fieldKey)) {
      return itemData[fieldKey];
    }
    console.warn(
      `[interface.vue] Field key "${fieldKey}" not found in itemData. Available keys:`,
      Object.keys(itemData)
    );
    return null;
  }
  return null;
});

const faviconService = new FaviconService();
const isLoading = ref(false);
const faviconDataUrl = ref<string | null>(null); // For the <img> src
const currentFaviconUrl = ref<string | null>(props.value || null); // The actual URL stored

const error = ref<string | null>(null);
const warning = ref<string | null>(null);
const info = ref<string | null>(null);

const NOTICE_TIMEOUTS = { error: 7000, warning: 5000, info: 3000 };
let errorTimeout: number | null = null;
let warningTimeout: number | null = null;
let infoTimeout: number | null = null;

const clearNotices = () => {
  error.value = null;
  warning.value = null;
  info.value = null;
  if (errorTimeout) clearTimeout(errorTimeout);
  if (warningTimeout) clearTimeout(warningTimeout);
  if (infoTimeout) clearTimeout(infoTimeout);
};

const setNotice = (type: "error" | "warning" | "info", message: string) => {
  clearNotices();
  if (type === "error") {
    error.value = message;
    errorTimeout = window.setTimeout(() => {
      error.value = null;
    }, NOTICE_TIMEOUTS.error);
  } else if (type === "warning") {
    warning.value = message;
    warningTimeout = window.setTimeout(() => {
      warning.value = null;
    }, NOTICE_TIMEOUTS.warning);
  } else if (type === "info") {
    info.value = message;
    infoTimeout = window.setTimeout(() => {
      info.value = null;
    }, NOTICE_TIMEOUTS.info);
  }
};

async function loadFaviconPreview(url: string | null | undefined) {
  if (!url) {
    faviconDataUrl.value = null;
    return;
  }
  isLoading.value = true;
  try {
    const dataUrl = await faviconService.convertToDataUrl(url);
    if (dataUrl) {
      faviconDataUrl.value = dataUrl;
    } else {
      // Don't show warning if user just cleared the field
      if (url)
        setNotice(
          "warning",
          "Unable to load favicon preview from the provided URL. It might be invalid or inaccessible."
        );
      faviconDataUrl.value = null;
    }
  } catch (err) {
    console.error("Error converting favicon to data URL:", err);
    setNotice("error", "Failed to load favicon image for preview.");
    faviconDataUrl.value = null;
  } finally {
    isLoading.value = false;
  }
}

// Called when user types into the favicon input
function updateFaviconUrlManually(newFaviconUrl: string | null) {
  clearNotices();
  currentFaviconUrl.value = newFaviconUrl;
  emit("input", newFaviconUrl);
  // Attempt to load preview as user types/pastes, or clears
  if (newFaviconUrl) {
    loadFaviconPreview(newFaviconUrl);
  } else {
    faviconDataUrl.value = null; // Clear preview if input is cleared
  }
}

// Called when the input loses focus
async function handleFaviconInputBlur() {
  // If there's a URL in the input but no preview (e.g. due to initial error or manual change), try loading it again.
  if (currentFaviconUrl.value && !faviconDataUrl.value) {
    await loadFaviconPreview(currentFaviconUrl.value);
  }
}

function handleImageError() {
  setNotice(
    "error",
    "Failed to load favicon image. The URL might be incorrect or the image is not accessible."
  );
  faviconDataUrl.value = null;
}

async function generateFavicon() {
  clearNotices();
  if (!relatedFieldContent.value) {
    setNotice(
      "warning",
      `Please ensure the related field "${
        selectedFieldNameDisplay.value || "source"
      }" has content (a URL).`
    );
    return;
  }
  if (
    typeof relatedFieldContent.value !== "string" ||
    !relatedFieldContent.value.trim()
  ) {
    setNotice(
      "warning",
      `The content of "${
        selectedFieldNameDisplay.value || "source"
      }" is not a valid string for URL generation.`
    );
    return;
  }

  isLoading.value = true;
  try {
    const result = await faviconService.getFaviconUrl(
      relatedFieldContent.value
    );
    if (result && result.url) {
      currentFaviconUrl.value = result.url;
      emit("input", result.url);
      faviconDataUrl.value = result.dataUrl; // This might be null if conversion failed, but getFaviconUrl succeeded
      if (result.dataUrl) {
        setNotice("info", "Favicon generated and preview loaded successfully!");
      } else {
        setNotice(
          "warning",
          `Favicon URL found (${result.url}), but preview could not be loaded. You can try saving. This URL will be saved.`
        );
      }
    } else {
      setNotice(
        "warning",
        "No favicon could be found or generated for the URL in the related field."
      );
      // Do not clear currentFaviconUrl or faviconDataUrl here, user might have a manual one.
    }
  } catch (err) {
    console.error("Error generating favicon:", err);
    setNotice(
      "error",
      "An unexpected error occurred while generating the favicon."
    );
  } finally {
    isLoading.value = false;
  }
}

// Load initial favicon if value is present
onMounted(() => {
  currentFaviconUrl.value = props.value || null;
  if (currentFaviconUrl.value) {
    loadFaviconPreview(currentFaviconUrl.value);
  }
});

// Watch for external changes to props.value (e.g. Directus loading data)
watch(
  () => props.value,
  (newValue) => {
    if (newValue !== currentFaviconUrl.value) {
      currentFaviconUrl.value = newValue || null;
      loadFaviconPreview(newValue);
    }
  }
);

// Watch for changes in related field content to provide feedback or clear states if necessary
watch(relatedFieldContent, (newContent, oldContent) => {
  if (newContent && newContent !== oldContent) {
    // Optional: inform user that source for generation has changed.
    // setNotice('info', `Source URL for favicon generation (from "${selectedFieldNameDisplay.value}") has changed.`);
  }
});

onUnmounted(() => {
  clearNotices();
});
</script>

<style scoped>
.simple-interface-display {
  padding: 10px;
  border: 1px solid var(--theme--border-color, #eee);
  border-radius: var(--theme--border-radius, 4px);
  font-family: var(--theme--font-family, sans-serif);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.simple-interface-display p {
  margin: 0 0 4px 0;
  color: var(--theme--text);
  line-height: 1.5;
}

.related-content-display {
  font-size: 0.9em;
  color: var(--theme--text-subdued);
}
.related-content-display pre {
  margin-top: 2px;
  padding: 4px 6px;
  background-color: var(--theme--background-subdued);
  border-radius: var(--theme--border-radius);
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.9em;
  max-height: 100px;
  overflow-y: auto;
}

.field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--theme--text-subdued, #667085);
  font-size: var(--theme--font-size-small, 0.875rem);
  line-height: 1.4;
}

.link-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.link-row > .v-input {
  flex-grow: 1; /* Make input take available space */
}

.favicon-preview {
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 52px; /* Fixed height to match input/button */
  border: 1px solid var(--theme--border-color-inputs, #dce4e8);
  border-radius: var(--theme--border-radius, 4px);
  background-color: var(--theme--background-subdued, #f0f4f8);
  transition: opacity 0.2s ease;
  box-sizing: border-box;
}

.favicon-preview.loading {
  opacity: 0.5;
}

.favicon-image {
  max-width: 32px;
  max-height: 32px;
  object-fit: contain;
  display: block;
}

strong {
  color: var(--theme--text);
  font-weight: var(--theme--font-weight-bold, 600);
}

.v-notice {
  margin-top: 8px;
}
</style>
