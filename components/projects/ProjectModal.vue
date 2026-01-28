<!-- components/projects/ProjectModal.vue -->
<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :closable="true"
    :draggable="false"
    class="modal-lg"
  >
    <template #header>
      <h2 class="modal-title">{{ mode === 'create' ? 'New Project' : 'Edit Project' }}</h2>
    </template>

    <!-- Loading State -->
    <div v-if="loadingProject" class="flex flex-column align-items-center justify-content-center gap-3 loading-state">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--color-text-tertiary);"></i>
      <span class="text-color-secondary">Loading project data...</span>
    </div>

    <!-- Only show form when ready: create mode OR edit mode with loaded data -->
    <Form
      v-else-if="mode === 'create' || projectData"
      @submit="handleSubmit"
      @invalid-submit="onInvalidSubmit"
      :validation-schema="schema"
      :initial-values="initialFormValues"
      :key="formKey"
      class="project-form"
    >
      <!-- Project Name -->
      <div class="flex flex-column mb-4">
        <label for="name" class="field-label mb-2">Project Name</label>
        <Field v-slot="{ field, errorMessage }" name="name">
          <InputText
            id="name"
            v-bind="field"
            placeholder="Enter project name"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="name" class="p-error text-sm mt-1" />
      </div>

      <!-- Database Configuration Section -->
      <div class="section-title mb-3">Database Configuration</div>

      <!-- Database Type -->
      <div class="flex flex-column mb-4">
        <label for="db_type" class="field-label mb-2">Database Type</label>
        <Field v-slot="{ field, errorMessage }" name="db_type">
          <Dropdown
            id="db_type"
            :modelValue="field.value"
            @update:modelValue="field.onChange"
            :options="dbTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select database type"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="db_type" class="p-error text-sm mt-1" />
      </div>

      <!-- Database Host & Port -->
      <div class="flex gap-3 mb-4">
        <div class="flex flex-column flex-1">
          <label for="db_host" class="field-label mb-2">Host</label>
          <Field v-slot="{ field, errorMessage }" name="db_host">
            <InputText
              id="db_host"
              v-bind="field"
              placeholder="e.g., db.example.com"
              class="w-full"
              :class="{ 'p-invalid': errorMessage }"
            />
          </Field>
          <ErrorMessage name="db_host" class="p-error text-sm mt-1" />
        </div>
        <div class="flex flex-column" style="width: 120px;">
          <label for="db_port" class="field-label mb-2">Port</label>
          <Field v-slot="{ field, errorMessage }" name="db_port">
            <InputNumber
              id="db_port"
              :modelValue="field.value"
              @update:modelValue="field.onChange"
              placeholder="5432"
              :useGrouping="false"
              class="w-full"
              :class="{ 'p-invalid': errorMessage }"
            />
          </Field>
          <ErrorMessage name="db_port" class="p-error text-sm mt-1" />
        </div>
      </div>

      <!-- Database Name -->
      <div class="flex flex-column mb-4">
        <label for="db_name" class="field-label mb-2">Database Name</label>
        <Field v-slot="{ field, errorMessage }" name="db_name">
          <InputText
            id="db_name"
            v-bind="field"
            placeholder="Enter database name"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="db_name" class="p-error text-sm mt-1" />
      </div>

      <!-- Database Username -->
      <div class="flex flex-column mb-4">
        <label for="db_username" class="field-label mb-2">Username</label>
        <Field v-slot="{ field, errorMessage }" name="db_username">
          <InputText
            id="db_username"
            v-bind="field"
            placeholder="Enter database username"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="db_username" class="p-error text-sm mt-1" />
      </div>

      <!-- Database Password -->
      <div class="flex flex-column mb-4">
        <label for="db_password" class="field-label mb-2">
          Password
          <span v-if="mode === 'edit'" class="text-sm font-normal text-color-secondary ml-1">(leave blank to keep current)</span>
        </label>
        <Field v-slot="{ field, errorMessage }" name="db_password">
          <Password
            id="db_password"
            :modelValue="field.value"
            @update:modelValue="field.onChange"
            :placeholder="mode === 'edit' ? '••••••••' : 'Enter database password'"
            :feedback="false"
            toggleMask
            :inputClass="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="db_password" class="p-error text-sm mt-1" />
      </div>

      <!-- API Configuration Section -->
      <div class="section-title mb-3 mt-5">EBMS API Configuration <span class="text-sm font-normal text-color-secondary">(Optional)</span></div>

      <!-- API Endpoint -->
      <div class="flex flex-column mb-4">
        <label for="api_endpoint" class="field-label mb-2">API Endpoint</label>
        <Field v-slot="{ field, errorMessage }" name="api_endpoint">
          <InputText
            id="api_endpoint"
            v-bind="field"
            placeholder="https://ebms.example.com/api"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="api_endpoint" class="p-error text-sm mt-1" />
      </div>

      <!-- API Login -->
      <div class="flex flex-column mb-4">
        <label for="api_login" class="field-label mb-2">API Login</label>
        <Field v-slot="{ field, errorMessage }" name="api_login">
          <InputText
            id="api_login"
            v-bind="field"
            placeholder="Enter API username"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="api_login" class="p-error text-sm mt-1" />
      </div>

      <!-- API Password -->
      <div class="flex flex-column mb-4">
        <label for="api_password" class="field-label mb-2">
          API Password
          <span v-if="mode === 'edit'" class="text-sm font-normal text-color-secondary ml-1">(leave blank to keep current)</span>
        </label>
        <Field v-slot="{ field, errorMessage }" name="api_password">
          <Password
            id="api_password"
            :modelValue="field.value"
            @update:modelValue="field.onChange"
            :placeholder="mode === 'edit' ? '••••••••' : 'Enter API password'"
            :feedback="false"
            toggleMask
            :inputClass="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="api_password" class="p-error text-sm mt-1" />
      </div>

      <!-- Extra Columns - Hidden for now -->
      <!-- <div class="flex flex-column mb-5">
        <label for="extra_columns" class="field-label mb-2">Extra Columns <span class="text-sm font-normal text-color-secondary">(Optional)</span></label>
        <Field v-slot="{ field, errorMessage }" name="extra_columns">
          <Textarea
            id="extra_columns"
            v-bind="field"
            placeholder="Additional project-specific configuration"
            rows="3"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="extra_columns" class="p-error text-sm mt-1" />
      </div> -->

      <!-- Submit Button -->
      <Button
        type="submit"
        :label="mode === 'create' ? 'Create Project' : 'Save Changes'"
        severity="success"
        class="w-full"
        :loading="loading"
        :disabled="loading"
        @click="onSubmitClick"
      />
    </Form>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Password from "primevue/password";
// import Textarea from "primevue/textarea"; // Hidden for now
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { Form, Field, ErrorMessage } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { createProjectSchema, editProjectSchema, DB_TYPES } from "~/utils/validation";
import { ValidationError } from "~/utils/errors";
import type { Project } from "~/types/models";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    mode?: "create" | "edit";
    projectId?: number | null;
  }>(),
  {
    mode: "create",
    projectId: null,
  }
);

const emit = defineEmits<{
  "update:visible": [value: boolean];
  success: [];
}>();

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const projectsApi = useProjects();
const toast = useToast();

const loading = ref(false);
const loadingProject = ref(false);
const projectData = ref<Project | null>(null);
const formKey = ref(0);

// Database type options
const dbTypeOptions = [
  { label: "PostgreSQL", value: "postgresql" },
  { label: "MySQL", value: "mysql" },
  { label: "Microsoft SQL Server", value: "mssql" },
  { label: "Oracle", value: "oracle" },
];

// Fetch project data when modal opens in edit mode
watch(
  () => props.visible,
  async (visible) => {
    if (visible && props.mode === "edit" && props.projectId) {
      await fetchProjectData(props.projectId);
    } else if (visible && props.mode === "create") {
      // Reset for create mode
      projectData.value = null;
      formKey.value++;
    } else if (!visible) {
      // Reset project data when modal closes
      projectData.value = null;
    }
  }
);

async function fetchProjectData(id: number) {
  await useApiCall({
    fn: () => projectsApi.get(id),
    errorMessage: 'Failed to Load Project',
    loading: loadingProject,
    toast,
    onSuccess: (data) => {
      projectData.value = data;
      // Force form re-render with new data
      formKey.value++;
    },
    onError: () => {
      // Close modal on error
      isVisible.value = false;
    },
  });
}

// Initial form values
const initialFormValues = computed(() => {
  if (props.mode === "edit" && projectData.value) {
    return {
      name: projectData.value.name,
      db_type: projectData.value.db_type,
      db_host: projectData.value.db_host,
      db_port: projectData.value.db_port || 5432,
      db_name: projectData.value.db_name || "",
      db_username: projectData.value.db_username || "",
      db_password: "", // Don't prefill password
      api_endpoint: projectData.value.api_endpoint || "",
      api_login: projectData.value.api_login || "",
      api_password: "", // Don't prefill password
    };
  }
  // Create mode defaults
  return {
    name: "",
    db_type: "postgresql",
    db_host: "",
    db_port: 5432,
    db_name: "",
    db_username: "",
    db_password: "",
    api_endpoint: "",
    api_login: "",
    api_password: "",
  };
});

// Validation schema (dynamic based on mode)
const schema = computed(() => {
  if (props.mode === "create") {
    return toTypedSchema(createProjectSchema);
  }
  return toTypedSchema(editProjectSchema);
});

async function handleSubmit(
  values: any,
  { setFieldError }: { setFieldError: (field: string, message: string) => void }
) {
  if (props.mode === "create") {
    // Create mode: send all required fields
    const payload: any = {
      name: values.name,
      db_type: values.db_type,
      db_host: values.db_host,
      db_port: values.db_port,
      db_name: values.db_name,
      db_username: values.db_username,
      db_password: values.db_password,
    };

    // Add optional API fields if provided
    if (values.api_endpoint) payload.api_endpoint = values.api_endpoint;
    if (values.api_login) payload.api_login = values.api_login;
    if (values.api_password) payload.api_password = values.api_password;

    await useApiCall({
      fn: () => projectsApi.create(payload),
      successMessage: 'Project created successfully',
      errorMessage: 'Failed to Create Project',
      showSuccess: true,
      loading,
      toast,
      onSuccess: () => {
        emit('success');
        isVisible.value = false;
      },
      onError: (error) => {
        handleValidationErrors(error, setFieldError);
      },
    });
  } else {
    // Edit mode: only send changed fields
    if (!projectData.value) {
      toast.showError("Project data not loaded", "Error");
      return;
    }
    
    const payload: any = {};
    const project = projectData.value;

    // Check for changes
    if (values.name !== project.name) payload.name = values.name;
    if (values.db_type !== project.db_type) payload.db_type = values.db_type;
    if (values.db_host !== project.db_host) payload.db_host = values.db_host;
    if (values.db_port !== project.db_port) payload.db_port = values.db_port;
    if (values.db_name !== (project.db_name || "")) payload.db_name = values.db_name;
    if (values.db_username !== (project.db_username || "")) payload.db_username = values.db_username;
    if (values.api_endpoint !== (project.api_endpoint || "")) payload.api_endpoint = values.api_endpoint;
    if (values.api_login !== (project.api_login || "")) payload.api_login = values.api_login;

    // Only send password if user entered a new one
    if (values.db_password) payload.db_password = values.db_password;
    if (values.api_password) payload.api_password = values.api_password;

    // Only send PATCH if there are changes
    if (Object.keys(payload).length === 0) {
      toast.showInfo("No changes to save");
      return;
    }

    await useApiCall({
      fn: () => projectsApi.patch(project.id, payload),
      successMessage: 'Project updated successfully',
      errorMessage: 'Failed to Update Project',
      showSuccess: true,
      loading,
      toast,
      onSuccess: () => {
        emit('success');
        isVisible.value = false;
      },
      onError: (error) => {
        handleValidationErrors(error, setFieldError);
      },
    });
  }
}

function handleValidationErrors(error: unknown, setFieldError: (field: string, message: string) => void) {
  if (error instanceof ValidationError && error.fields) {
    const errorMessages: string[] = [];
    
    Object.keys(error.fields).forEach((field) => {
      const fieldErrors = error.fields![field];
      if (fieldErrors && Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        // Set field error for inline display
        setFieldError(field, fieldErrors.join(", "));
        
        // Collect ALL error messages for toast
        const fieldLabel = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        fieldErrors.forEach(errorMsg => {
          errorMessages.push(`${fieldLabel}: ${errorMsg}`);
        });
      }
    });
    
    // Show all errors in a toast
    if (errorMessages.length > 0) {
      toast.add({
        severity: "warn",
        summary: "Validation Error",
        detail: errorMessages.join('\n'),
        life: 6000,
        closable: true,
      });
    }
  }
}
</script>

<style scoped>
.project-form {
  padding: 0.25rem 0 0;
}

.field-label {
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  display: block;
}

.section-title {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border-light);
}

.text-color-secondary {
  color: var(--color-text-secondary);
}

.loading-state {
  padding: 3rem 2rem;
}
</style>
