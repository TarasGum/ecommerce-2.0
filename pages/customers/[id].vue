<!-- pages/customers/[id].vue -->
<template>
  <div class="page-wrapper customer-details-page">
    <!-- Content -->
    <div v-if="customer || loading" class="content-wrapper">
      <!-- Tabs -->
      <div class="tabs-container">
        <div class="flex tabs">
          <button
            :class="['tab', { 'tab-active': activeTab === 'orders' }]"
            @click="activeTab = 'orders'"
          >
            Orders
          </button>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="columns-container">
        <!-- Left Column: Customer Info -->
        <div class="left-column">
          <CustomerInfoCard
            :customer="customer"
            :loading="loading"
            @edit="handleEditCustomer"
          />
        </div>

        <!-- Right Column: Tab Content -->
        <div class="right-column">
          <CustomerOrdersTab
            v-if="activeTab === 'orders'"
            :customer-id="customerId"
          />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="flex flex-column align-items-center justify-content-center gap-3 error-container">
      <p>Customer not found</p>
      <Button label="Back to Customers" @click="router.push('/customers')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import { until } from "@vueuse/core";
import { storeToRefs } from "pinia";
import type { Customer } from "~/types";
import CustomerInfoCard from "~/components/customers/CustomerInfoCard.vue";
import CustomerOrdersTab from "~/components/customers/CustomerOrdersTab.vue";
import { useProjectsStore } from "~/stores/projects";
import { useUiStore } from "~/stores/ui";
import { USER_ROLES } from "~/utils/constants";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const router = useRouter();
const customersApi = useCustomers();
const toast = useToast();
const auth = useAuth();

// Store management
const projectsStore = useProjectsStore();
const { selectedProjectId, loading: projectsLoading } = storeToRefs(projectsStore);

const uiStore = useUiStore();

const isSuperAdmin = computed(() => auth.user.value?.role === USER_ROLES.SUPERADMIN);

// Customer ID from route
const customerId = computed(() => route.params.id as string);

// Customer state
const customer = ref<Customer | null>(null);
const loading = ref(true); // Start with true to prevent empty state flash
const activeTab = ref<'orders'>('orders');

// Update page header with customer info
watch(customer, (newCustomer) => {
  if (newCustomer) {
    uiStore.setPageHeader({
      title: `Customers / #${customerId.value}`,
      subtitle: newCustomer.l_name || null,
      showBack: true,
      backPath: '/customers',
    });
  }
}, { immediate: true });

// Clear page header when leaving
onUnmounted(() => {
  uiStore.clearPageHeader();
});

// Load customer on mount
onMounted(async () => {
  // Wait for projects to load if user is superadmin AND projects are still loading
  if (isSuperAdmin.value && projectsLoading.value) {
    await until(projectsLoading).toBe(false);
  }
  
  // Always load data after waiting (if needed)
  loadCustomer();
});

// Watch for customer ID changes (navigation between customers)
watch(
  customerId,
  () => {
    loadCustomer();
  }
);

// Watch for project changes (superadmin only)
watch(
  selectedProjectId,
  () => {
    if (isSuperAdmin.value) {
      loadCustomer();
    }
  }
);

async function loadCustomer() {
  const projectId = isSuperAdmin.value && selectedProjectId.value !== null 
    ? selectedProjectId.value 
    : undefined;

  await useApiCall({
    fn: () => customersApi.getById(customerId.value, undefined, projectId),
    errorMessage: 'Failed to Load Customer',
    loading,
    toast,
    onSuccess: (data) => {
      customer.value = data;
    },
    onError: () => {
      customer.value = null;
    },
  });
}

function handleEditCustomer() {
  toast.showInfo("Coming Soon!");
}
</script>

<style scoped>
/* Customer details page - custom styles */
/* Common styles are in assets/css/components.css */

/* Tabs container */
.tabs-container {
  margin-bottom: 1rem;
}

.tabs {
  gap: 0.25rem;
  border-bottom: 1px solid var(--color-border-light);
}

.tab {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.tab:hover {
  color: var(--color-text-primary);
  background: var(--color-neutral-200);
}

.tab-active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-neutral-900);
}

/* Two-column layout */
.columns-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
}

.left-column {
  position: sticky;
  top: 4rem;
  align-self: start;
}

.right-column {
  min-width: 0;
}

@media (max-width: 1024px) {
  .columns-container {
    grid-template-columns: 1fr;
  }

  .left-column {
    position: static;
  }
}

/* Error container */
.error-container {
  padding: 4rem 2rem;
}
</style>
