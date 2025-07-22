import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthForm } from "../hooks/useAuthForm";

const ForgotPassword = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [email, setEmail] = useState("");
  const { handleForgotPassword } = useAuthForm();
  const { t } = useTranslation("auth");

  const onSubmit = () => {
    handleForgotPassword(email, onSuccess);
  };

  return (
    <div className="resend-modal-container">
      <h3>{t("forgot_password_title")}</h3>
      <input
        className="resend-input"
        type="email"
        placeholder={t("email_placeholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="resend-button" onClick={onSubmit}>
        {t("reset_button")}
      </button>
    </div>
  );
};

export default ForgotPassword;
