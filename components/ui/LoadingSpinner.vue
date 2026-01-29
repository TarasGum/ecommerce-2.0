<!-- components/ui/LoadingSpinner.vue -->
<template>
  <div class="loading-spinner-wrapper" :class="{ 'full-page': fullPage }">
    <div class="loading-spinner" :class="sizeClass">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <span v-if="text" class="loading-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  fullPage: false,
});

const sizeClass = computed(() => `spinner-${props.size}`);
</script>

<style scoped>
.loading-spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  animation: fadeIn 0.2s ease;
}

.loading-spinner-wrapper.full-page {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-spinner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-sm {
  width: 20px;
  height: 20px;
}

.spinner-md {
  width: 32px;
  height: 32px;
}

.spinner-lg {
  width: 48px;
  height: 48px;
}

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--color-violet-500);
  animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-sm .spinner-ring {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.spinner-md .spinner-ring {
  width: 32px;
  height: 32px;
  border-width: 2.5px;
}

.spinner-lg .spinner-ring {
  width: 48px;
  height: 48px;
  border-width: 3px;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.3s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.15s;
  opacity: 0.7;
}

.spinner-ring:nth-child(3) {
  animation-delay: 0s;
  opacity: 0.4;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
