import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  loginUser,
  registerUser,
  resendVerifyEmail,
  forgotPassword,
  resetPassword,
} from "../services/authService";
import { useAuth } from "./useAuth";
import type { LoginFormData, RegisterFormData } from "../types/auth.type";
import { useTranslation } from "react-i18next";
export const useAuthForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const { login, logout } = useAuth();

  const handleLogin = async (data: LoginFormData) => {
    try {
      const res = await loginUser(data);
      const { access_token, user } = res.data;
      login(access_token, user);
      toast.success(t("login_success"));
      if (user.role_name === "user") {
        navigate("/");
      } else if (user.role_name === "suppervisor") {
        navigate("/suppervisor/subjects");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công!");
    navigate("/");
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast.success(t("register_success"));
      navigate("/login");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleResend = async (email: string, onSuccess?: () => void) => {
    try {
      const res = await resendVerifyEmail(email);
      toast.success(res.message);
      onSuccess?.();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleForgotPassword = async (
    email: string,
    onSuccess?: () => void
  ) => {
    try {
      const res = await forgotPassword(email);
      toast.success(res.message);
      onSuccess?.();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleResetPassword = async (
    token: string,
    newPassword: string,
    onSuccess?: () => void
  ) => {
    try {
      const res = await resetPassword(token, newPassword);
      toast.success(res.message);
      onSuccess?.();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return {
    handleLogin,
    handleRegister,
    handleResend,
    handleLogout,
    handleForgotPassword,
    handleResetPassword,
  };
};
