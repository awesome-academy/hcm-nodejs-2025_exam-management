import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useAuthForm } from "../../hooks/useAuthForm";
import "../../styles/ResetPasswordPage.css";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 Thêm state này

  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const { handleResetPassword } = useAuthForm();

  const handleSubmit = async () => {
    if (!token) {
      toast.error(t("token_missing"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("password_too_short"));
      return;
    }
    await handleResetPassword(token, newPassword, () => {
      navigate("/login");
    });
  };

  return (
    <div className="reset-password-container">
      <h2>{t("reset_password_title")}</h2>

      <div className="password-input-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={t("new_password_placeholder")}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoFocus
        />
        <span
          className="password-toggle-icon"
          onClick={() => setShowPassword((prev) => !prev)}
          style={{ cursor: "pointer", marginLeft: 8 }}
        >
          {showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
        </span>
      </div>

      <button onClick={handleSubmit} disabled={newPassword.length < 6}>
        {t("reset_button")}
      </button>
    </div>
  );
};

export default ResetPasswordPage;
