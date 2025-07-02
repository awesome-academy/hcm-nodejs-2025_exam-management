import { useState } from "react";
import { useAuthForm } from "../hooks/useAuthForm";
import { useTranslation } from "react-i18next";
const ResendVerify = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [email, setEmail] = useState("");
  const { handleResend } = useAuthForm();
  const { t } = useTranslation("auth");

  const onResend = () => {
    handleResend(email, onSuccess);
  };

  return (
    <div className="resend-modal-container">
      <h3>{t("resend_title")}</h3>
      <input
        className="resend-input"
        type="email"
        placeholder={t("auth.email_placeholder")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="resend-button" onClick={onResend}>
        {t("resend_button")}
      </button>
    </div>
  );
};

export default ResendVerify;
