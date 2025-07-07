import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser, registerUser, resendVerifyEmail } from "../services/authService";
import { useAuth } from "./useAuth";
import type { LoginFormData, RegisterFormData } from "../types/auth.type";
import { useTranslation } from "react-i18next";
export const useAuthForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation("auth"); 

  const handleLogin = async (data: LoginFormData) => {
    try {
      const res = await loginUser(data);
      login(res.data.access_token);
      toast.success(t("login_success"));
      navigate("/");
    } catch (err) {
      toast.error((err as Error).message);
    }
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

  return { handleLogin, handleRegister, handleResend };
};
