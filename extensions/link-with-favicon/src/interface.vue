<template>
  <div class="field-wrapper">
    <div class="info-text">
      <v-icon name="info" small />
      <span>Enter your link URL. You can then generate a favicon url from this link or provide a custom favicon url.</span>
    </div>
    <v-input
      :model-value="link"
      :placeholder="placeholder"
      @update:model-value="updateLink"
    />
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
        :model-value="faviconLink"
        :placeholder="faviconPlaceholder"
        @update:model-value="updateFaviconLink"
        @blur="handleFaviconBlur"
      />
      <v-button @click="generateFavicon" :loading="isLoading">
        Generate Favicon
      </v-button>
    </div>
    <v-notice v-if="error" type="danger" icon="error">
      {{ error }}
    </v-notice>
    <v-notice v-if="warning" type="warning" icon="warning">
      {{ warning }}
    </v-notice>
    <v-notice v-if="info" type="info" icon="info">
      {{ info }}
    </v-notice>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch, onUnmounted } from "vue";
import { FaviconService } from "./services/FaviconService";

export default {
  props: {
    value: {
      type: [String, Object],
      default: null,
    },
    placeholder: {
      type: String,
      default: "Enter URL",
    },
    faviconPlaceholder: {
      type: String,
      default: "Enter favicon URL",
    },
  },
  emits: ["input"],
  setup(props, { emit }) {
    const faviconService = new FaviconService();
    const isLoading = ref(false);
    const imageError = ref(false);
    const faviconDataUrl = ref(null);
    const error = ref(null);
    const warning = ref(null);
    const info = ref(null);

    const NOTICE_TIMEOUTS = {
      error: 5000,
      warning: 4000,
      info: 3000
    };

    let errorTimeout = null;
    let warningTimeout = null;
    let infoTimeout = null;

    // Clear all notices and their timeouts
    const clearNotices = () => {
      error.value = null;
      warning.value = null;
      info.value = null;
      
      if (errorTimeout) clearTimeout(errorTimeout);
      if (warningTimeout) clearTimeout(warningTimeout);
      if (infoTimeout) clearTimeout(infoTimeout);
    };

    // Set a notice with auto-clear timeout
    const setNotice = (type, message) => {
      clearNotices();
      
      if (type === 'error') {
        error.value = message;
        errorTimeout = setTimeout(() => {
          error.value = null;
        }, NOTICE_TIMEOUTS.error);
      } else if (type === 'warning') {
        warning.value = message;
        warningTimeout = setTimeout(() => {
          warning.value = null;
        }, NOTICE_TIMEOUTS.warning);
      } else if (type === 'info') {
        info.value = message;
        infoTimeout = setTimeout(() => {
          info.value = null;
        }, NOTICE_TIMEOUTS.info);
      }
    };

    const link = computed(() => {
      if (!props.value) return "";
      return typeof props.value === "object" ? props.value.link : "";
    });

    const faviconLink = computed(() => {
      if (!props.value) return "";
      return typeof props.value === "object" ? props.value.faviconLink : "";
    });

    // Load favicon on initial mount if URL exists
    onMounted(async () => {
      if (faviconLink.value) {
        await loadFaviconFromUrl(faviconLink.value);
      }
    });

    // Watch for changes to the favicon link from external sources
    watch(() => props.value?.faviconLink, async (newValue) => {
      if (newValue && !faviconDataUrl.value) {
        await loadFaviconFromUrl(newValue);
      }
    });

    async function loadFaviconFromUrl(url) {
      if (!url) return;
      
      isLoading.value = true;
      try {
        const dataUrl = await faviconService.convertToDataUrl(url);
        if (dataUrl) {
          faviconDataUrl.value = dataUrl;
        } else {
          setNotice('warning', "Unable to load favicon from the provided URL");
        }
      } catch (error) {
        console.error("Error converting favicon to data URL:", error);
        setNotice('error', "Failed to load favicon image");
      } finally {
        isLoading.value = false;
      }
    }

    function updateLink(newLink) {
      clearNotices();
      emit("input", {
        link: newLink,
        faviconLink: faviconLink.value,
      });
    }

    async function updateFaviconLink(newFaviconLink) {
      clearNotices();
      emit("input", {
        link: link.value,
        faviconLink: newFaviconLink,
      });
      
      if (newFaviconLink) {
        await loadFaviconFromUrl(newFaviconLink);
      } else {
        faviconDataUrl.value = null;
      }
    }

    function handleImageError() {
      imageError.value = true;
      setNotice('error', "Failed to load favicon image");
      faviconDataUrl.value = null;
    }

    async function handleFaviconBlur() {
      if (faviconLink.value && !faviconDataUrl.value) {
        await updateFaviconLink(faviconLink.value);
      }
    }

    async function handleFaviconGeneration() {
      clearNotices();
      imageError.value = false;
      if (!link.value) {
        setNotice('warning', "Please enter a URL first");
        return;
      }

      isLoading.value = true;
      try {
        const result = await faviconService.getFaviconUrl(link.value);
        if (result) {
          updateFaviconLink(result.url);
          faviconDataUrl.value = result.dataUrl;
          setNotice('info', "Favicon generated successfully");
        } else {
          setNotice('warning', "No favicon found for this URL");
        }
      } catch (error) {
        console.error("Error generating favicon:", error);
        setNotice('error', "Error generating favicon");
      } finally {
        isLoading.value = false;
      }
    }

    async function generateFavicon() {
      await handleFaviconGeneration();
    }

    // Clean up timeouts when component is unmounted
    onUnmounted(() => {
      clearNotices();
    });

    return {
      link,
      faviconLink,
      faviconDataUrl,
      updateLink,
      updateFaviconLink,
      generateFavicon,
      isLoading,
      handleImageError,
      handleFaviconBlur,
      error,
      warning,
      info
    };
  },
};
</script>

<style scoped>
.field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--theme--foreground-subdued);
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 4px;
}

.link-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.favicon-preview {
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
  transition: opacity 0.2s ease;
}

.favicon-preview.loading {
  opacity: 0.5;
}

.favicon-image {
  max-width: 32px;
  max-height: 32px;
  object-fit: contain;
}
</style>
