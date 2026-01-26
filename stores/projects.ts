// stores/projects.ts
// Pinia store for managing projects and project selection (SuperAdmin feature)

import { defineStore } from 'pinia';
import type { Project } from '~/types/models';

export const useProjectsStore = defineStore('projects', () => {
  // ===== State =====
  const selectedProjectId = ref<number | null>(null);
  const projects = ref<Project[]>([]);
  const loading = ref(false);

  // ===== Getters =====
  const selectedProject = computed(() => {
    if (selectedProjectId.value === null) return null;
    return projects.value.find(p => p.id === selectedProjectId.value) || null;
  });

  const projectOptions = computed(() => {
    return projects.value.map((project) => ({
      label: project.name,
      value: project.id,
    }));
  });

  const hasProjects = computed(() => projects.value.length > 0);

  // ===== Actions =====
  async function loadProjects() {
    // Check if user is super admin before loading
    const auth = useAuth();
    const isSuperAdmin = computed(() => auth.user.value?.role === 'superadmin');
    
    if (!isSuperAdmin.value) return;

    loading.value = true;
    try {
      const projectsApi = useProjects();
      const response = await projectsApi.list({ page: 1 });
      projects.value = response.results;

      // Auto-select first project if none selected and projects exist
      if (selectedProjectId.value === null && projects.value.length > 0) {
        selectedProjectId.value = projects.value[0].id;
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      const toast = useToast();
      toast.showError(error, 'Failed to Load Projects');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function setSelectedProject(projectId: number | null) {
    selectedProjectId.value = projectId;
  }

  function clearSelection() {
    selectedProjectId.value = null;
  }

  function reset() {
    selectedProjectId.value = null;
    projects.value = [];
    loading.value = false;
  }

  return {
    // State
    selectedProjectId,
    projects,
    loading,
    // Getters
    selectedProject,
    projectOptions,
    hasProjects,
    // Actions
    loadProjects,
    setSelectedProject,
    clearSelection,
    reset,
  };
});
