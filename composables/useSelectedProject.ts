// composables/useSelectedProject.ts
// Global state for selected project (SuperAdmin only)

import type { Project } from "~/types/models";
import { USER_ROLES } from "~/utils/constants";

const selectedProjectId = ref<number | null>(null);
const projects = ref<Project[]>([]);
const projectsLoading = ref(false);

export const useSelectedProject = () => {
  const projectsApi = useProjects();
  const toast = useToast();
  const auth = useAuth();

  const isSuperAdmin = computed(() => auth.user.value?.role === USER_ROLES.SUPERADMIN);

  const projectOptions = computed(() => {
    return projects.value.map((project) => ({
      label: project.name,
      value: project.id,
    }));
  });

  const selectedProject = computed(() => {
    if (selectedProjectId.value === null) return null;
    return projects.value.find(p => p.id === selectedProjectId.value) || null;
  });

  async function loadProjects() {
    if (!isSuperAdmin.value) return;
    
    projectsLoading.value = true;
    try {
      const response = await projectsApi.list({ page: 1 });
      projects.value = response.results;
      
      // Set first project as default if not already set and projects exist
      if (selectedProjectId.value === null && projects.value.length > 0) {
        selectedProjectId.value = projects.value[0].id;
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast.showError(error, "Failed to Load Projects");
    } finally {
      projectsLoading.value = false;
    }
  }

  function setSelectedProject(projectId: number | null) {
    selectedProjectId.value = projectId;
  }

  return {
    selectedProjectId,
    projects,
    projectsLoading,
    isSuperAdmin,
    projectOptions,
    selectedProject,
    loadProjects,
    setSelectedProject,
  };
};
