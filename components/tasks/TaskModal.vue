<!-- components/tasks/TaskModal.vue -->
<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :closable="true"
    :draggable="false"
    class="modal-lg task-modal"
  >
    <template #header>
      <h2 class="modal-title">{{ mode === 'create' ? 'Create Task' : 'Edit Task' }}</h2>
    </template>

    <Form
      @submit="handleSubmit"
      :validation-schema="schema"
      :initial-values="initialFormValues"
      class="task-form"
    >
      <div class="form-grid">
        <!-- Left Column -->
        <div class="form-column">
          <!-- Task Name -->
          <div class="flex flex-column mb-3">
            <label for="title" class="field-label mb-2">Task Name <span class="required">*</span></label>
            <Field v-slot="{ field, errorMessage }" name="title">
              <InputText
                id="title"
                v-bind="field"
                placeholder="Enter task name"
                class="w-full"
                :class="{ 'p-invalid': errorMessage }"
              />
            </Field>
            <ErrorMessage name="title" class="p-error text-sm mt-1" />
          </div>

          <!-- Description -->
          <div class="flex flex-column mb-3">
            <label for="description" class="field-label mb-2">Description</label>
            <Field v-slot="{ field, errorMessage }" name="description">
              <Textarea
                id="description"
                v-bind="field"
                placeholder="Enter description"
                rows="3"
                class="w-full"
                :class="{ 'p-invalid': errorMessage }"
              />
            </Field>
            <ErrorMessage name="description" class="p-error text-sm mt-1" />
          </div>

          <!-- Status with Inline Management -->
          <div ref="statusFieldRef" class="flex flex-column mb-3 status-field-wrapper">
            <div class="flex justify-content-between align-items-center mb-2">
              <label for="status" class="field-label">Status <span class="required">*</span></label>
              <Button
                type="button"
                :icon="showStatusManager ? 'pi pi-chevron-up' : 'pi pi-cog'"
                :label="showStatusManager ? 'Hide' : 'Manage'"
                text
                size="small"
                @click="showStatusManager = !showStatusManager"
              />
            </div>
            
            <Field v-slot="{ field, errorMessage }" name="status">
              <Dropdown
                id="status"
                :modelValue="field.value"
                @update:modelValue="field.onChange"
                :options="localStatuses"
                optionLabel="name"
                optionValue="id"
                placeholder="Select status"
                class="w-full"
                :class="{ 'p-invalid': errorMessage }"
                @show="showStatusManager = false"
              >
                <template #value="{ value, placeholder }">
                  <div v-if="value" class="flex align-items-center gap-2">
                    <span class="status-dot" :style="{ backgroundColor: getStatusColor(value) }"></span>
                    <span>{{ getStatusName(value) }}</span>
                  </div>
                  <span v-else>{{ placeholder }}</span>
                </template>
                <template #option="{ option }">
                  <div class="flex align-items-center gap-2">
                    <span class="status-dot" :style="{ backgroundColor: option.color }"></span>
                    <span>{{ option.name }}</span>
                    <Tag v-if="option.is_default" value="Default" severity="secondary" class="ml-auto" style="font-size: 0.65rem; padding: 0.1rem 0.3rem;" />
                  </div>
                </template>
              </Dropdown>
            </Field>
            <ErrorMessage name="status" class="p-error text-sm mt-1" />

            <!-- Inline Status Manager (Absolute positioned) -->
            <Transition name="slide-down">
              <div v-if="showStatusManager" class="status-manager">
                <!-- Status List with Drag & Drop -->
                <div class="status-list">
                  <draggable
                    v-model="localStatuses"
                    item-key="id"
                    handle=".drag-handle"
                    ghost-class="status-ghost"
                    drag-class="status-dragging"
                    animation="200"
                    class="status-list-inner"
                    @end="onStatusReorder"
                  >
                    <template #item="{ element: status }">
                      <div class="status-list-item">
                        <!-- View Mode -->
                        <div v-if="editingStatusId !== status.id" class="flex align-items-center gap-2">
                          <i class="pi pi-bars drag-handle" />
                          <span class="status-color-box" :style="{ backgroundColor: status.color }"></span>
                          <span class="status-name flex-1">{{ status.name }}</span>
                          <Tag v-if="status.is_default" value="Default" severity="secondary" style="font-size: 0.55rem; padding: 0.05rem 0.25rem;" />
                          <Button
                            v-if="!status.is_default"
                            icon="pi pi-pencil"
                            text
                            rounded
                            size="small"
                            class="status-action-btn"
                            @click="startEditStatus(status)"
                          />
                          <Button
                            v-if="!status.is_default"
                            icon="pi pi-trash"
                            text
                            rounded
                            size="small"
                            severity="danger"
                            class="status-action-btn"
                            @click="deleteStatus(status)"
                          />
                        </div>

                        <!-- Edit Mode -->
                        <div v-else class="flex align-items-center gap-2">
                          <i class="pi pi-bars drag-handle disabled" />
                          <div class="color-input-wrapper">
                            <input
                              type="color"
                              v-model="editStatusColorHex"
                              class="color-input"
                            />
                          </div>
                          <InputText
                            v-model="editStatusName"
                            placeholder="Status name"
                            class="flex-1 p-inputtext-sm"
                          />
                          <Button
                            icon="pi pi-check"
                            size="small"
                            text
                            severity="secondary"
                            :loading="statusLoading"
                            @click="saveEditStatus"
                            class="status-edit-btn"
                          />
                          <Button
                            icon="pi pi-times"
                            size="small"
                            text
                            severity="secondary"
                            @click="cancelEditStatus"
                            class="status-edit-btn"
                          />
                        </div>
                      </div>
                    </template>
                  </draggable>
                </div>

                <!-- Create New Status -->
                <div class="create-status-row mt-2">
                  <div class="color-input-wrapper">
                    <input
                      type="color"
                      v-model="newStatusColorHex"
                      class="color-input"
                    />
                  </div>
                  <InputText
                    v-model="newStatusName"
                    placeholder="New status name..."
                    class="flex-1 p-inputtext-sm"
                    @keyup.enter="createStatus"
                  />
                  <Button
                    icon="pi pi-plus"
                    severity="success"
                    :loading="statusLoading"
                    :disabled="!newStatusName.trim()"
                    @click="createStatus"
                    class="add-status-btn"
                  />
                </div>
              </div>
            </Transition>
          </div>

          <!-- Responsible User -->
          <div class="flex flex-column mb-3">
            <label for="responsible_user" class="field-label mb-2">Responsible User</label>
            <Field v-slot="{ field, errorMessage }" name="responsible_user">
              <Dropdown
                id="responsible_user"
                :modelValue="field.value"
                @update:modelValue="field.onChange"
                :options="filteredUsers"
                optionLabel="display_name"
                optionValue="id"
                placeholder="Select user"
                class="w-full user-dropdown"
                :class="{ 'p-invalid': errorMessage }"
                showClear
                filter
                filterPlaceholder="Search..."
              >
                <template #value="{ value, placeholder }">
                  <span v-if="value">{{ getUserDisplayName(value) }}</span>
                  <span v-else class="text-placeholder">{{ placeholder }}</span>
                </template>
                <template #option="{ option }">
                  <span>{{ option.display_name }}</span>
                </template>
              </Dropdown>
            </Field>
            <ErrorMessage name="responsible_user" class="p-error text-sm mt-1" />
          </div>
        </div>

        <!-- Right Column -->
        <div class="form-column">
          <!-- Priority -->
          <div class="flex flex-column mb-3">
            <label for="priority" class="field-label mb-2">Priority <span class="required">*</span></label>
            <Field v-slot="{ field, errorMessage }" name="priority">
              <Dropdown
                id="priority"
                :modelValue="field.value"
                @update:modelValue="field.onChange"
                :options="priorityOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select priority"
                class="w-full"
                :class="{ 'p-invalid': errorMessage }"
              >
                <template #value="{ value, placeholder }">
                  <div v-if="value" class="flex align-items-center gap-2">
                    <span class="priority-dot" :style="{ backgroundColor: getTaskPriorityColor(value) }"></span>
                    <span>{{ getTaskPriorityLabel(value) }}</span>
                  </div>
                  <span v-else>{{ placeholder }}</span>
                </template>
                <template #option="{ option }">
                  <div class="flex align-items-center gap-2">
                    <span class="priority-dot" :style="{ backgroundColor: option.color }"></span>
                    <span>{{ option.label }}</span>
                  </div>
                </template>
              </Dropdown>
            </Field>
            <ErrorMessage name="priority" class="p-error text-sm mt-1" />
          </div>

          <!-- Due Date -->
          <div class="flex flex-column mb-3">
            <label for="due_date" class="field-label mb-2">Due Date</label>
            <Field v-slot="{ field, errorMessage }" name="due_date">
              <Calendar
                id="due_date"
                :modelValue="field.value"
                @update:modelValue="field.onChange"
                dateFormat="M dd, yy"
                placeholder="Select due date"
                class="w-full"
                :class="{ 'p-invalid': errorMessage }"
                showClear
              />
            </Field>
            <ErrorMessage name="due_date" class="p-error text-sm mt-1" />
          </div>

          <!-- Linked Items Section -->
          <div class="linked-section">
            <h4 class="section-subtitle mb-3">Linked Items (Optional)</h4>
            
            <!-- Linked Order -->
            <div class="flex flex-column mb-3">
              <label for="linked_order_id" class="field-label mb-1">Order</label>
              <Field v-slot="{ field, errorMessage }" name="linked_order_id">
                <Dropdown
                  id="linked_order_id"
                  :modelValue="field.value"
                  @update:modelValue="field.onChange"
                  :options="orderOptions"
                  optionValue="autoid"
                  optionLabel="invoice"
                  placeholder="Select order..."
                  class="w-full linked-dropdown"
                  :class="{ 'p-invalid': errorMessage }"
                  :loading="orderSearchLoading"
                  filter
                  filterPlaceholder="Search by invoice..."
                  @filter="searchOrders"
                  :filterFields="['invoice', 'name', 'autoid']"
                  showClear
                >
                  <template #value="{ value, placeholder }">
                    <span v-if="value && orderOptions.find(o => o.autoid === value)">
                      {{ getOrderDisplayLabel(orderOptions.find(o => o.autoid === value)!) }}
                    </span>
                    <span v-else-if="value">{{ value }}</span>
                    <span v-else class="text-placeholder">{{ placeholder }}</span>
                  </template>
                  <template #option="{ option }">
                    <div class="linked-option">
                      <span class="linked-option-id">{{ option.invoice?.trim() }}</span>
                      <span class="linked-option-name">{{ option.name }}</span>
                      <span class="linked-option-amount">${{ option.total }}</span>
                    </div>
                  </template>
                  <template #empty>
                    <div v-if="orderSearchLoading" class="linked-loading">
                      <i class="pi pi-spin pi-spinner"></i>
                      <span>Loading...</span>
                    </div>
                    <div v-else class="linked-empty">No orders found</div>
                  </template>
                </Dropdown>
              </Field>
            </div>

            <!-- Linked Proposal -->
            <div class="flex flex-column mb-3">
              <label for="linked_proposal_id" class="field-label mb-1">Proposal</label>
              <Field v-slot="{ field, errorMessage }" name="linked_proposal_id">
                <Dropdown
                  id="linked_proposal_id"
                  :modelValue="field.value"
                  @update:modelValue="field.onChange"
                  :options="proposalOptions"
                  optionValue="autoid"
                  optionLabel="quote"
                  placeholder="Select proposal..."
                  class="w-full linked-dropdown"
                  :class="{ 'p-invalid': errorMessage }"
                  :loading="proposalSearchLoading"
                  filter
                  filterPlaceholder="Search by quote..."
                  @filter="searchProposals"
                  :filterFields="['quote', 'b_name', 'autoid']"
                  showClear
                >
                  <template #value="{ value, placeholder }">
                    <span v-if="value && proposalOptions.find(p => p.autoid === value)">
                      {{ getProposalDisplayLabel(proposalOptions.find(p => p.autoid === value)!) }}
                    </span>
                    <span v-else-if="value">{{ value }}</span>
                    <span v-else class="text-placeholder">{{ placeholder }}</span>
                  </template>
                  <template #option="{ option }">
                    <div class="linked-option">
                      <span class="linked-option-id">{{ option.quote?.trim() }}</span>
                      <span class="linked-option-name">{{ option.b_name }}</span>
                      <span class="linked-option-amount">${{ option.total }}</span>
                    </div>
                  </template>
                  <template #empty>
                    <div v-if="proposalSearchLoading" class="linked-loading">
                      <i class="pi pi-spin pi-spinner"></i>
                      <span>Loading...</span>
                    </div>
                    <div v-else class="linked-empty">No proposals found</div>
                  </template>
                </Dropdown>
              </Field>
            </div>

            <!-- Linked Customer -->
            <div class="flex flex-column">
              <label for="linked_customer_id" class="field-label mb-1">Customer</label>
              <Field v-slot="{ field, errorMessage }" name="linked_customer_id">
                <Dropdown
                  id="linked_customer_id"
                  :modelValue="field.value"
                  @update:modelValue="field.onChange"
                  :options="customerOptions"
                  optionValue="id"
                  optionLabel="l_name"
                  placeholder="Select customer..."
                  class="w-full linked-dropdown"
                  :class="{ 'p-invalid': errorMessage }"
                  :loading="customerSearchLoading"
                  filter
                  filterPlaceholder="Search by name or ID..."
                  @filter="searchCustomers"
                  :filterFields="['id', 'l_name', 'email']"
                  showClear
                >
                  <template #value="{ value, placeholder }">
                    <span v-if="value && customerOptions.find(c => c.id === value)">
                      {{ getCustomerDisplayLabel(customerOptions.find(c => c.id === value)!) }}
                    </span>
                    <span v-else-if="value">{{ value }}</span>
                    <span v-else class="text-placeholder">{{ placeholder }}</span>
                  </template>
                  <template #option="{ option }">
                    <div class="linked-option">
                      <span class="linked-option-id">{{ option.id }}</span>
                      <span class="linked-option-name">{{ option.l_name }}</span>
                      <span v-if="option.email" class="linked-option-meta">{{ option.email }}</span>
                    </div>
                  </template>
                  <template #empty>
                    <div v-if="customerSearchLoading" class="linked-loading">
                      <i class="pi pi-spin pi-spinner"></i>
                      <span>Loading...</span>
                    </div>
                    <div v-else class="linked-empty">No customers found</div>
                  </template>
                </Dropdown>
              </Field>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="form-footer mt-4">
        <Button
          type="button"
          label="Cancel"
          text
          severity="secondary"
          @click="isVisible = false"
        />
        <Button
          type="submit"
          :label="mode === 'create' ? 'Create Task' : 'Save Changes'"
          severity="success"
          :loading="loading"
          :disabled="loading"
        />
      </div>
    </Form>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import Tag from "primevue/tag";
import draggable from "vuedraggable";
import { Form, Field, ErrorMessage } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { storeToRefs } from "pinia";
import { onClickOutside } from "@vueuse/core";
import type { TaskListItem, TaskStatus, User, CreateTaskPayload, Order, Proposal, Customer } from "~/types/models";
import { useProjectsStore } from "~/stores/projects";
import { 
  TASK_PRIORITY, 
  USER_ROLES,
  getTaskPriorityLabel, 
  getTaskPriorityColor 
} from "~/utils/constants";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    mode?: "create" | "edit";
    initialTask?: TaskListItem | null;
    statuses: TaskStatus[];
    users: User[];
  }>(),
  {
    mode: "create",
    initialTask: null,
  }
);

const emit = defineEmits<{
  "update:visible": [value: boolean];
  success: [];
  statusesUpdated: [];
}>();

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const tasksApi = useTasks();
const ordersApi = useOrders();
const proposalsApi = useProposals();
const customersApi = useCustomers();
const toast = useToast();

// Get selected project from store
const projectsStore = useProjectsStore();
const { selectedProjectId } = storeToRefs(projectsStore);

const loading = ref(false);

// Linked items state
const orderOptions = ref<Order[]>([]);
const proposalOptions = ref<Proposal[]>([]);
const customerOptions = ref<Customer[]>([]);
const orderSearchLoading = ref(false);
const proposalSearchLoading = ref(false);
const customerSearchLoading = ref(false);

// Status management state
const showStatusManager = ref(false);
const localStatuses = ref<TaskStatus[]>([]);
const statusLoading = ref(false);
const statusFieldRef = ref<HTMLElement | null>(null);

// Hide status manager on click outside
onClickOutside(statusFieldRef, () => {
  if (showStatusManager.value) {
    showStatusManager.value = false;
  }
});

// New status form
const newStatusName = ref('');
const newStatusColorHex = ref('#6B7280');

// Edit status form
const editingStatusId = ref<number | null>(null);
const editStatusName = ref('');
const editStatusColorHex = ref('#6B7280');

// Sync statuses from props (sorted by order, 0 on top)
watch(() => props.statuses, (newStatuses) => {
  localStatuses.value = [...newStatuses].sort((a, b) => a.order - b.order);
}, { immediate: true, deep: true });

// Reset status manager when modal closes, preload linked items when opens
watch(isVisible, (newVal) => {
  if (newVal) {
    // Preload linked items data when modal opens
    preloadLinkedItems();
  } else {
    showStatusManager.value = false;
    resetNewStatusForm();
    cancelEditStatus();
  }
});

// Preload linked items data
async function preloadLinkedItems() {
  const projectId = selectedProjectId.value;
  const params: any = { limit: 50 };
  if (projectId !== null) params.project_id = projectId;

  // Load all in parallel
  await Promise.all([
    ordersApi.list(params).then(res => { orderOptions.value = res.results; }).catch(() => {}),
    proposalsApi.list(params).then(res => { proposalOptions.value = res.results; }).catch(() => {}),
    customersApi.list(params).then(res => { customerOptions.value = res.results; }).catch(() => {}),
  ]);
}

// Filter users: exclude superadmins and users with empty names
const filteredUsers = computed(() => {
  return props.users
    .filter(u => u.role !== USER_ROLES.SUPERADMIN)
    .filter(u => u.first_name?.trim() || u.last_name?.trim() || u.email?.trim())
    .map(u => ({
      ...u,
      display_name: getFullName(u) || u.email || `User #${u.id}`,
    }));
});

function getFullName(user: User): string {
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return name || '';
}

function getUserDisplayName(userId: number): string {
  const user = filteredUsers.value.find(u => u.id === userId);
  return user?.display_name || '—';
}

// Priority options
const priorityOptions = computed(() => [
  { label: 'Low', value: TASK_PRIORITY.LOW, color: getTaskPriorityColor(TASK_PRIORITY.LOW) },
  { label: 'Medium', value: TASK_PRIORITY.MEDIUM, color: getTaskPriorityColor(TASK_PRIORITY.MEDIUM) },
  { label: 'High', value: TASK_PRIORITY.HIGH, color: getTaskPriorityColor(TASK_PRIORITY.HIGH) },
  { label: 'Urgent', value: TASK_PRIORITY.URGENT, color: getTaskPriorityColor(TASK_PRIORITY.URGENT) },
]);

// Validation schema
const schema = toTypedSchema(
  z.object({
    title: z.string().min(1, "Task name is required").max(255, "Task name is too long"),
    description: z.string().optional().nullable(),
    status: z.number({ required_error: "Status is required" }),
    responsible_user: z.number().optional().nullable(),
    priority: z.enum(['low', 'medium', 'high', 'urgent'], { required_error: "Priority is required" }),
    due_date: z.date().optional().nullable(),
    linked_order_id: z.string().optional().nullable(),
    linked_proposal_id: z.string().optional().nullable(),
    linked_customer_id: z.string().optional().nullable(),
  })
);

// Initial form values
const initialFormValues = computed(() => {
  if (props.mode === "edit" && props.initialTask) {
    return {
      title: props.initialTask.title || "",
      description: "",
      status: props.initialTask.status,
      responsible_user: props.initialTask.responsible_user || null,
      priority: props.initialTask.priority || TASK_PRIORITY.MEDIUM,
      due_date: props.initialTask.due_date ? new Date(props.initialTask.due_date) : null,
      linked_order_id: null,
      linked_proposal_id: null,
      linked_customer_id: null,
    };
  }
  
  // Create mode defaults
  const defaultStatus = localStatuses.value.find(s => s.is_default)?.id || localStatuses.value[0]?.id;
  return {
    title: "",
    description: "",
    status: defaultStatus,
    responsible_user: null,
    priority: TASK_PRIORITY.MEDIUM,
    due_date: null,
    linked_order_id: null,
    linked_proposal_id: null,
    linked_customer_id: null,
  };
});

// Helper functions
function getStatusName(statusId: number): string {
  const status = localStatuses.value.find(s => s.id === statusId);
  return status?.name || '—';
}

function getStatusColor(statusId: number): string {
  const status = localStatuses.value.find(s => s.id === statusId);
  return status?.color || '#6B7280';
}

function resetNewStatusForm() {
  newStatusName.value = '';
  newStatusColorHex.value = '#6B7280';
}

// Status CRUD operations
async function createStatus() {
  if (!newStatusName.value.trim()) return;

  statusLoading.value = true;
  try {
    // Calculate order for new status (add at the end)
    const maxOrder = localStatuses.value.length > 0
      ? Math.max(...localStatuses.value.map(s => s.order))
      : -1;
    
    const payload: any = {
      name: newStatusName.value.trim(),
      color: newStatusColorHex.value,
      order: maxOrder + 1,
    };
    // Add project_id for superadmin
    if (selectedProjectId.value !== null) {
      payload.project = selectedProjectId.value;
    }
    const created = await tasksApi.createStatus(payload);
    localStatuses.value.push(created);
    resetNewStatusForm();
    toast.showSuccess('Status created');
    emit('statusesUpdated');
  } catch (error) {
    toast.showError(error, 'Failed to create status');
  } finally {
    statusLoading.value = false;
  }
}

function startEditStatus(status: TaskStatus) {
  editingStatusId.value = status.id;
  editStatusName.value = status.name;
  editStatusColorHex.value = status.color;
}

function cancelEditStatus() {
  editingStatusId.value = null;
  editStatusName.value = '';
  editStatusColorHex.value = '#6B7280';
}

async function saveEditStatus() {
  if (!editingStatusId.value || !editStatusName.value.trim()) return;

  statusLoading.value = true;
  try {
    const updated = await tasksApi.updateStatus(editingStatusId.value, {
      name: editStatusName.value.trim(),
      color: editStatusColorHex.value,
    });
    const index = localStatuses.value.findIndex(s => s.id === editingStatusId.value);
    if (index !== -1) {
      localStatuses.value[index] = updated;
    }
    cancelEditStatus();
    toast.showSuccess('Status updated');
    emit('statusesUpdated');
  } catch (error) {
    toast.showError(error, 'Failed to update status');
  } finally {
    statusLoading.value = false;
  }
}

async function deleteStatus(status: TaskStatus) {
  if (status.is_default) return;

  statusLoading.value = true;
  try {
    await tasksApi.removeStatus(status.id);
    localStatuses.value = localStatuses.value.filter(s => s.id !== status.id);
    toast.showSuccess('Status deleted');
    emit('statusesUpdated');
  } catch (error) {
    toast.showError(error, 'Failed to delete status');
  } finally {
    statusLoading.value = false;
  }
}

// Handle status reorder via drag & drop
async function onStatusReorder() {
  // Update order values based on new positions (0 = first/top)
  const updates = localStatuses.value.map((status, index) => ({
    id: status.id,
    order: index,
  }));

  // Optimistically update local state
  localStatuses.value = localStatuses.value.map((status, index) => ({
    ...status,
    order: index,
  }));

  // Update each status order in parallel
  statusLoading.value = true;
  try {
    await Promise.all(
      updates.map(({ id, order }) => tasksApi.updateStatus(id, { order }))
    );
    emit('statusesUpdated');
  } catch (error) {
    toast.showError(error, 'Failed to update status order');
    // Reload statuses on error
    emit('statusesUpdated');
  } finally {
    statusLoading.value = false;
  }
}

// Linked items search functions
async function searchOrders(event: { value: string }) {
  const query = event.value?.trim() || '';
  
  orderSearchLoading.value = true;
  try {
    const params: any = { limit: 50 };
    if (query) params.invoice = query;
    if (selectedProjectId.value !== null) params.project_id = selectedProjectId.value;
    
    const response = await ordersApi.list(params);
    orderOptions.value = response.results;
  } catch (error) {
    console.error('Failed to search orders:', error);
    orderOptions.value = [];
  } finally {
    orderSearchLoading.value = false;
  }
}

async function searchProposals(event: { value: string }) {
  const query = event.value?.trim() || '';
  
  proposalSearchLoading.value = true;
  try {
    const params: any = { limit: 50 };
    if (query) params.quote = query;
    if (selectedProjectId.value !== null) params.project_id = selectedProjectId.value;
    
    const response = await proposalsApi.list(params);
    proposalOptions.value = response.results;
  } catch (error) {
    console.error('Failed to search proposals:', error);
    proposalOptions.value = [];
  } finally {
    proposalSearchLoading.value = false;
  }
}

async function searchCustomers(event: { value: string }) {
  const query = event.value?.trim() || '';
  
  customerSearchLoading.value = true;
  try {
    const params: any = { limit: 50 };
    if (query) params.search = query;
    if (selectedProjectId.value !== null) params.project_id = selectedProjectId.value;
    
    const response = await customersApi.list(params);
    customerOptions.value = response.results;
  } catch (error) {
    console.error('Failed to search customers:', error);
    customerOptions.value = [];
  } finally {
    customerSearchLoading.value = false;
  }
}

// Display helpers for dropdowns
function getOrderDisplayLabel(order: Order): string {
  return `${order.invoice?.trim()} - ${order.name} ($${order.total})`;
}

function getProposalDisplayLabel(proposal: Proposal): string {
  return `${proposal.quote?.trim()} - ${proposal.b_name} ($${proposal.total})`;
}

function getCustomerDisplayLabel(customer: Customer): string {
  return `${customer.id} - ${customer.l_name}`;
}

async function handleSubmit(values: any) {
  const payload: CreateTaskPayload = {
    title: values.title,
    description: values.description || undefined,
    status: values.status,
    priority: values.priority,
    responsible_user: values.responsible_user || undefined,
    due_date: values.due_date ? values.due_date.toISOString().split('T')[0] : undefined,
    linked_order_id: values.linked_order_id || undefined,
    linked_proposal_id: values.linked_proposal_id || undefined,
    linked_customer_id: values.linked_customer_id || undefined,
  };

  // Add project for superadmin
  if (selectedProjectId.value !== null) {
    payload.project = selectedProjectId.value;
  }

  if (props.mode === "create") {
    await useApiCall({
      fn: () => tasksApi.create(payload),
      successMessage: 'Task created successfully',
      errorMessage: 'Failed to Create Task',
      showSuccess: true,
      loading,
      toast,
      onSuccess: () => {
        emit('success');
        isVisible.value = false;
      },
    });
  } else if (props.initialTask) {
    await useApiCall({
      fn: () => tasksApi.update(props.initialTask!.id, payload),
      successMessage: 'Task updated successfully',
      errorMessage: 'Failed to Update Task',
      showSuccess: true,
      loading,
      toast,
      onSuccess: () => {
        emit('success');
        isVisible.value = false;
      },
    });
  }
}
</script>

<style scoped>
.task-form {
  padding: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-column {
  display: flex;
  flex-direction: column;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border-light);
}

.field-label {
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  display: block;
}

.required {
  color: var(--color-danger);
}

.text-placeholder {
  color: var(--color-text-tertiary);
}

.section-subtitle {
  font-size: var(--font-size-body-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.linked-section {
  background: var(--surface-50);
  padding: 0.875rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border-light);
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

/* Status Field Wrapper */
.status-field-wrapper {
  position: relative;
}

/* Status Manager Styles */
.status-manager {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius);
  padding: 0.625rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-list {
  max-height: 150px;
  overflow-y: auto;
}

.status-list-inner {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* List item animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.list-move {
  transition: transform 0.2s ease;
}

.status-list-item {
  background: white;
  padding: 0.375rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--color-border-light);
  transition: all 0.15s ease;
}

.status-list-item:hover {
  background: var(--color-neutral-100);
  border-color: var(--color-border-primary);
}

.status-list-item:hover .status-action-btn {
  opacity: 1;
}

/* Drag handle */
.drag-handle {
  cursor: grab;
  color: var(--color-text-tertiary);
  font-size: 0.75rem;
  padding: 0.25rem;
  transition: color 0.15s;
}

.drag-handle:hover {
  color: var(--color-text-primary);
}

.drag-handle.disabled {
  cursor: default;
  opacity: 0.3;
}

/* Drag states */
.status-ghost {
  opacity: 0.5;
  background: var(--color-primary-50) !important;
  border-color: var(--color-primary) !important;
}

.status-dragging {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}

/* Status edit buttons (icon-only) */
.status-edit-btn {
  width: 1.75rem !important;
  height: 1.75rem !important;
  padding: 0 !important;
  justify-content: center;
}

.status-edit-btn :deep(.p-button-label) {
  display: none;
}

.status-edit-btn :deep(.p-button-icon) {
  margin: 0 !important;
}

.status-action-btn {
  opacity: 0.4;
  transition: all 0.15s ease;
  width: 1.25rem !important;
  height: 1.25rem !important;
  padding: 0 !important;
  transform: scale(0.95);
}

.status-action-btn:hover {
  opacity: 1;
  transform: scale(1);
}

.status-color-box {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.status-name {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-primary);
}

/* Native color input styling */
.color-input-wrapper {
  position: relative;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.color-input {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--color-border-light);
  border-radius: 4px;
  cursor: pointer;
  background: none;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 2px;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 2px;
}

.color-input::-moz-color-swatch {
  border: none;
  border-radius: 2px;
}

/* Create status row */
.create-status-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border-light);
}

/* Add status button */
.add-status-btn {
  width: 28px !important;
  height: 27px !important;
  min-width: 28px !important;
  padding: 0 !important;
  justify-content: center;
}

.add-status-btn :deep(.p-button-icon) {
  margin: 0 !important;
}

.add-status-btn :deep(.p-button-label) {
  display: none;
}


.linked-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.linked-option-id {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  min-width: 70px;
}

.linked-option-name {
  flex: 1;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.linked-option-amount {
  font-weight: var(--font-weight-medium);
  color: var(--color-success);
  font-size: var(--font-size-body-xs);
}

.linked-option-meta {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
}

.linked-empty {
  padding: 0.5rem;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-body-s);
  text-align: center;
}

.linked-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body-s);
}

.linked-loading i {
  font-size: 1rem;
}
</style>

<style>
/* Global styles for task modal */
.task-modal.p-dialog {
  width: 700px !important;
  max-width: 95vw !important;
}

.task-modal .p-dialog-content {
  padding: 1.25rem !important;
}

/* Dropdown filter styles (must be global - panel renders in body portal) */
.p-dropdown-panel .p-dropdown-filter-container {
  padding: 5px !important;
  background: none !important;
  border-bottom: none !important;
}

.p-dropdown-panel .p-dropdown-filter-icon {
  position: absolute !important;
  right: 10px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}
</style>
