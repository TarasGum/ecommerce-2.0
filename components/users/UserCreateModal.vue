<!-- components/users/UserCreateModal.vue -->
<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    :closable="true"
    :draggable="false"
    class="modal-md"
  >
    <template #header>
      <h2 class="modal-title">User</h2>
    </template>

    <Form
      @submit="handleSubmit"
      :validation-schema="schema"
      :initial-values="initialFormValues"
      class="user-form"
    >
      <!-- User Type -->
      <div class="flex flex-column mb-4">
        <label class="field-label mb-2">User Type</label>
        <Field v-slot="{ field, errorMessage }" name="role">
          <Dropdown
            :modelValue="field.value"
            @update:modelValue="(value) => { field.onChange(value); onRoleChange(value); }"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select user type"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="role" class="p-error text-sm mt-1" />
      </div>

      <!-- Name -->
      <div class="flex flex-column mb-4">
        <label for="name" class="field-label mb-2">Name</label>
        <Field v-slot="{ field, errorMessage }" name="name">
          <InputText
            id="name"
            v-bind="field"
            placeholder="Enter name"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="name" class="p-error text-sm mt-1" />
      </div>

      <!-- Email -->
      <div class="flex flex-column mb-4">
        <label for="email" class="field-label mb-2">E-mail Address</label>
        <Field v-slot="{ field, errorMessage }" name="email">
          <InputText
            id="email"
            v-bind="field"
            type="email"
            placeholder="Enter email address"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
          />
        </Field>
        <ErrorMessage name="email" class="p-error text-sm mt-1" />
      </div>

      <!-- Project (SuperAdmin only, but disabled when creating superadmin) -->
      <div v-if="!!isSuperAdmin" class="flex flex-column mb-4">
        <label for="project" class="field-label mb-2">Project</label>
        <Field v-slot="{ field, errorMessage }" name="project">
          <Dropdown
            id="project"
            :modelValue="field.value"
            @update:modelValue="field.onChange"
            :options="projects"
            optionLabel="name"
            optionValue="id"
            placeholder="Select a project"
            class="w-full"
            :class="{ 'p-invalid': errorMessage }"
            :loading="projectsLoading"
            :disabled="isCreatingSuperAdmin"
          />
        </Field>
        <small v-if="isCreatingSuperAdmin" class="field-hint">
          SuperAdmins are not tied to a specific project
        </small>
        <ErrorMessage name="project" class="p-error text-sm mt-1" />
      </div>

      <!-- Password Section (Create mode or Change Password toggle in Edit mode) -->
      <div v-if="mode === 'create'" class="w-full">
        <div class="flex flex-column mb-4">
          <label for="password" class="field-label mb-2">Password</label>
          <Field v-slot="{ field, errorMessage }" name="password">
            <div class="w-full relative">
              <Password
                id="password"
                :modelValue="field.value"
                @update:modelValue="field.onChange"
                placeholder="Enter password"
                :feedback="false"
                toggleMask
                :inputClass="{ 'p-invalid': errorMessage }"
              />
            </div>
          </Field>
          <ErrorMessage name="password" class="p-error text-sm mt-1" />
        </div>

        <div class="flex flex-column mb-6">
          <label for="password_confirm" class="field-label mb-2">Password Confirm</label>
          <Field v-slot="{ field, errorMessage }" name="password_confirm">
            <div class="w-full relative">
              <Password
                id="password_confirm"
                :modelValue="field.value"
                @update:modelValue="field.onChange"
                placeholder="Confirm password"
                :feedback="false"
                toggleMask
                :inputClass="{ 'p-invalid': errorMessage }"
              />
            </div>
          </Field>
          <ErrorMessage name="password_confirm" class="p-error text-sm mt-1" />
        </div>
      </div>

      <!-- Change Password Toggle (Edit mode only) -->
      <!-- <div v-else class="w-full mb-6">
        <div class="flex align-items-center mb-4">
          <Button
            type="button"
            :label="showPasswordFields ? 'Cancel Password Change' : 'Change Password'"
            severity="secondary"
            text
            size="small"
            @click="showPasswordFields = !showPasswordFields"
          />
        </div>

        <div v-if="showPasswordFields">
          <div class="flex flex-column mb-4">
            <label for="password" class="field-label mb-2">New Password</label>
            <Field v-slot="{ field, errorMessage }" name="password">
              <div class="w-full relative">
                <Password
                  id="password"
                  :modelValue="field.value"
                  @update:modelValue="field.onChange"
                  placeholder="Enter new password"
                  :feedback="false"
                  toggleMask
                  :inputClass="{ 'p-invalid': errorMessage }"
                />
              </div>
            </Field>
            <ErrorMessage name="password" class="p-error text-sm mt-1" />
          </div>

          <div class="flex flex-column mb-4">
            <label for="password_confirm" class="field-label mb-2">Confirm New Password</label>
            <Field v-slot="{ field, errorMessage }" name="password_confirm">
              <div class="w-full relative">
                <Password
                  id="password_confirm"
                  :modelValue="field.value"
                  @update:modelValue="field.onChange"
                  placeholder="Confirm new password"
                  :feedback="false"
                  toggleMask
                  :inputClass="{ 'p-invalid': errorMessage }"
                />
              </div>
            </Field>
            <ErrorMessage name="password_confirm" class="p-error text-sm mt-1" />
          </div>
        </div>
      </div> -->

      <!-- Submit Button -->
      <Button
        type="submit"
        :label="mode === 'create' ? 'Add New User' : 'Save Changes'"
        severity="success"
        class="w-full"
        :loading="loading"
        :disabled="loading"
      />
    </Form>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import { Form, Field, ErrorMessage } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { createUserSchema, editUserSchema, type CreateUserFormData } from "~/utils/validation";
import { ValidationError } from "~/utils/errors";
import type { Project, User } from "~/types/models";
import { USER_ROLES, USER_ROLE_LABELS } from "~/utils/constants";
import { storeToRefs } from "pinia";
import { useProjectsStore } from "~/stores/projects";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    mode?: "create" | "edit";
    initialUser?: User | null;
  }>(),
  {
    mode: "create",
    initialUser: null,
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

const auth = useAuth();
const usersApi = useUsers();
const toast = useToast();

// Store management
const projectsStore = useProjectsStore();
const { selectedProjectId, projects, loading: projectsLoading } = storeToRefs(projectsStore);

const loading = ref(false);
const showPasswordFields = ref(false);
const selectedRole = ref<string>("");

const isSuperAdmin = computed(() => auth.user.value?.role === USER_ROLES.SUPERADMIN);

// Check if we're creating a superadmin user (project should be disabled)
const isCreatingSuperAdmin = computed(() => {
  return props.mode === "create" && selectedRole.value === USER_ROLES.SUPERADMIN;
});

// Initial form values
const initialFormValues = computed(() => {
  if (props.mode === "edit" && props.initialUser) {
    const fullName = `${props.initialUser.first_name || ""} ${props.initialUser.last_name || ""}`.trim();
    return {
      name: fullName || "",
      email: props.initialUser.email,
      role: props.initialUser.role,
      project: props.initialUser.project,
    };
  }
  // Create mode: pre-select role and project
  if (props.mode === "create") {
    const defaults: any = {
      role: "admin", // Default to admin role
    };
    
    // Pre-select current project for superadmin users (they can change it)
    if (isSuperAdmin.value && selectedProjectId.value) {
      defaults.project = selectedProjectId.value;
    } else if (!isSuperAdmin.value && auth.user.value?.project) {
      // For regular admins, use their project (they can't change it)
      defaults.project = auth.user.value.project;
    }
    
    return defaults;
  }
  return {};
});

// Role options - filter based on current user's role
const roleOptions = computed(() => {
  const allRoles = [
    { label: USER_ROLE_LABELS[USER_ROLES.SUPERADMIN], value: USER_ROLES.SUPERADMIN },
    { label: USER_ROLE_LABELS[USER_ROLES.ADMIN], value: USER_ROLES.ADMIN },
    { label: USER_ROLE_LABELS[USER_ROLES.SALE], value: USER_ROLES.SALE },
    { label: USER_ROLE_LABELS[USER_ROLES.MANAGER], value: USER_ROLES.MANAGER },
  ];
  
  // Only superadmins can create other superadmins
  if (!isSuperAdmin.value) {
    return allRoles.filter(role => role.value !== USER_ROLES.SUPERADMIN);
  }
  
  return allRoles;
});

// Validation schema (dynamic based on mode and password change)
const schema = computed(() => {
  if (props.mode === "create") {
    return toTypedSchema(createUserSchema);
  }
  // Edit mode: password optional unless changing
  return toTypedSchema(editUserSchema(showPasswordFields.value));
});

// Fetch projects for SuperAdmin
onMounted(async () => {
  if (isSuperAdmin.value && !projectsStore.hasProjects) {
    await projectsStore.loadProjects();
  }
});

// Reset password fields and role when modal closes or mode changes
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      showPasswordFields.value = false;
      selectedRole.value = "";
    } else {
      // Initialize selectedRole when modal opens
      if (props.mode === "edit" && props.initialUser) {
        selectedRole.value = props.initialUser.role;
      } else if (props.mode === "create") {
        // Default to admin for create mode
        selectedRole.value = "admin";
      }
    }
  }
);

function onRoleChange(role: string) {
  selectedRole.value = role;
}

async function handleSubmit(
  values: any,
  { setFieldError }: { setFieldError: (field: string, message: string) => void }
) {
  // Parse name into first_name and last_name
  const nameParts = values.name.trim().split(/\s+/);
  const first_name = nameParts[0] || "";
  const last_name = nameParts.slice(1).join(" ") || "";

  if (props.mode === "create") {
    // Create mode: send all required fields
    const payload: any = {
      email: values.email,
      password: values.password,
      password_confirm: values.password_confirm,
      first_name,
      last_name,
      role: values.role,
    };

    // Add project for SuperAdmin or use current user's project for Admin
    // SuperAdmin users are not tied to a project, so skip project assignment for them
    if (values.role === USER_ROLES.SUPERADMIN) {
      // Don't set project field for superadmin users - omit it entirely
      // Backend will handle superadmin users not having a project
    } else if (isSuperAdmin.value) {
      if (!values.project) {
        setFieldError("project", "Project is required for admin and user roles");
        return;
      }
      payload.project = values.project;
    } else {
      payload.project = auth.user.value?.project;
    }

    await useApiCall({
      fn: () => usersApi.create(payload),
      successMessage: 'User created successfully',
      errorMessage: 'Failed to Create User',
      showSuccess: true,
      loading,
      toast,
      onSuccess: () => {
        emit('success');
        isVisible.value = false;
      },
      onError: (error) => {
        // Handle validation errors
        handleValidationErrors(error, setFieldError);
      },
    });
  } else {
    // Edit mode: only send changed fields
    const payload: any = {};
    const user = props.initialUser!;

    // Check name changes
    const currentName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    if (values.name !== currentName) {
      payload.first_name = first_name;
      payload.last_name = last_name;
    }

    // Check email change
    if (values.email !== user.email) {
      payload.email = values.email;
    }

    // Check role change
    if (values.role !== user.role) {
      payload.role = values.role;
    }

    // Check project change (SuperAdmin only)
    if (isSuperAdmin.value && values.project !== user.project) {
      payload.project = values.project;
    }

    // Add password if changing
    if (showPasswordFields.value && values.password) {
      payload.password = values.password;
      payload.password_confirm = values.password_confirm;
    }

    // Only send PATCH if there are changes
    if (Object.keys(payload).length === 0) {
      toast.showInfo("No changes to save");
      return;
    }

    await useApiCall({
      fn: () => usersApi.patch(user.id, payload),
      successMessage: 'User updated successfully',
      errorMessage: 'Failed to Update User',
      showSuccess: true,
      loading,
      toast,
      onSuccess: () => {
        emit('success');
        isVisible.value = false;
      },
      onError: (error) => {
        // Handle validation errors
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
        // Map backend field names to form field names
        const fieldMap: Record<string, string> = {
          first_name: "name",
          last_name: "name",
          password_confirm: "password_confirm",
        };
        const formField = fieldMap[field] || field;
        
        // Set field error for inline display (join all errors)
        setFieldError(formField, fieldErrors.join(", "));
        
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
.user-form {
  padding: 0.25rem 0 0;
}

.field-label {
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  display: block;
}

.field-hint {
  display: block;
  font-size: var(--font-size-body-xs);
  color: var(--color-text-secondary);
  margin-top: 0.25rem !important;
}
</style>
