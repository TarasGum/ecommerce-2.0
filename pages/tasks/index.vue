<!-- pages/tasks/index.vue -->
<template>
  <div class="page-wrapper tasks-page">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-3">
      <h1 class="page-title">Tasks</h1>
      <Button
        label="Create Task"
        icon="pi pi-plus"
        severity="success"
        @click="openCreateModal"
      />
    </div>

    <!-- Search Row -->
    <div class="flex gap-2 mb-3">
      <IconField iconPosition="left" class="search-field">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="searchInput"
          placeholder="Search tasks..."
          class="search-input"
        />
      </IconField>
      <Button
        :icon="showFilters ? 'pi pi-filter-slash' : 'pi pi-filter'"
        :label="showFilters ? 'Hide Filters' : 'Filters'"
        severity="secondary"
        @click="showFilters = !showFilters"
      />
    </div>

    <!-- Filters Panel -->
    <div v-if="showFilters" class="filters-panel mb-3">
      <div class="filters-content">
        <div class="filters-grid">
          <div class="filter-field">
            <label class="filter-label">Status</label>
            <Dropdown
              :modelValue="filters.status"
              @update:modelValue="(val) => setFilter('status', val || null)"
              :options="statusOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="All Statuses"
              class="w-full"
              showClear
            >
              <template #option="{ option }">
                <div class="flex align-items-center gap-2">
                  <span class="status-dot" :style="{ backgroundColor: option.color }"></span>
                  <span>{{ option.name }}</span>
                </div>
              </template>
              <template #value="{ value, placeholder }">
                <div v-if="value" class="flex align-items-center gap-2">
                  <span class="status-dot" :style="{ backgroundColor: statusOptions.find(s => s.id === value)?.color }"></span>
                  <span>{{ statusOptions.find(s => s.id === value)?.name }}</span>
                </div>
                <span v-else>{{ placeholder }}</span>
              </template>
            </Dropdown>
          </div>

          <div class="filter-field">
            <label class="filter-label">Priority</label>
            <Dropdown
              :modelValue="filters.priority"
              @update:modelValue="(val) => setFilter('priority', val || null)"
              :options="priorityOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="All Priorities"
              class="w-full"
              showClear
            >
              <template #option="{ option }">
                <div class="flex align-items-center gap-2">
                  <span class="priority-dot" :style="{ backgroundColor: option.color }"></span>
                  <span>{{ option.label }}</span>
                </div>
              </template>
              <template #value="{ value, placeholder }">
                <div v-if="value" class="flex align-items-center gap-2">
                  <span class="priority-dot" :style="{ backgroundColor: getTaskPriorityColor(value) }"></span>
                  <span>{{ getTaskPriorityLabel(value) }}</span>
                </div>
                <span v-else>{{ placeholder }}</span>
              </template>
            </Dropdown>
          </div>

          <div class="filter-field">
            <label class="filter-label">Responsible</label>
            <Dropdown
              :modelValue="filters.responsible_user"
              @update:modelValue="(val) => setFilter('responsible_user', val || null)"
              :options="projectUsers"
              optionLabel="full_name"
              optionValue="id"
              placeholder="All Users"
              class="w-full"
              showClear
              filter
              filterPlaceholder="Search users..."
            >
              <template #option="{ option }">
                <span>{{ option.first_name }} {{ option.last_name }}</span>
              </template>
            </Dropdown>
          </div>

          <div class="filter-field">
            <label class="filter-label">Due Date From</label>
            <Calendar
              :modelValue="filters.due_date_from"
              @update:modelValue="(val) => setFilter('due_date_from', val instanceof Date ? val : null)"
              dateFormat="M dd, yy"
              placeholder="Select date"
              class="w-full"
              showClear
            />
          </div>

          <div class="filter-field">
            <label class="filter-label">Due Date To</label>
            <Calendar
              :modelValue="filters.due_date_to"
              @update:modelValue="(val) => setFilter('due_date_to', val instanceof Date ? val : null)"
              dateFormat="M dd, yy"
              placeholder="Select date"
              class="w-full"
              showClear
            />
          </div>
        </div>

        <div v-if="hasFilters" class="flex justify-content-end mt-3">
          <Button
            label="Clear Filters"
            icon="pi pi-times"
            severity="secondary"
            text
            size="small"
            @click="clearFilters"
          />
        </div>
      </div>
    </div>

    <!-- Tasks Table Card -->
    <div class="table-card">
      <!-- Empty State -->
      <div v-if="!loading && tasks.length === 0" class="flex flex-column align-items-center justify-content-center gap-3 empty-state">
        <i class="pi pi-inbox"></i>
        <p class="empty-state-text">
          {{ hasActiveSearch ? 'No tasks match your filters' : 'No tasks found' }}
        </p>
        <Button
          v-if="hasActiveSearch"
          label="Clear Filters"
          severity="secondary"
          size="small"
          @click="clearAllFilters"
        />
        <Button
          v-else
          label="Create Task"
          icon="pi pi-plus"
          severity="primary"
          size="small"
          @click="openCreateModal"
        />
      </div>

      <!-- Tasks Table -->
      <DataTable
        v-else
        :value="loading ? skeletonRows : tasks"
        :class="['data-table tasks-table', { loading: loading }]"
        stripedRows
        dataKey="id"
        :sortField="primeVueSortField || undefined"
        :sortOrder="primeVueSortOrder"
        @sort="handlePrimeVueSort"
        @row-click="onRowClick"
        :pt="{ bodyRow: { class: 'cursor-pointer' } }"
        tableStyle="table-layout: fixed"
      >
        <!-- Task Column -->
        <Column
          field="title"
          header="Task"
          sortable
          :style="{ width: '25%', minWidth: '200px' }"
          :pt="{ sort: { class: 'cursor-pointer' } }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 180px;"></div>
            <span v-else class="cell-name">{{ data.title || '—' }}</span>
          </template>
        </Column>

        <!-- Responsible Column -->
        <Column
          field="responsible_user_name"
          header="Responsible"
          sortable
          :style="{ width: '15%', minWidth: '120px' }"
          :pt="{ sort: { class: 'cursor-pointer' } }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 100px;"></div>
            <span v-else class="cell-secondary">{{ data.responsible_user_name || '—' }}</span>
          </template>
        </Column>

        <!-- Date Created Column -->
        <Column
          field="created_at"
          header="Date Created"
          sortable
          :style="{ width: '12%', minWidth: '110px' }"
          :pt="{ sort: { class: 'cursor-pointer' } }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 90px;"></div>
            <span v-else class="cell-date">{{ formatDate(data.created_at) }}</span>
          </template>
        </Column>

        <!-- Due Date Column -->
        <Column
          field="due_date"
          header="Due Date"
          sortable
          :style="{ width: '12%', minWidth: '110px' }"
          :pt="{ sort: { class: 'cursor-pointer' } }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-text" style="width: 90px;"></div>
            <span v-else class="cell-date" :class="{ 'text-danger': isOverdue(data.due_date) }">
              {{ formatDate(data.due_date) }}
            </span>
          </template>
        </Column>

        <!-- Priority Column -->
        <Column
          field="priority"
          header="Priority"
          sortable
          :style="{ width: '10%', minWidth: '100px' }"
          :pt="{ sort: { class: 'cursor-pointer' } }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-button" style="width: 60px;"></div>
            <Tag
              v-else
              :value="getTaskPriorityLabel(data.priority)"
              :style="{ backgroundColor: getTaskPriorityColor(data.priority), color: 'white' }"
            />
          </template>
        </Column>

        <!-- Status Column -->
        <Column
          field="status_name"
          header="Status"
          :style="{ width: '15%', minWidth: '140px' }"
        >
          <template #body="{ data }">
            <div v-if="loading" class="skeleton skeleton-button" style="width: 100px;"></div>
            <Dropdown
              v-else
              :modelValue="data.status"
              @update:modelValue="(val) => handleStatusChange(data, val)"
              :options="statusOptions"
              optionLabel="name"
              optionValue="id"
              class="status-dropdown"
              @click.stop
            >
              <template #value>
                <div class="flex align-items-center gap-2">
                  <span class="status-dot" :style="{ backgroundColor: data.status_color }"></span>
                  <span>{{ data.status_name }}</span>
                </div>
              </template>
              <template #option="{ option }">
                <div class="flex align-items-center gap-2">
                  <span class="status-dot" :style="{ backgroundColor: option.color }"></span>
                  <span>{{ option.name }}</span>
                </div>
              </template>
            </Dropdown>
          </template>
        </Column>

        <!-- Actions Column -->
        <Column 
          header="Actions" 
          :style="{ width: '80px', minWidth: '80px', maxWidth: '80px', textAlign: 'center' }"
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
    <Menu ref="menuRef" :model="menuItems" :popup="true" />

    <!-- Task Modal -->
    <TaskModal
      v-model:visible="showTaskModal"
      :mode="taskModalMode"
      :initial-task="selectedTask"
      :statuses="statusOptions"
      :users="projectUsers"
      @success="onTaskSaved"
      @statusesUpdated="loadStatuses"
    />

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteDialog"
      :modal="true"
      :closable="true"
      :draggable="false"
      class="modal-sm"
    >
      <template #header>
        <h2 class="modal-title">Delete Task</h2>
      </template>

      <div class="modal-content">
        <p>Are you sure you want to delete this task?</p>
        <p class="text-secondary">This action cannot be undone.</p>
      </div>

      <template #footer>
        <Button label="Cancel" severity="secondary" @click="showDeleteDialog = false" />
        <Button label="Delete" severity="danger" @click="confirmDelete" :loading="deleteLoading" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Paginator from "primevue/paginator";
import Menu from "primevue/menu";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import { until } from "@vueuse/core";
import { storeToRefs } from "pinia";
import type { TaskListItem, TaskStatus, User, PrimeVuePageEvent, PrimeVueRowEvent } from "~/types";
import { formatDate } from "~/utils/formatters";
import { 
  PAGINATION_DEFAULTS, 
  DEBOUNCE_MS, 
  USER_ROLES,
  TASK_PRIORITY,
  getTaskPriorityLabel,
  getTaskPriorityColor,
  type TaskPriority
} from "~/utils/constants";
import { useProjectsStore } from "~/stores/projects";
import TaskModal from "~/components/tasks/TaskModal.vue";

definePageMeta({ middleware: "auth" });

const tasksApi = useTasks();
const usersApi = useUsers();
const toast = useToast();
const router = useRouter();
const auth = useAuth();

// Store management
const projectsStore = useProjectsStore();
const { selectedProjectId, loading: projectsLoading } = storeToRefs(projectsStore);

const isSuperAdmin = computed(() => auth.user.value?.role === USER_ROLES.SUPERADMIN);

// URL-based state management
const { page, pageSize, offset, setPage, resetPage } = useUrlPagination({
  defaultPageSize: PAGINATION_DEFAULTS.PAGE_SIZE_DEFAULT,
});

const { searchInput, search, clearSearch } = useUrlSearch({
  param: 'search',
  debounce: DEBOUNCE_MS.SEARCH_DEFAULT,
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

// URL-based filters
const { filters, setFilter, resetAllFilters, hasAnyFilter } = useUrlFilters<{
  status: number | null;
  priority: TaskPriority | null;
  responsible_user: number | null;
  due_date_from: Date | null;
  due_date_to: Date | null;
}>({
  status: {
    param: 'status',
    defaultValue: null,
    parse: (val: string) => val ? parseInt(val, 10) : null,
    serialize: (val) => val?.toString() || '',
  },
  priority: {
    param: 'priority',
    defaultValue: null,
  },
  responsible_user: {
    param: 'responsible_user',
    defaultValue: null,
    parse: (val: string) => val ? parseInt(val, 10) : null,
    serialize: (val) => val?.toString() || '',
  },
  due_date_from: {
    param: 'due_from',
    defaultValue: null,
    parse: (val: string) => val ? new Date(val) : null,
    serialize: (val: Date | null) => val ? val.toISOString().split('T')[0] : '',
  },
  due_date_to: {
    param: 'due_to',
    defaultValue: null,
    parse: (val: string) => val ? new Date(val) : null,
    serialize: (val: Date | null) => val ? val.toISOString().split('T')[0] : '',
  },
});

// Local UI state
const tasks = ref<TaskListItem[]>([]);
const loading = ref(true);
const totalRecords = ref(0);
const menuRef = ref();
const selectedTask = ref<TaskListItem | null>(null);
const showFilters = ref(false);
const showTaskModal = ref(false);
const taskModalMode = ref<'create' | 'edit'>('create');
const showDeleteDialog = ref(false);
const deleteLoading = ref(false);

// Statuses and users for filters/dropdowns
const statusOptions = ref<TaskStatus[]>([]);
const allUsers = ref<User[]>([]);

// Computed
const projectUsers = computed(() => {
  // Filter out superadmins and filter by selected project for superadmins
  let users = allUsers.value.filter(u => u.role !== USER_ROLES.SUPERADMIN);
  
  // If superadmin has a project selected, only show users from that project
  if (isSuperAdmin.value && selectedProjectId.value !== null) {
    users = users.filter(u => u.project === selectedProjectId.value);
  }
  
  return users;
});

const showPagination = computed(() => totalRecords.value > pageSize.value);

const paginationRange = computed(() => {
  if (totalRecords.value === 0) {
    return { start: 0, end: 0, total: 0 };
  }
  const start = offset.value + 1;
  const end = Math.min(offset.value + pageSize.value, totalRecords.value);
  return { start, end, total: totalRecords.value };
});

const hasFilters = computed(() => {
  return filters.value.status !== null ||
    filters.value.priority !== null ||
    filters.value.responsible_user !== null ||
    filters.value.due_date_from !== null ||
    filters.value.due_date_to !== null;
});

const hasActiveSearch = computed(() => {
  return !!search.value || hasFilters.value;
});

// Priority options for dropdown
const priorityOptions = computed(() => [
  { label: 'Low', value: TASK_PRIORITY.LOW, color: getTaskPriorityColor(TASK_PRIORITY.LOW) },
  { label: 'Medium', value: TASK_PRIORITY.MEDIUM, color: getTaskPriorityColor(TASK_PRIORITY.MEDIUM) },
  { label: 'High', value: TASK_PRIORITY.HIGH, color: getTaskPriorityColor(TASK_PRIORITY.HIGH) },
  { label: 'Urgent', value: TASK_PRIORITY.URGENT, color: getTaskPriorityColor(TASK_PRIORITY.URGENT) },
]);

// Skeleton rows for loading state
const skeletonRows = computed(() => {
  return Array.from({ length: pageSize.value }, (_, i) => ({
    id: `skeleton-${i}`,
    title: '',
    responsible_user_name: '',
    created_at: '',
    due_date: null,
    priority: 'low',
    status: 0,
    status_name: '',
    status_color: '',
  }));
});

// Menu items
const menuItems = computed(() => [
  {
    label: "Edit",
    icon: "pi pi-pencil",
    command: () => openEditModal(),
  },
  {
    label: "Delete",
    icon: "pi pi-trash",
    command: () => openDeleteDialog(),
  },
]);

// Helper functions
function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

// Load data on mount
onMounted(async () => {
  // Wait for projects to load if user is superadmin
  if (isSuperAdmin.value && projectsLoading.value) {
    await until(projectsLoading).toBe(false);
  }
  
  // Load statuses and users first
  await Promise.all([loadStatuses(), loadUsers()]);
  
  // Then load tasks
  loadTasks();
});

// Watch for URL state changes and reload tasks
watch(
  [page, pageSize, search, sortOrdering, 
   () => filters.value.status,
   () => filters.value.priority,
   () => filters.value.responsible_user,
   () => filters.value.due_date_from,
   () => filters.value.due_date_to],
  () => {
    loadTasks();
  }
);

// Watch for search/filter changes and reset to first page
watch(
  [search, 
   () => filters.value.status,
   () => filters.value.priority,
   () => filters.value.responsible_user,
   () => filters.value.due_date_from,
   () => filters.value.due_date_to],
  (newVals, oldVals) => {
    if (oldVals !== undefined && JSON.stringify(oldVals) !== JSON.stringify(newVals)) {
      resetPage();
    }
  }
);

// Watch for project changes
watch(
  selectedProjectId,
  (newVal, oldVal) => {
    if (isSuperAdmin.value && oldVal !== undefined && oldVal !== null) {
      resetPage();
      Promise.all([loadStatuses(), loadUsers()]).then(() => loadTasks());
    }
  }
);

async function loadTasks() {
  const params: any = {
    limit: pageSize.value,
    offset: offset.value,
  };

  if (search.value) {
    params.search = search.value;
  }

  if (filters.value.status !== null) {
    params.status = filters.value.status;
  }

  if (filters.value.priority !== null) {
    params.priority = filters.value.priority;
  }

  if (filters.value.responsible_user !== null) {
    params.responsible_user = filters.value.responsible_user;
  }

  if (filters.value.due_date_from) {
    params.due_date_from = filters.value.due_date_from.toISOString().split('T')[0];
  }

  if (filters.value.due_date_to) {
    params.due_date_to = filters.value.due_date_to.toISOString().split('T')[0];
  }

  if (sortOrdering.value) {
    params.ordering = sortOrdering.value;
  }

  if (isSuperAdmin.value && selectedProjectId.value !== null) {
    params.project_id = selectedProjectId.value;
  }

  await useApiCall({
    fn: () => tasksApi.list(params),
    errorMessage: 'Failed to Load Tasks',
    loading,
    toast,
    onSuccess: (data) => {
      tasks.value = data.results;
      totalRecords.value = data.count;
    },
  });
}

async function loadStatuses() {
  try {
    const params: any = { limit: 100, ordering: 'order' };
    if (selectedProjectId.value !== null) {
      params.project_id = selectedProjectId.value;
    }
    const data = await tasksApi.listStatuses(params);
    statusOptions.value = data.results;
  } catch (error) {
    console.error('Failed to load statuses:', error);
  }
}

async function loadUsers() {
  try {
    const data = await usersApi.list({ limit: 100 });
    allUsers.value = data.results;
  } catch (error) {
    console.error('Failed to load users:', error);
  }
}

function onPageChange(event: PrimeVuePageEvent) {
  const newPage = Math.floor(event.first / event.rows) + 1;
  setPage(newPage);
}

function toggleMenu(event: Event, task: TaskListItem) {
  event.stopPropagation();
  selectedTask.value = task;
  menuRef.value.toggle(event);
}

function onRowClick(event: PrimeVueRowEvent<TaskListItem>) {
  if (!event.data || loading.value) return;
  const target = event.originalEvent.target as HTMLElement;
  if (
    target.closest('.p-dropdown') ||
    target.closest('.p-button') ||
    target.closest('[role="menuitem"]')
  ) {
    return;
  }
  router.push(`/tasks/${event.data.id}`);
}

function openCreateModal() {
  taskModalMode.value = 'create';
  selectedTask.value = null;
  showTaskModal.value = true;
}

function openEditModal() {
  taskModalMode.value = 'edit';
  showTaskModal.value = true;
}

function openDeleteDialog() {
  showDeleteDialog.value = true;
}

async function confirmDelete() {
  if (!selectedTask.value) return;

  deleteLoading.value = true;
  try {
    await tasksApi.remove(selectedTask.value.id);
    toast.showSuccess('Task deleted successfully');
    showDeleteDialog.value = false;
    loadTasks();
  } catch (error) {
    toast.showError(error, 'Failed to Delete Task');
  } finally {
    deleteLoading.value = false;
  }
}

async function handleStatusChange(task: TaskListItem, newStatusId: number) {
  if (task.status === newStatusId) return;

  try {
    await tasksApi.update(task.id, { status: newStatusId });
    // Update local state
    task.status = newStatusId;
    const status = statusOptions.value.find(s => s.id === newStatusId);
    if (status) {
      task.status_name = status.name;
      task.status_color = status.color;
    }
    toast.showSuccess('Status updated');
  } catch (error) {
    toast.showError(error, 'Failed to Update Status');
    // Reload to restore correct state
    loadTasks();
  }
}

function onTaskSaved() {
  loadTasks();
}

function clearFilters() {
  resetAllFilters();
}

function clearAllFilters() {
  clearSearch();
  resetAllFilters();
}
</script>

<style scoped>
.tasks-page {
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

.search-field {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
}

.filters-panel {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
}

.filters-content {
  padding: 1rem 1.25rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 1024px) {
  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.filter-label {
  font-size: var(--font-size-body-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.table-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
  min-width: 700px;
}

.tasks-table {
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
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

/* Status indicator */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Status dropdown in table */
.status-dropdown {
  width: 100%;
  min-width: 120px;
}

.status-dropdown :deep(.p-dropdown-label) {
  padding: 0.375rem 0.5rem;
}

/* Text colors */
.text-danger {
  color: var(--color-danger) !important;
}

.text-secondary {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-s);
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
</style>
