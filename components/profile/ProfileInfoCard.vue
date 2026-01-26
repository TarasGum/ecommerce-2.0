<!-- components/profile/ProfileInfoCard.vue -->
<template>
  <div class="info-card">
    <h3 class="info-card-title">Profile Information</h3>

    <div class="flex flex-column gap-3">
      <!-- Email (read-only) -->
      <div class="flex flex-column gap-1">
        <span class="info-label">Email</span>
        <span class="info-value">{{ user?.email || '—' }}</span>
      </div>

      <!-- First Name -->
      <div class="flex flex-column gap-1">
        <label for="firstName" class="info-label">First Name</label>
        <InputText
          id="firstName"
          v-model="firstName"
          placeholder="Enter first name"
          class="w-full"
          :disabled="loading"
          :class="{ 'p-invalid': !firstName.trim() && touched }"
        />
        <small v-if="!firstName.trim() && touched" class="p-error">
          First name is required
        </small>
      </div>

      <!-- Last Name -->
      <div class="flex flex-column gap-1">
        <label for="lastName" class="info-label">Last Name</label>
        <InputText
          id="lastName"
          v-model="lastName"
          placeholder="Enter last name"
          class="w-full"
          :disabled="loading"
          :class="{ 'p-invalid': !lastName.trim() && touched }"
        />
        <small v-if="!lastName.trim() && touched" class="p-error">
          Last name is required
        </small>
      </div>

      <!-- Role (read-only) -->
      <div class="flex flex-column gap-1">
        <span class="info-label">Role</span>
        <div>
          <Tag
            :value="getUserRoleLabel(user?.role || '')"
            :severity="getUserRoleSeverity(user?.role || '')"
          />
        </div>
      </div>

      <!-- Project (only if user has one) -->
      <div v-if="user?.project" class="flex flex-column gap-1">
        <span class="info-label">Project</span>
        <span class="info-value">{{ user.project_name || `Project #${user.project}` }}</span>
      </div>

      <!-- Date Joined -->
      <div class="flex flex-column gap-1">
        <span class="info-label">Member Since</span>
        <span class="info-value">{{ formatDate(user?.date_joined) }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-content-end gap-2 mt-4">
      <Button
        label="Cancel"
        severity="secondary"
        text
        size="small"
        :disabled="!hasChanges || loading"
        @click="handleCancel"
      />
      <Button
        label="Save Changes"
        severity="primary"
        size="small"
        :loading="loading"
        :disabled="!hasChanges || !isValid || loading"
        @click="handleSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Tag from "primevue/tag";
import { getUserRoleLabel, getUserRoleSeverity } from "~/utils/constants";
import { formatDate } from "~/utils/formatters";

const auth = useAuth();
const profileApi = useProfile();
const toast = useToast();

const user = computed(() => auth.user.value);

// Local form state
const firstName = ref("");
const lastName = ref("");
const loading = ref(false);
const touched = ref(false);

// Sync with user data
watch(
  user,
  (newUser) => {
    if (newUser) {
      firstName.value = newUser.first_name || "";
      lastName.value = newUser.last_name || "";
      touched.value = false;
    }
  },
  { immediate: true }
);

// Computed
const hasChanges = computed(() => {
  if (!user.value) return false;
  return (
    firstName.value.trim() !== (user.value.first_name || "") ||
    lastName.value.trim() !== (user.value.last_name || "")
  );
});

const isValid = computed(() => {
  return firstName.value.trim().length > 0 && lastName.value.trim().length > 0;
});

// Actions
function handleCancel() {
  if (user.value) {
    firstName.value = user.value.first_name || "";
    lastName.value = user.value.last_name || "";
    touched.value = false;
  }
}

async function handleSave() {
  touched.value = true;

  if (!isValid.value) return;

  const authStore = useAuthStore();

  await useApiCall({
    fn: () =>
      profileApi.updateProfile({
        first_name: firstName.value.trim(),
        last_name: lastName.value.trim(),
      }),
    successMessage: "Profile updated successfully",
    errorMessage: "Failed to update profile",
    showSuccess: true,
    loading,
    toast,
    onSuccess: (data) => {
      authStore.setUser(data);
      touched.value = false;
    },
  });
}
</script>

<style scoped>
.info-card {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  padding: 1.25rem;
}

.info-card-title {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 1rem 0;
}

.info-label {
  font-size: var(--font-size-body-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
}

.info-value {
  font-size: var(--font-size-body-s);
  color: var(--color-text-primary);
}
</style>
