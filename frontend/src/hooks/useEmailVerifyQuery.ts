import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

export const useEmailVerifyQuery = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verify = params.get("verify");
    const message = params.get("message");

    if (verify === "success") {
      toast.success("Email đã được xác thực thành công!");
    } else if (verify === "fail") {
      toast.error(`Xác thực thất bại: ${decodeURIComponent(message || "")}`);
    }
  }, [location.search]);
};

