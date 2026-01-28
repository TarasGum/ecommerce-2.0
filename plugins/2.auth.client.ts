// plugins/2.auth.client.ts
// Load projects for superadmin after hydration

import { useAuthStore } from "~/stores/auth";
import { useProjectsStore } from "~/stores/projects";

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  const projectsStore = useProjectsStore();
  
  // Load projects for super admins after hydration
  if (authStore.user?.role === 'superadmin') {
    projectsStore.loadProjects().catch(() => {
      // Silently fail - errors shown via toast in store
    });
  }
});
