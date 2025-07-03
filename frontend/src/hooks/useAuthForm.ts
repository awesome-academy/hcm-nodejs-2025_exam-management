import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser, registerUser, resendVerifyEmail } from "../services/authService";
import { useAuth } from "./useAuth";
import type { LoginFormData, RegisterFormData } from "../types/auth.type";

export const useAuthForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (data: LoginFormData) => {
    try {
      const res = await loginUser(data);
      login(res.data.access_token);
      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast.success("Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleResend = async (email: string, onSuccess?: () => void) => {
    try {
      await resendVerifyEmail(email);
      toast.success("Đã gửi lại email xác thực!");
      onSuccess?.();
    } catch (err) {
      toast.error("Gửi lại thất bại: " + (err as Error).message);
    }
  };

  return { handleLogin, handleRegister, handleResend };
};
