<!-- pages/projects/index.vue -->
<template>
  <div class="page-wrapper projects-page">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">Projects</h1>
      <Button
        label="Add New Project"
        icon="pi pi-plus"
        severity="success"
        @click="openCreateModal"
      />
    </div>

    <!-- Search Bar -->
    <div class="search-container">
      <IconField iconPosition="left">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="searchInput"
          placeholder="Search projects..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
      </IconField>
    </div>

    <!-- Projects Table Card -->
    <div class="table-card">
      <!-- Empty State -->
      <div v-if="!loading && projects.length === 0" class="flex flex-column align-items-center justify-content-center gap-3 empty-state">
        <i class="pi pi-briefcase"></i>
        <p class="empty-state-text">{{ searchQuery ? 'No projects found matching your search' : 'No projects found' }}</p>
        <Button
          v-if="!searchQuery"
          label="Add New Project"
          icon="pi pi-plus"
          severity="primary"
          size="small"
          @click="openCreateModal"
        />
      </div>

      <!-- Projects Table -->
      <DataTable
        v-else
        :value="loading ? skeletonRows : projects"
        class="data-table projects-table"
        stripedRows
        :sortField="primeVueSortField || undefined"
        :sortOrder="primeVueSortOrder"
        @sort="handlePrimeVueSort"
      >
        <!-- Name Column (sortable) -->
        <Column
          field="name"
          header="Project Name"
          sortable
          :style="{ width: '25%', minWidth: '180px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 150px;"></div>
            <span v-else class="cell-name">{{ data.name }}</span>
          </template>
        </Column>

        <!-- Database Type Column (sortable) -->
        <Column
          field="db_type"
          header="Database"
          sortable
          :style="{ width: '15%', minWidth: '120px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 80px;"></div>
            <Tag v-else :value="getDbTypeLabel(data.db_type)" :severity="getDbTypeSeverity(data.db_type)" />
          </template>
        </Column>

        <!-- Host Column -->
        <Column
          field="db_host"
          header="Host"
          :style="{ width: '20%', minWidth: '150px' }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 130px;"></div>
            <span
              v-else
              v-tooltip.top="data.db_host"
              class="cell-secondary cell-ellipsis"
            >{{ data.db_host }}</span>
          </template>
        </Column>

        <!-- User Count Column (sortable) -->
        <Column
          field="user_count"
          header="Users"
          sortable
          :style="{ width: '10%', minWidth: '80px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 40px;"></div>
            <span v-else class="cell-secondary">{{ data.user_count }}</span>
          </template>
        </Column>

        <!-- Created At Column (sortable) -->
        <Column
          field="created_at"
          header="Created"
          sortable
          :style="{ width: '15%', minWidth: '120px' }"
          :pt="{
            sort: { class: 'cursor-pointer' },
          }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 100px;"></div>
            <span v-else class="cell-secondary">{{ formatDate(data.created_at) }}</span>
          </template>
        </Column>

        <!-- Actions Column -->
        <Column 
          header="Actions" 
          :style="{ width: '80px', minWidth: '80px', textAlign: 'center' }"
          :pt="{ headerContent: { style: 'justify-content: center' } }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-circle"></div>
            <Button
              v-else
              icon="pi pi-ellipsis-v"
              text
              rounded
              @click="(event) => toggleMenu(event, data)"
              aria-haspopup="true"
              :aria-controls="`menu-${data.id}`"
            />
          </template>
        </Column>
      </DataTable>

      <!-- Pagination -->
      <div class="flex align-items-center justify-content-between pagination-container">
        <div class="flex justify-content-start align-items-center flex-1">
          <span v-if="!loading && totalRecords > 0" class="results-text">
            {{ paginationRange.start }}–{{ paginationRange.end }} of {{ paginationRange.total.toLocaleString() }}
          </span>
        </div>
        
        <Paginator
          v-if="showPagination"
          :first="offset"
          :rows="pageSize"
          :totalRecords="totalRecords"
          @page="onPageChange"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          :pageLinkSize="9"
          class="custom-paginator"
        />
        
        <div class="flex justify-content-end flex-1"></div>
      </div>
    </div>

    <!-- Context Menu -->
    <Menu ref="menuRef" :model="menuItems" :popup="true">
      <template #item="{ item, props }">
        <a 
          v-ripple 
          class="flex align-items-center menu-item-link" 
          v-bind="props.action"
        >
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </Menu>

    <!-- Project Modal (Create/Edit) -->
    <ProjectModal
      v-model:visible="showProjectModal"
      :mode="modalMode"
      :project-id="editingProjectId"
      @success="onProjectSaved"
    />
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Tag from "primevue/tag";
import Paginator from "primevue/paginator";
import Menu from "primevue/menu";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Ripple from "primevue/ripple";
import Tooltip from "primevue/tooltip";
import ProjectModal from "~/components/projects/ProjectModal.vue";
import type { Project, PrimeVuePageEvent } from "~/types";
import type { DataTableSortEvent } from "primevue/datatable";
import { PAGINATION_DEFAULTS, USER_ROLES } from "~/utils/constants";
import { formatDate } from "~/utils/formatters";
import { useConfirm } from "primevue/useconfirm";

// Register directives
const vRipple = Ripple;
const vTooltip = Tooltip;

definePageMeta({
  middleware: "auth",
});

const projectsApi = useProjects();
const projectsStore = useProjectsStore();
const toast = useToast();
const confirm = useConfirm();
const auth = useAuth();
const router = useRouter();

// Check if user is SuperAdmin, redirect if not
const isSuperAdmin = computed(() => auth.user.value?.role === USER_ROLES.SUPERADMIN);

onMounted(() => {
  if (!isSuperAdmin.value) {
    toast.showError("You don't have permission to access this page", "Access Denied");
    router.push("/");
    return;
  }
  loadProjects();
});

// URL-based state management
const { page, pageSize, offset, setPage } = useUrlPagination({
  defaultPageSize: PAGINATION_DEFAULTS.PAGE_SIZE_DEFAULT,
});

const {
  primeVueSortField,
  primeVueSortOrder,
  sortOrdering,
  handlePrimeVueSort,
} = useUrlSort({
  useCombinedFormat: true,
  combinedParam: 'ordering',
});

const { search: searchQuery, searchInput, applySearchImmediately } = useUrlSearch();

// Local UI state
const projects = ref<Project[]>([]);
const loading = ref(true);
const totalRecords = ref(0);
const showProjectModal = ref(false);
const modalMode = ref<"create" | "edit">("create");
const editingProjectId = ref<number | null>(null);
const menuRef = ref();
const selectedProject = ref<Project | null>(null);

// Computed properties
const showPagination = computed(() => totalRecords.value > pageSize.value);

const paginationRange = computed(() => {
  if (totalRecords.value === 0) {
    return { start: 0, end: 0, total: 0 };
  }
  const start = offset.value + 1;
  const end = Math.min(offset.value + pageSize.value, totalRecords.value);
  return { start, end, total: totalRecords.value };
});

// Skeleton rows for loading state
const skeletonRows = computed(() => {
  const size = pageSize.value || PAGINATION_DEFAULTS.PAGE_SIZE_DEFAULT;
  return Array.from({ length: size }, (_, i) => ({
    id: i,
    name: '',
    db_type: '',
    db_host: '',
    user_count: '',
    created_at: '',
  }));
});

// Menu items
const menuItems = computed(() => {
  return [
    {
      label: "Edit",
      icon: "pi pi-pencil",
      command: () => {
        openEditModal(selectedProject.value!);
      },
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: () => {
        confirmDeleteProject(selectedProject.value!);
      },
    },
  ];
});

// Watch for URL state changes and reload projects
watch(
  [page, pageSize, sortOrdering, searchQuery],
  () => {
    loadProjects();
  }
);

async function loadProjects() {
  // Don't load if not superadmin
  if (!isSuperAdmin.value) return;

  const params: any = {
    limit: pageSize.value,
    offset: offset.value,
  };

  // Add sorting
  if (sortOrdering.value) {
    params.ordering = sortOrdering.value;
  }

  // Add search
  if (searchQuery.value) {
    params.search = searchQuery.value;
  }

  await useApiCall({
    fn: () => projectsApi.list(params),
    errorMessage: 'Failed to Load Projects',
    loading,
    toast,
    onSuccess: (data) => {
      projects.value = data.results;
      totalRecords.value = data.count;
    },
  });
}

function handleSearch() {
  applySearchImmediately();
  setPage(1); // Reset to first page on search
}

function onPageChange(event: PrimeVuePageEvent) {
  const newPage = Math.floor(event.first / event.rows) + 1;
  setPage(newPage);
}

function openCreateModal() {
  modalMode.value = "create";
  editingProjectId.value = null;
  showProjectModal.value = true;
}

function openEditModal(project: Project) {
  modalMode.value = "edit";
  editingProjectId.value = project.id;
  showProjectModal.value = true;
}

function onProjectSaved() {
  loadProjects();
  // Reload projects store to update header dropdown
  projectsStore.loadProjects(true);
}

function toggleMenu(event: Event, project: Project) {
  selectedProject.value = project;
  menuRef.value.toggle(event);
}

function getDbTypeLabel(dbType: string): string {
  const labels: Record<string, string> = {
    postgresql: 'PostgreSQL',
    mysql: 'MySQL',
    mssql: 'SQL Server',
    oracle: 'Oracle',
  };
  return labels[dbType] || dbType;
}

function getDbTypeSeverity(dbType: string): string {
  const severities: Record<string, string> = {
    postgresql: 'info',
    mysql: 'warning',
    mssql: 'secondary',
    oracle: 'danger',
  };
  return severities[dbType] || 'secondary';
}

function confirmDeleteProject(project: Project) {
  const userCount = parseInt(project.user_count) || 0;
  let message = `Are you sure you want to delete "${project.name}"?`;
  
  if (userCount > 0) {
    message += ` This project has ${userCount} user${userCount > 1 ? 's' : ''} assigned to it.`;
  }
  
  message += " This action cannot be undone.";
  
  confirm.require({
    message,
    header: "Delete Project",
    icon: "pi pi-exclamation-triangle",
    rejectClass: "p-button-text",
    acceptClass: "p-button-danger",
    accept: () => {
      deleteProject(project.id);
    },
  });
}

async function deleteProject(projectId: number) {
  await useApiCall({
    fn: () => projectsApi.remove(projectId),
    successMessage: 'Project deleted successfully',
    errorMessage: 'Failed to Delete Project',
    showSuccess: true,
    toast,
    onSuccess: () => {
      loadProjects();
      // Reload projects store to update header dropdown
      projectsStore.loadProjects(true);
    },
  });
}
</script>

<style scoped>
.projects-page {
  padding: 1.5rem 1.5rem;
  min-height: 100vh;
  max-width: 1400px;
  min-width: 700px;
  margin: 0 auto;
}

.page-title {
  font-size: var(--font-size-heading-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}

/* Search */
.search-container {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  max-width: 400px;
}

.table-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
  min-width: 700px;
}

.projects-table {
  width: 100%;
}

.projects-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}

.pagination-container {
  border-top: 1px solid var(--color-border-light);
  min-height: 3rem;
  padding: 0 1rem;
}

.results-text {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-regular);
}

/* Empty state */
.empty-state {
  padding: 4rem 2rem;
}

.empty-state i {
  font-size: 3rem;
  color: var(--color-text-tertiary);
}

.empty-state-text {
  font-size: var(--font-size-body-m);
  color: var(--color-text-secondary);
  margin: 0;
}

.cursor-pointer {
  cursor: pointer;
}

/* Cell with ellipsis */
.cell-ellipsis {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
