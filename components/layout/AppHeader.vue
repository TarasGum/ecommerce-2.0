<!-- components/layout/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="flex justify-content-between align-items-center gap-3 header-content">
      <div class="flex align-items-center gap-3 flex-1 header-left">
        <!-- Back Button (for detail pages) -->
        <Button
          v-if="showBackButton"
          icon="pi pi-arrow-left"
          text
          rounded
          severity="secondary"
          @click="handleBack"
          class="flex-shrink-0"
        />
        
        <!-- Page Title (for detail pages) -->
        <div v-if="pageTitleParts" class="flex align-items-baseline gap-2 page-title-header">
          <span class="title-base">{{ pageTitleParts.base }}</span>
          <span v-if="pageTitleParts.name" class="title-name">({{ pageTitleParts.name }})</span>
        </div>
        
        <!-- Project Selector (SuperAdmin only) -->
        <Dropdown
          v-if="!!isSuperAdmin && !pageTitleParts"
          v-model="selectedProjectId"
          :options="projectOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select Project"
          class="project-dropdown"
          :loading="projectsLoading"
        />
      </div>

      <div class="flex align-items-center gap-3">
        <div v-if="auth.user.value" class="flex align-items-center gap-2">
          <span class="user-email">{{ auth.user.value.email }}</span>
          <Tag
            :value="auth.user.value.role"
            :severity="getUserRoleSeverity(auth.user.value.role)"
          />
        </div>

        <Button
          icon="pi pi-sign-out"
          label="Logout"
          severity="secondary"
          size="small"
          text
          @click="handleLogout"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Tag from "primevue/tag";
import Dropdown from "primevue/dropdown";
import { getUserRoleSeverity } from "~/utils/constants";

const auth = useAuth();
const router = useRouter();
const route = useRoute();
const {
  selectedProjectId,
  projectsLoading,
  isSuperAdmin,
  projectOptions,
  loadProjects,
} = useSelectedProject();

// Global state for customer name (set from customer details page)
const customerName = useState<string | null>('customerHeaderName', () => null);

// Computed properties for dynamic header
const showBackButton = computed(() => {
  return route.path.startsWith('/customers/') && route.params.id;
});

const pageTitleParts = computed(() => {
  if (route.path.startsWith('/customers/') && route.params.id) {
    return {
      base: `Customers / #${route.params.id}`,
      name: customerName.value ? truncateName(customerName.value) : null
    };
  }
  return null;
});

function truncateName(name: string): string {
  if (!name) return '';
  const maxLength = 40;
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
}

// Load projects on mount for superadmins
onMounted(() => {
  loadProjects();
});

async function handleLogout() {
  await auth.logout();
}

function handleBack() {
  router.push('/customers');
}

// getRoleSeverity is now imported as getUserRoleSeverity from ~/utils/constants
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: 0;
  z-index: 90;
}

.header-content {
  padding: 0.75rem 1rem;
  height: 3.5rem;
}

.page-title-header {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.title-base {
  color: var(--color-text-primary);
}

.title-name {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.project-dropdown {
  min-width: 220px;
  max-width: 300px;
}

.user-email {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}
</style>
