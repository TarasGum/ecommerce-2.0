// composables/useProfile.ts
// Profile composable handles user profile API calls

import type {
  User,
  UpdateProfileRequest,
} from "~/types/models";
import { useAuthStore } from "~/stores/auth";

export const useProfile = () => {
  const api = useApi();

  /**
   * Get current user profile
   * @returns User profile data
   */
  async function getProfile(): Promise<User> {
    return api.get<User>("/auth/me/");
  }

  /**
   * Update current user profile
   * @param data - Profile fields to update (first_name, last_name)
   * @returns Updated user profile
   */
  async function updateProfile(data: UpdateProfileRequest): Promise<User> {
    return api.patch<User>("/auth/me/", data);
  }

  /**
   * Change current user's password
   * @param data - Password change data (old_password, new_password, new_password_confirm)
   * @returns void on success
   */
  async function changePassword(data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<void> {
    return api.post<void>("/auth/change-password/", data);
  }

  /**
   * Deactivate current user's account
   * Uses PATCH /users/{id}/ with is_active: false
   * Account can be reactivated later by an admin
   * @returns Updated user data
   */
  async function deactivateAccount(): Promise<User> {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;
    
    if (!userId) {
      throw new Error("User not found");
    }
    
    return api.patch<User>(`/users/${userId}/`, { is_active: false });
  }

  /**
   * Permanently delete current user's account
   * Uses DELETE /users/{id}/
   * This action cannot be undone
   * @returns void on success
   */
  async function deleteAccount(): Promise<void> {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;
    
    if (!userId) {
      throw new Error("User not found");
    }
    
    return api.delete(`/users/${userId}/`);
  }

  return {
    getProfile,
    updateProfile,
    changePassword,
    deactivateAccount,
    deleteAccount,
  };
};
