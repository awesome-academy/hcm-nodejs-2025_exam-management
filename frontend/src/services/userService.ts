import api from "../api/apiClient";
import { handleAxiosError } from "../utils/handleError";

import type {
  UpdateProfileFormData,
  ChangePasswordFormData,
  UpdateProfileResponse,
  ChangePasswordResponse,
  UserSerializer,
  UserListResponse,
  UpdateUserStatusResponse,
  UpdateUserStatusDto,
} from "../types/user.type";

export const getUserProfile = async (): Promise<UserSerializer> => {
  try {
    const res = await api.get("/users/profile");
    return res.data.data;
  } catch (err) {
    throw handleAxiosError(err, "user.fetch_profile_failed");
  }
};

export const updateUserProfile = async (
  data: UpdateProfileFormData
): Promise<UpdateProfileResponse> => {
  try {
    const formData = new FormData();
    if (data.full_name) formData.append("full_name", data.full_name);
    if (data.file) formData.append("file", data.file);
    if (data.avatar_url) formData.append("image_url", data.avatar_url);

    const res = await api.put("/users/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "user.update_profile_failed");
  }
};

export const changePassword = async (
  data: ChangePasswordFormData
): Promise<ChangePasswordResponse> => {
  try {
    const res = await api.put("/users/change-password", data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "user.change_password_failed");
  }
};

export const getUsersList = async (): Promise<UserListResponse> => {
  try {
    const res = await api.get("/users/user-list");
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "user.fetch_users_failed");
  }
};

export const updateUserStatus = async (
  id: number,
  data: UpdateUserStatusDto
): Promise<UpdateUserStatusResponse> => {
  try {
    const res = await api.put(`/users/${id}/status`, data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "user.update_status_failed");
  }
};
