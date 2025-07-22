import type { paths, components } from "../types/api";

export type UserSerializer = components["schemas"]["UserSerializer"];

export interface UpdateProfileFormData {
  full_name?: string;
  avatar_url?: string;
  file?: File;
}

export interface ProfileFormValues {
  full_name: string;
  email: string;
  username?: string;
  image?: {
    originFileObj: File;
  }[];
}

export type UpdateUserStatusDto = components["schemas"]["UpdateStatusDto"];

export interface ChangePasswordFormData {
  current_password: string;
  new_password: string;
}

export type UpdateProfileResponse =
  paths["/users/profile"]["put"]["responses"]["200"]["content"]["application/json"];

export type ChangePasswordResponse =
  paths["/users/change-password"]["put"]["responses"]["200"]["content"]["application/json"];

export type UserListResponse =
  paths["/users/user-list"]["get"]["responses"]["200"]["content"]["application/json"];

export type UpdateUserStatusResponse =
  paths["/users/{id}/status"]["put"]["responses"]["200"]["content"]["application/json"];
