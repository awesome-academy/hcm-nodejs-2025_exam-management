import { useState } from "react";
import { useAuthForm } from "../hooks/useAuthForm";

const ResendVerify = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [email, setEmail] = useState("");
  const { handleResend } = useAuthForm();

  const onResend = () => {
    handleResend(email, onSuccess);
  };

  return (
    <div className="resend-modal-container">
      <h3>Gửi lại email xác thực</h3>
      <input
        className="resend-input"
        type="email"
        placeholder="Nhập email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="resend-button" onClick={onResend}>
        Gửi lại
      </button>
    </div>
  );
};

export default ResendVerify;
