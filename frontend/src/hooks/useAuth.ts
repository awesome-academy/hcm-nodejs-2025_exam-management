import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../contexts/AuthContext";

export const useAuth = () => {
  const { t } = useTranslation("common"); 
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(t("auth_context_missing")); 
  }

  return context;
};

