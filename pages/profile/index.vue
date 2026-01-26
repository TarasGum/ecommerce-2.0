<!-- pages/profile/index.vue -->
<template>
  <div class="page-wrapper profile-page">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="page-title">My Profile</h1>
    </div>

    <!-- Two-column layout -->
    <div class="columns-container" :class="{ 'single-column': !isSuperAdmin }">
      <!-- Left Column: Profile Cards -->
      <div class="left-column">
        <ProfileInfoCard />
        <SecurityCard />
        <DangerZoneCard />
      </div>

      <!-- Right Column: Payload Logs (SuperAdmin only) -->
      <div v-if="isSuperAdmin" class="right-column">
        <PayloadLogsCard />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProfileInfoCard from "~/components/profile/ProfileInfoCard.vue";
import SecurityCard from "~/components/profile/SecurityCard.vue";
import DangerZoneCard from "~/components/profile/DangerZoneCard.vue";
import PayloadLogsCard from "~/components/profile/PayloadLogsCard.vue";
import { USER_ROLES } from "~/utils/constants";

definePageMeta({
  middleware: "auth",
});

const auth = useAuth();

const isSuperAdmin = computed(() => auth.user.value?.role === USER_ROLES.SUPERADMIN);
</script>

<style scoped>
.profile-page {
  max-width: 1600px;
}

/* Two-column layout */
.columns-container {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.columns-container.single-column {
  grid-template-columns: 1fr;
  max-width: 100%;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* For non-superadmin: display cards in a responsive grid */
.columns-container.single-column .left-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* ProfileInfoCard takes full width of first column */
.columns-container.single-column .left-column > :first-child {
  grid-row: 1 / 3;
}

/* SecurityCard and DangerZoneCard stack in second column */
.columns-container.single-column .left-column > :nth-child(2),
.columns-container.single-column .left-column > :nth-child(3) {
  grid-column: 2;
}

@media (max-width: 1024px) {
  .columns-container {
    grid-template-columns: 1fr;
  }

  .columns-container.single-column .left-column {
    grid-template-columns: 1fr;
  }
  
  .columns-container.single-column .left-column > :first-child {
    grid-row: auto;
  }
  
  .columns-container.single-column .left-column > :nth-child(2),
  .columns-container.single-column .left-column > :nth-child(3) {
    grid-column: auto;
  }
}

.right-column {
  min-width: 0;
}

@media (max-width: 1024px) {
  .columns-container {
    grid-template-columns: 1fr;
  }

  .columns-container.single-column .left-column {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .columns-container.single-column .left-column {
    grid-template-columns: 1fr;
  }
}
</style>
