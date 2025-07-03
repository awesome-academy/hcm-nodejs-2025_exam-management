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
    throw handleAxiosError(err, "Đăng ký thất bại");
  }
};

export const loginUser = async (
  data: LoginFormData
): Promise<{ data: LoginResponse }> => {
  try {
    const res = await api.post("/auth/login", data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "Đăng nhập thất bại");
  }
};

export const resendVerifyEmail = async (email: string) => {
  try {
    const response = await api.post("/emailVerify/resend", { email });
    return response.data;
  } catch (err) {
    throw handleAxiosError(err, "Gửi lại email xác thực thất bại");
  }
};
