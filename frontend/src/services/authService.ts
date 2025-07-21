import api from "../api/apiClient";
import type {
  RegisterFormData,
  LoginFormData,
  LoginResponse,
} from "../types/auth.type";
import { handleAxiosError } from "../utils/handleError";

export const registerUser = async (data: RegisterFormData) => {
  try {
    const response = await api.post("/users/register", data);
    return response.data;
  } catch (err) {
    throw handleAxiosError(err, "auth.register_failed");
  }
};

export const loginUser = async (
  data: LoginFormData
): Promise<{ data: LoginResponse }> => {
  try {
    const res = await api.post("/auth/login", data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "auth.login_failed");
  }
};

export const resendVerifyEmail = async (email: string) => {
  try {
    const response = await api.post("/emailVerify/resend", { email });
    return response.data;
  } catch (err) {
    throw handleAxiosError(err, "auth.resend_failed");
  }
};

//  Reset Pass
export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  } catch (err) {
    throw handleAxiosError(err, "auth.forgot_password_failed");
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await api.post("/auth/reset-password", {
      token,
      new_password: newPassword,
    });
    return response.data;
  } catch (err) {
    throw handleAxiosError(err, "auth.reset_password_failed");
  }
};