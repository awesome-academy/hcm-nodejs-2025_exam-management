import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export const useEmailVerifyQuery = () => {
  const location = useLocation();
  const { t } = useTranslation("auth");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verify = params.get("verify");
    const message = params.get("message");

    if (verify === "success") {
      toast.success(t("verify_success"));
    } else if (verify === "fail") {
      toast.error(
        `${t("verify_failed")}: ${decodeURIComponent(message || "")}`
      );
    }
  }, [location.search, t]);
};
