<!-- components/customers/CustomerInfoCard.vue -->
<template>
  <div class="info-card">
    <!-- Loading State -->
    <template v-if="loading">
      <div class="skeleton skeleton-title" style="width: 200px; margin-bottom: 1.5rem;"></div>
      
      <div class="flex flex-column gap-3">
        <div class="flex flex-column gap-1" v-for="i in 5" :key="i">
          <div class="skeleton skeleton-text" style="width: 60px; height: 0.75rem;"></div>
          <div class="skeleton skeleton-text" :style="{ width: `${100 + i * 20}px`, height: '0.875rem' }"></div>
        </div>
      </div>
    </template>

    <!-- Loaded Content -->
    <template v-else-if="customer">
      <h3 class="info-card-title">{{ truncatedName }}</h3>
      
      <div class="flex flex-column gap-3">
        <div v-if="customer.phone" class="flex flex-column gap-1">
          <span class="info-label">Phone</span>
          <span class="info-value">{{ customer.phone }}</span>
        </div>

        <div v-if="customer.email" class="flex flex-column gap-1">
          <span class="info-label">Email</span>
          <span class="info-value">{{ customer.email }}</span>
        </div>

        <div v-if="hasAddress" class="flex flex-column gap-1">
          <span class="info-label">Address</span>
          <div class="flex flex-column info-value address-block">
            <div v-if="customer.address1">{{ customer.address1 }}</div>
            <div v-if="customer.address2">{{ customer.address2 }}</div>
            <div v-if="customer.city || customer.state || customer.zip">
              {{ [customer.city, customer.state, customer.zip].filter(Boolean).join(', ') }}
            </div>
            <div v-if="customer.country">{{ customer.country }}</div>
          </div>
        </div>

        <div v-if="customer.in_level" class="flex flex-column gap-1">
          <span class="info-label">Type</span>
          <span class="info-value">{{ customer.in_level }}</span>
        </div>

        <div v-if="customer.inactive !== undefined" class="flex flex-column gap-1">
          <span class="info-label">Status</span>
          <Tag
            :value="customer.inactive ? 'Inactive' : 'Active'"
            :severity="customer.inactive ? 'danger' : 'success'"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import Tag from "primevue/tag";
import type { Customer } from "~/types";

interface Props {
  customer: Customer | null;
  loading: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [];
}>();

// Computed properties
const hasAddress = computed(() => {
  if (!props.customer) return false;
  return !!(
    props.customer.address1 ||
    props.customer.address2 ||
    props.customer.city ||
    props.customer.state ||
    props.customer.zip ||
    props.customer.country
  );
});

const truncatedName = computed(() => {
  if (!props.customer?.l_name) return '—';
  const maxLength = 40;
  const name = props.customer.l_name;
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
});
</script>

<style scoped>
/* Info card */
.info-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  padding: 1.5rem;
}

.info-card-title {
  font-size: var(--font-size-body-l) !important;
  font-weight: var(--font-weight-semibold) !important;
  margin-bottom: 1rem !important;
  color: var(--color-text-primary);
}

.info-label {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.info-value {
  font-size: var(--font-size-body-s);
  color: var(--color-text-primary);
}

.address-block {
  gap: 0.125rem;
}
</style>
