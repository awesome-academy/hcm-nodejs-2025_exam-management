import { useState, useEffect } from "react";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUsersList,
  updateUserStatus,
} from "../services/userService";
import type {
  UserSerializer,
  UpdateProfileFormData,
  ChangePasswordFormData,
  ProfileFormValues,
  UpdateUserStatusDto,
} from "../types/user.type";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useAuth } from "./useAuth";

export const useUser = () => {
  const [user, setUser] = useState<UserSerializer | null>(null);
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState<UserSerializer[]>([]);
  const [loadingUsersList, setLoadingUsersList] = useState(false);

  const { t } = useTranslation("user");
  const { token, logout } = useAuth();

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await getUserProfile();
      setUser(data);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersList = async () => {
    setLoadingUsersList(true);
    try {
      const res = await getUsersList();
      const users = res.data || [];
      setUsersList(users);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoadingUsersList(false);
    }
  };

  const onUpdateProfile = async (
    values: ProfileFormValues
  ): Promise<boolean> => {
    try {
      const file = values.image?.[0]?.originFileObj;

      const payload: UpdateProfileFormData = {
        full_name: values.full_name,
        file,
      };
      console.log(payload);

      await updateUserProfile(payload);
      toast.success(t("update_success"));
      await fetchUser();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  const onChangePassword = async (
    values: ChangePasswordFormData
  ): Promise<boolean> => {
    try {
      await changePassword(values);
      toast.success(t("change_password_success"));
      logout();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };
  const onUpdateUserStatus = async (
    userId: number,
    statusData: UpdateUserStatusDto
  ): Promise<boolean> => {
    try {
      await updateUserStatus(userId, statusData);
      toast.success(t("update_status_success"));
      await fetchUsersList();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  useEffect(() => {
    if (user?.role_name === "suppervisor") {
      fetchUsersList();
    }
  }, [user]);

  return {
    user,
    loading,
    usersList,
    loadingUsersList,
    fetchUser,
    fetchUsersList,
    onUpdateProfile,
    onChangePassword,
    onUpdateUserStatus,
  };
};
