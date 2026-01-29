<!-- pages/tasks/[id].vue -->
<template>
  <div class="page-wrapper task-details-page">
    <!-- Loading State -->
    <div v-if="loading" class="task-card">
      <!-- Header Skeleton -->
      <div class="task-header">
        <div class="task-header-content">
          <div class="flex flex-column gap-2">
            <div class="skeleton skeleton-text" style="width: 280px; height: 22px;"></div>
            <div class="skeleton skeleton-text" style="width: 400px; height: 16px;"></div>
          </div>
        </div>
        <div class="skeleton skeleton-circle" style="width: 2.25rem; height: 2.25rem;"></div>
      </div>

      <!-- Info Grid Skeleton -->
      <div class="task-info-grid">
        <div class="info-item">
          <span class="info-label">Status</span>
          <div class="skeleton skeleton-text" style="width: 100px; height: 32px;"></div>
        </div>
        <div class="info-item">
          <span class="info-label">Priority</span>
          <div class="skeleton skeleton-text" style="width: 100px; height: 32px;"></div>
        </div>
        <div class="info-item">
          <span class="info-label">Due Date</span>
          <div class="skeleton skeleton-text" style="width: 120px; height: 32px;"></div>
        </div>
        <div class="info-item">
          <span class="info-label">Responsible</span>
          <div class="skeleton skeleton-text" style="width: 140px; height: 32px;"></div>
        </div>
        <div class="info-item">
          <span class="info-label">Author</span>
          <div class="skeleton skeleton-text" style="width: 120px; height: 18px;"></div>
        </div>
        <div class="info-item">
          <span class="info-label">Created</span>
          <div class="skeleton skeleton-text" style="width: 140px; height: 18px;"></div>
        </div>
      </div>

      <!-- Sections Skeleton -->
      <div class="task-section">
        <div class="skeleton skeleton-text" style="width: 80px; height: 12px; margin-bottom: 0.5rem;"></div>
        <div class="skeleton skeleton-text" style="width: 200px; height: 16px;"></div>
      </div>

      <!-- Footer Skeleton -->
      <div class="task-footer">
        <div class="skeleton skeleton-text" style="width: 180px; height: 14px;"></div>
      </div>
    </div>

    <!-- Task Content -->
    <div v-else-if="task" class="task-card animate-in">
      <!-- Header -->
      <div class="task-header">
        <div class="task-header-content">
          <!-- Editable Title -->
          <InputText
            v-if="editingTitle"
            ref="titleInputRef"
            v-model="editTitleValue"
            class="title-input"
            @keyup.enter="saveTitle"
            @keyup.escape="cancelTitleEdit"
            @blur="onTitleBlur"
          />
          <h1 v-else class="task-title editable" @click="startTitleEdit">
            {{ task.title }}
          </h1>
          
          <!-- Editable Description -->
          <Textarea
            v-if="editingDescription"
            ref="descInputRef"
            v-model="editDescriptionValue"
            class="description-input"
            rows="2"
            autoResize
            @keyup.escape="cancelDescriptionEdit"
            @blur="onDescriptionBlur"
          />
          <p v-else class="task-description editable" @click="startDescriptionEdit" :class="{ 'placeholder': !task.description }">
            {{ task.description || 'Add description...' }}
          </p>
        </div>
        <div class="task-actions">
          <Button
            icon="pi pi-trash"
            severity="danger"
            size="small"
            text
            rounded
            @click="handleDelete"
            aria-label="Delete"
            class="delete-btn"
          />
        </div>
      </div>

      <!-- Info Grid - Inline Editable -->
      <div class="task-info-grid">
        <!-- Status -->
        <div class="info-item">
          <span class="info-label">Status</span>
          <Dropdown
            :modelValue="task.status"
            @update:modelValue="updateStatus"
            :options="statuses"
            optionLabel="name"
            optionValue="id"
            class="field-dropdown"
            :loading="updatingField === 'status'"
          >
            <template #value>
              <div class="flex align-items-center gap-2">
                <span class="status-dot" :style="{ backgroundColor: task.status_details?.color || task.status_color }"></span>
                <span>{{ task.status_details?.name || task.status_name }}</span>
              </div>
            </template>
            <template #option="{ option }">
              <div class="flex align-items-center gap-2">
                <span class="status-dot" :style="{ backgroundColor: option.color }"></span>
                <span>{{ option.name }}</span>
              </div>
            </template>
          </Dropdown>
        </div>

        <!-- Priority -->
        <div class="info-item">
          <span class="info-label">Priority</span>
          <Dropdown
            :modelValue="task.priority"
            @update:modelValue="updatePriority"
            :options="priorityOptions"
            optionLabel="label"
            optionValue="value"
            class="field-dropdown"
            :loading="updatingField === 'priority'"
          >
            <template #value>
              <div class="flex align-items-center gap-2">
                <span class="priority-dot" :style="{ backgroundColor: getTaskPriorityColor(task.priority) }"></span>
                <span>{{ getTaskPriorityLabel(task.priority) }}</span>
              </div>
            </template>
            <template #option="{ option }">
              <div class="flex align-items-center gap-2">
                <span class="priority-dot" :style="{ backgroundColor: option.color }"></span>
                <span>{{ option.label }}</span>
              </div>
            </template>
          </Dropdown>
        </div>

        <!-- Due Date -->
        <div class="info-item">
          <span class="info-label">Due Date</span>
          <Calendar
            :modelValue="task.due_date ? new Date(task.due_date) : null"
            @update:modelValue="updateDueDate"
            dateFormat="M dd, yy"
            placeholder="Set due date"
            class="field-calendar"
            showClear
          />
        </div>

        <!-- Responsible -->
        <div class="info-item">
          <span class="info-label">Responsible</span>
          <Dropdown
            :modelValue="task.responsible_user"
            @update:modelValue="updateResponsibleUser"
            :options="filteredUsers"
            optionLabel="display_name"
            optionValue="id"
            placeholder="Unassigned"
            class="field-dropdown"
            showClear
            filter
            filterPlaceholder="Search..."
            :loading="updatingField === 'responsible_user'"
          >
            <template #value="{ value }">
              <span v-if="value">{{ getResponsibleName(value) }}</span>
              <span v-else class="text-muted">Unassigned</span>
            </template>
          </Dropdown>
        </div>

        <!-- Author (read-only) -->
        <div class="info-item">
          <span class="info-label">Author</span>
          <span class="info-value">{{ task.author_details?.full_name || '—' }}</span>
        </div>

        <!-- Created (read-only) -->
        <div class="info-item">
          <span class="info-label">Created</span>
          <span class="info-value text-secondary">{{ formatDateTime(task.created_at) }}</span>
        </div>
      </div>

      <!-- Linked Items -->
      <div v-if="hasLinkedItems" class="task-section">
        <span class="section-label">Linked to</span>
        <div class="linked-items">
          <span v-if="task.linked_order_autoid" class="linked-item">
            <i class="pi pi-shopping-cart"></i>
            Order {{ task.linked_order_autoid }}
          </span>
          <span v-if="task.linked_proposal_autoid" class="linked-item">
            <i class="pi pi-file"></i>
            Proposal {{ task.linked_proposal_autoid }}
          </span>
          <span v-if="task.linked_customer_autoid" class="linked-item">
            <i class="pi pi-user"></i>
            Customer {{ task.linked_customer_autoid }}
          </span>
        </div>
      </div>

      <!-- Attachments -->
      <div class="task-section">
        <span class="section-label">Attachments</span>
        <div class="attachments-empty">
          <span>No attachments</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="task-footer">
        <span>Last updated {{ formatDateTime(task.updated_at) }}</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="flex flex-column align-items-center justify-content-center gap-3 error-container">
      <i class="pi pi-exclamation-circle" style="font-size: 3rem; color: var(--color-text-tertiary);"></i>
      <p>Task not found</p>
      <Button label="Back to Tasks" @click="router.push('/tasks')" />
    </div>

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

    <!-- Edit Task Modal -->
    <TaskModal
      v-model:visible="showEditModal"
      mode="edit"
      :initial-task="taskAsListItem"
      :statuses="statuses"
      :users="users"
      @success="onTaskSaved"
      @statusesUpdated="loadStatuses"
    />
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import { until } from "@vueuse/core";
import { storeToRefs } from "pinia";
import type { Task, TaskStatus, User } from "~/types";
import { useProjectsStore } from "~/stores/projects";
import { useUiStore } from "~/stores/ui";
import { USER_ROLES, TASK_PRIORITY, getTaskPriorityLabel, getTaskPriorityColor } from "~/utils/constants";
import { formatDate } from "~/utils/formatters";
import TaskModal from "~/components/tasks/TaskModal.vue";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const router = useRouter();
const tasksApi = useTasks();
const usersApi = useUsers();
const toast = useToast();
const auth = useAuth();

// Store management
const projectsStore = useProjectsStore();
const { selectedProjectId, loading: projectsLoading } = storeToRefs(projectsStore);

const uiStore = useUiStore();

const isSuperAdmin = computed(() => auth.user.value?.role === USER_ROLES.SUPERADMIN);

// Task ID from route
const taskId = computed(() => parseInt(route.params.id as string, 10));

// Task state
const task = ref<Task | null>(null);
const loading = ref(true);
const showDeleteDialog = ref(false);
const deleteLoading = ref(false);

// Edit modal state
const showEditModal = ref(false);
const statuses = ref<TaskStatus[]>([]);
const users = ref<User[]>([]);

// Inline editing state
const updatingField = ref<string | null>(null);
const editingTitle = ref(false);
const editTitleValue = ref('');
const editingDescription = ref(false);
const editDescriptionValue = ref('');
const titleInputRef = ref<HTMLInputElement | null>(null);
const descInputRef = ref<HTMLTextAreaElement | null>(null);

// Computed
const hasLinkedItems = computed(() => {
  return task.value?.linked_order_autoid || 
         task.value?.linked_proposal_autoid || 
         task.value?.linked_customer_autoid;
});

// Convert Task to TaskListItem format for the modal (with linked items)
const taskAsListItem = computed(() => {
  if (!task.value) return null;
  return {
    id: task.value.id,
    project: task.value.project,
    title: task.value.title,
    status: task.value.status,
    status_name: task.value.status_name,
    status_color: task.value.status_color,
    priority: task.value.priority,
    due_date: task.value.due_date,
    author: task.value.author,
    author_name: task.value.author_name,
    responsible_user: task.value.responsible_user,
    responsible_user_name: task.value.responsible_user_name,
    attachment_count: task.value.attachment_count,
    created_at: task.value.created_at,
    updated_at: task.value.updated_at,
    // Linked items
    linked_order_autoid: task.value.linked_order_autoid,
    linked_proposal_autoid: task.value.linked_proposal_autoid,
    linked_customer_autoid: task.value.linked_customer_autoid,
    linked_order_details: task.value.linked_order_details,
    linked_proposal_details: task.value.linked_proposal_details,
    linked_customer_details: task.value.linked_customer_details,
  };
});

// Priority options for dropdown
const priorityOptions = computed(() => [
  { label: 'Low', value: TASK_PRIORITY.LOW, color: getTaskPriorityColor(TASK_PRIORITY.LOW) },
  { label: 'Medium', value: TASK_PRIORITY.MEDIUM, color: getTaskPriorityColor(TASK_PRIORITY.MEDIUM) },
  { label: 'High', value: TASK_PRIORITY.HIGH, color: getTaskPriorityColor(TASK_PRIORITY.HIGH) },
  { label: 'Urgent', value: TASK_PRIORITY.URGENT, color: getTaskPriorityColor(TASK_PRIORITY.URGENT) },
]);

// Filtered users for responsible dropdown
const filteredUsers = computed(() => {
  return users.value
    .filter(u => u.role !== USER_ROLES.SUPERADMIN)
    .filter(u => u.first_name?.trim() || u.last_name?.trim() || u.email?.trim())
    .map(u => ({
      ...u,
      display_name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || `User #${u.id}`,
    }));
});

function getResponsibleName(userId: number): string {
  const user = filteredUsers.value.find(u => u.id === userId);
  return user?.display_name || task.value?.responsible_user_details?.full_name || '—';
}

// Update page header with task info
watch(task, (newTask) => {
  if (newTask) {
    uiStore.setPageHeader({
      title: `Tasks / #${taskId.value}`,
      subtitle: newTask.title || null,
      showBack: true,
      backPath: '/tasks',
    });
  }
}, { immediate: true });

// Clear page header when leaving
onUnmounted(() => {
  uiStore.clearPageHeader();
});

// Load task on mount
onMounted(async () => {
  if (isSuperAdmin.value && projectsLoading.value) {
    await until(projectsLoading).toBe(false);
  }
  
  // Load task and supporting data in parallel
  await Promise.all([loadTask(), loadStatuses(), loadUsers()]);
});

async function loadStatuses() {
  try {
    const params: any = { limit: 100, ordering: 'order' };
    if (selectedProjectId.value !== null) {
      params.project_id = selectedProjectId.value;
    }
    const data = await tasksApi.listStatuses(params);
    statuses.value = data.results;
  } catch (error) {
    console.error('Failed to load statuses:', error);
  }
}

async function loadUsers() {
  try {
    const data = await usersApi.list({ limit: 100 });
    users.value = data.results;
  } catch (error) {
    console.error('Failed to load users:', error);
  }
}

// Watch for task ID changes
watch(taskId, () => {
  loadTask();
});

// Watch for project changes (superadmin only)
watch(selectedProjectId, () => {
  if (isSuperAdmin.value) {
    loadTask();
  }
});

async function loadTask() {
  await useApiCall({
    fn: () => tasksApi.getById(taskId.value),
    errorMessage: 'Failed to Load Task',
    loading,
    toast,
    onSuccess: (data) => {
      task.value = data;
    },
    onError: () => {
      task.value = null;
    },
  });
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function formatDateTime(isoString: string): string {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

function handleEdit() {
  showEditModal.value = true;
}

function onTaskSaved() {
  loadTask();
}

function handleDelete() {
  showDeleteDialog.value = true;
}

async function confirmDelete() {
  if (!task.value) return;

  deleteLoading.value = true;
  try {
    await tasksApi.remove(task.value.id);
    toast.showSuccess('Task deleted successfully');
    router.push('/tasks');
  } catch (error) {
    toast.showError(error, 'Failed to Delete Task');
  } finally {
    deleteLoading.value = false;
  }
}

// ===== Inline Editing Functions =====

async function updateField(field: string, value: any) {
  if (!task.value) return;
  
  updatingField.value = field;
  try {
    const updated = await tasksApi.update(task.value.id, { [field]: value });
    task.value = updated;
  } catch (error) {
    toast.showError(error, 'Failed to update task');
  } finally {
    updatingField.value = null;
  }
}

async function updateStatus(statusId: number) {
  await updateField('status', statusId);
}

async function updatePriority(priority: string) {
  await updateField('priority', priority);
}

async function updateDueDate(date: Date | null) {
  const value = date ? date.toISOString().split('T')[0] : null;
  await updateField('due_date', value);
}

async function updateResponsibleUser(userId: number | null) {
  await updateField('responsible_user', userId);
}

// Title editing
function startTitleEdit() {
  editTitleValue.value = task.value?.title || '';
  editingTitle.value = true;
  nextTick(() => {
    const input = titleInputRef.value?.$el || titleInputRef.value;
    if (input) input.focus();
  });
}

function cancelTitleEdit() {
  editingTitle.value = false;
  editTitleValue.value = '';
}

async function saveTitle() {
  if (!task.value || !editTitleValue.value.trim()) {
    editingTitle.value = false;
    return;
  }
  
  if (editTitleValue.value.trim() !== task.value.title) {
    await updateField('title', editTitleValue.value.trim());
  }
  editingTitle.value = false;
}

function onTitleBlur() {
  // Small delay to allow escape key to cancel first
  setTimeout(() => {
    if (editingTitle.value) {
      saveTitle();
    }
  }, 100);
}

// Description editing
function startDescriptionEdit() {
  editDescriptionValue.value = task.value?.description || '';
  editingDescription.value = true;
  nextTick(() => {
    const input = descInputRef.value?.$el || descInputRef.value;
    if (input) input.focus();
  });
}

function cancelDescriptionEdit() {
  editingDescription.value = false;
  editDescriptionValue.value = '';
}

async function saveDescription() {
  if (!task.value) {
    editingDescription.value = false;
    return;
  }
  
  const newValue = editDescriptionValue.value.trim();
  if (newValue !== (task.value.description || '')) {
    await updateField('description', newValue || null);
  }
  editingDescription.value = false;
}

function onDescriptionBlur() {
  // Small delay to allow escape key to cancel first
  setTimeout(() => {
    if (editingDescription.value) {
      saveDescription();
    }
  }, 100);
}
</script>

<style scoped>
.task-details-page {
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.task-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.task-card:hover {
  border-color: var(--color-border-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Header */
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border-light);
}

.task-header-content {
  flex: 1;
  min-width: 0;
}

/* Editable Title */
.task-title {
  font-size: var(--font-size-body-l);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
}

.task-title.editable {
  cursor: pointer;
  padding: 0.25rem 0.50rem;
  margin: -0.35rem -0.45rem;
  border-radius: var(--radius-sm);
  transition: background-color 0.15s;
}

.task-title.editable:hover {
  background: var(--surface-100);
}

.title-input {
  width: calc(100% + 1rem);
  font-size: var(--font-size-body-l) !important;
  font-weight: var(--font-weight-semibold) !important;
  padding: 0.25rem 0.5rem !important;
  margin: -0.25rem -0.5rem;
}

/* Editable Description */
.task-description {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
  margin: 0.5rem 0 0 0;
  line-height: 1.5;
}

.task-description.editable {
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  margin: 0.25rem -0.5rem 0 -0.5rem;
  border-radius: var(--radius-sm);
  transition: background-color 0.15s;
}

.task-description.editable:hover {
  background: var(--surface-100);
}

.task-description.placeholder {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.description-input {
  width: calc(100% + 1rem);
  font-size: var(--font-size-body-s) !important;
  padding: 0.25rem 0.5rem !important;
  margin: 0.25rem -0.5rem 0 -0.5rem;
}

/* Actions */
.task-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.delete-btn {
  width: 2.25rem !important;
  height: 2.25rem !important;
}

/* Info Grid */
.task-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.875rem 1rem;
  background: white;
}

.info-label {
  font-size: 11px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-value {
  font-size: var(--font-size-body-s);
  color: var(--color-text-primary);
}

.info-value.text-secondary {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-xs);
}

.info-value.overdue {
  color: var(--color-danger);
}

.status-value {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

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

.text-muted {
  color: var(--color-text-tertiary);
}

/* Field Dropdowns & Calendar */
.field-dropdown {
  width: 100%;
}

.field-dropdown :deep(.p-dropdown-label) {
  padding: 0.375rem 0.5rem;
  font-size: var(--font-size-body-s);
}

.field-calendar {
  width: 100%;
}

.field-calendar :deep(.p-inputtext) {
  padding: 0.375rem 0.5rem;
  font-size: var(--font-size-body-s);
}

@media (max-width: 600px) {
  .task-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Sections */
.task-section {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border-light);
}

.section-label {
  font-size: 11px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: block;
  margin-bottom: 0.5rem;
}

/* Linked Items */
.linked-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.linked-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--font-size-body-xs);
  color: var(--color-text-secondary);
}

.linked-item i {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

/* Attachments */
.attachments-empty {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
}

/* Footer */
.task-footer {
  padding: 0.75rem 1.25rem;
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
  background: var(--surface-50);
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
}

.error-container {
  padding: 4rem 2rem;
}

.error-container p {
  font-size: var(--font-size-body-m);
  color: var(--color-text-secondary);
  margin: 0;
}
</style>
