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
        <ClientOnly>
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
        </ClientOnly>
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
import { storeToRefs } from "pinia";
import { getUserRoleSeverity, USER_ROLES } from "~/utils/constants";
import { useProjectsStore } from "~/stores/projects";
import { useUiStore } from "~/stores/ui";

const auth = useAuth();
const router = useRouter();

// Store management
const projectsStore = useProjectsStore();
const { selectedProjectId, loading: projectsLoading, projectOptions } = storeToRefs(projectsStore);

const uiStore = useUiStore();
const { pageTitle, pageSubtitle, showBackButton, backPath } = storeToRefs(uiStore);

const isSuperAdmin = computed(() => auth.user.value?.role === USER_ROLES.SUPERADMIN);

// Computed properties for dynamic header
const pageTitleParts = computed(() => {
  if (pageTitle.value) {
    return {
      base: pageTitle.value,
      name: pageSubtitle.value ? truncateName(pageSubtitle.value) : null
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

async function handleLogout() {
  await auth.logout();
}

function handleBack() {
  if (backPath.value) {
    router.push(backPath.value);
  } else {
    router.back();
  }
}
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
