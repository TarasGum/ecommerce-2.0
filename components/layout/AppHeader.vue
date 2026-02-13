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
            v-if="!!isSuperAdmin"
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

    <!-- Health Status Row (fixed height to prevent layout shift) -->
    <div v-if="showHealthRow" class="flex align-items-center justify-content-center gap-5 health-row">
      <ClientOnly>
        <template v-if="!healthData">
          <!-- Skeleton loading state -->
          <div v-for="i in 4" :key="i" class="flex align-items-center gap-2 health-item">
            <div class="skeleton health-skeleton-label"></div>
            <div class="skeleton health-skeleton-dot"></div>
          </div>
          <div class="flex align-items-center gap-2 health-item">
            <div class="skeleton health-skeleton-label"></div>
            <div class="skeleton health-skeleton-badge"></div>
          </div>
        </template>

        <template v-else-if="healthData">
          <!-- Frontend -->
          <div class="flex align-items-center gap-2 health-item">
            <span class="health-label">Frontend</span>
            <span
              v-if="healthData.website_status"
              v-tooltip="{ value: getTooltip('website'), escape: false }"
              class="health-dot"
              :class="healthData.website_status === 'healthy' ? 'dot-healthy' : 'dot-unhealthy'"
            ></span>
            <span v-else class="health-dash">—</span>
          </div>

          <!-- Backend -->
          <div class="flex align-items-center gap-2 health-item">
            <span class="health-label">Backend</span>
            <span
              v-if="healthData.backend_status"
              v-tooltip="{ value: getTooltip('backend'), escape: false }"
              class="health-dot"
              :class="healthData.backend_status === 'healthy' ? 'dot-healthy' : 'dot-unhealthy'"
            ></span>
            <span v-else class="health-dash">—</span>
          </div>

          <!-- EBMS -->
          <div class="flex align-items-center gap-2 health-item">
            <span class="health-label">EBMS</span>
            <span
              v-if="healthData.has_ebms_config && healthData.ebms_status"
              v-tooltip="{ value: getTooltip('ebms'), escape: false }"
              class="health-dot"
              :class="healthData.ebms_status === 'healthy' ? 'dot-healthy' : 'dot-unhealthy'"
            ></span>
            <span v-else class="health-dash">—</span>
          </div>

          <!-- Database (Sync) -->
          <div class="flex align-items-center gap-2 health-item">
            <span class="health-label">Database</span>
            <span
              v-if="healthData.has_sync_config && healthData.sync_status"
              v-tooltip="{ value: getTooltip('sync'), escape: false }"
              class="health-dot"
              :class="healthData.sync_status === 'healthy' ? 'dot-healthy' : 'dot-unhealthy'"
            ></span>
            <span v-else class="health-dash">—</span>
          </div>

          <!-- Overall Status -->
          <div class="flex align-items-center gap-2 health-item">
            <span class="health-label">Status</span>
            <span
              class="health-badge"
              :class="healthData.overall_status === 'healthy' ? 'badge-healthy' : 'badge-unhealthy'"
            >{{ healthData.overall_status }}</span>
          </div>
        </template>

        <!-- SSR fallback: skeletons -->
        <template #fallback>
          <div v-for="i in 4" :key="i" class="flex align-items-center gap-2 health-item">
            <div class="skeleton health-skeleton-label"></div>
            <div class="skeleton health-skeleton-dot"></div>
          </div>
          <div class="flex align-items-center gap-2 health-item">
            <div class="skeleton health-skeleton-label"></div>
            <div class="skeleton health-skeleton-badge"></div>
          </div>
        </template>
      </ClientOnly>
    </div>
  </header>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Tag from "primevue/tag";
import Dropdown from "primevue/dropdown";
import Tooltip from "primevue/tooltip";
import { storeToRefs } from "pinia";
import { getUserRoleSeverity, USER_ROLES } from "~/utils/constants";
import { useProjectsStore } from "~/stores/projects";
import { useUiStore } from "~/stores/ui";
import { formatHealthDateTime, formatResponseTime } from "~/utils/formatters";
import type { ProjectHealth } from "~/types/models";

const vTooltip = Tooltip;

const auth = useAuth();
const router = useRouter();

// Store management
const projectsStore = useProjectsStore();
const { selectedProjectId, loading: projectsLoading, projectOptions } = storeToRefs(projectsStore);

const uiStore = useUiStore();
const { pageTitle, pageSubtitle, showBackButton, backPath } = storeToRefs(uiStore);

const isSuperAdmin = computed(() => auth.user.value?.role === USER_ROLES.SUPERADMIN);

// ===== Health Status =====
const projectsApi = useProjects();
const healthData = ref<ProjectHealth | null>(null);
const healthLoading = ref(false);

// Show health row when user is authenticated
// For superadmins: only when a project is selected
// For non-superadmins: always
const showHealthRow = computed(() => {
  if (!auth.user.value) return false;
  if (isSuperAdmin.value) return selectedProjectId.value !== null;
  return true;
});

async function fetchHealth() {
  healthLoading.value = true;
  try {
    const projectId = isSuperAdmin.value ? selectedProjectId.value : undefined;
    healthData.value = await projectsApi.getHealth(projectId);
  } catch {
    healthData.value = null;
  } finally {
    healthLoading.value = false;
  }
}

function getTooltip(service: 'website' | 'backend' | 'ebms' | 'sync'): string {
  if (!healthData.value) return '';

  let status: string;
  let responseMs: number;
  let lastChecked: string;
  let error: string;

  switch (service) {
    case 'website':
      status = healthData.value.website_status;
      responseMs = healthData.value.website_response_ms;
      lastChecked = healthData.value.website_last_checked;
      error = healthData.value.website_error;
      break;
    case 'backend':
      status = healthData.value.backend_status;
      responseMs = healthData.value.backend_response_ms;
      lastChecked = healthData.value.backend_last_checked;
      error = healthData.value.backend_error;
      break;
    case 'ebms':
      status = healthData.value.ebms_status;
      responseMs = healthData.value.ebms_response_ms;
      lastChecked = healthData.value.ebms_last_checked;
      error = healthData.value.ebms_error;
      break;
    case 'sync':
      status = healthData.value.sync_status;
      responseMs = healthData.value.sync_response_ms;
      lastChecked = healthData.value.sync_last_checked;
      error = healthData.value.sync_error;
      break;
  }

  const isHealthy = status === 'healthy';
  const titleColor = isHealthy ? '#16a34a' : '#ef4444';
  const title = isHealthy ? 'Healthy' : 'Error';
  const detail = isHealthy
    ? `Response: ${formatResponseTime(responseMs)}`
    : (error || 'Unknown error');
  const checked = formatHealthDateTime(lastChecked);
  const checkedColor = isHealthy ? '#6b7280' : '#ef4444';

  return `<div style="text-align: center; line-height: 1.6; padding: 2px 0;">
    <div style="color: ${titleColor}; font-weight: 600;">${title}</div>
    <div>${detail}</div>
    <div style="color: ${checkedColor}; font-size: 0.85em;">Checked: ${checked}</div>
  </div>`;
}

// Fetch health on mount
onMounted(() => {
  if (showHealthRow.value) {
    fetchHealth();
  }
});

// Refetch when selected project changes (superadmin switches project)
watch(selectedProjectId, () => {
  if (showHealthRow.value) {
    fetchHealth();
  }
});

// Also fetch when user logs in (non-superadmin)
watch(() => auth.user.value, (newUser) => {
  if (newUser && showHealthRow.value) {
    fetchHealth();
  }
});

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

/* ==================== HEALTH STATUS ROW ==================== */
.health-row {
  padding: 0 1rem;
  border-top: 1px solid var(--color-border-light);
  background: #fafafa;
  height: 2rem;
  min-height: 2rem;
  max-height: 2rem;
}

.health-item {
  white-space: nowrap;
}

.health-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  user-select: none;
}

.health-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  flex-shrink: 0;
}

.health-dot:hover {
  transform: scale(1.4);
}

.dot-healthy {
  background-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.dot-healthy:hover {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
}

.dot-unhealthy {
  background-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.dot-unhealthy:hover {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
}

.health-badge {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.4;
}

.badge-healthy {
  background-color: #dcfce7;
  color: #16a34a;
}

.badge-unhealthy {
  background-color: #fee2e2;
  color: #ef4444;
}

.health-dash {
  color: #d1d5db;
  font-size: 0.75rem;
}

/* Health skeleton variants */
.health-skeleton-label {
  width: 50px;
  height: 12px;
  border-radius: 3px;
}

.health-skeleton-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.health-skeleton-badge {
  width: 62px;
  height: 18px;
  border-radius: 1rem;
}
</style>
