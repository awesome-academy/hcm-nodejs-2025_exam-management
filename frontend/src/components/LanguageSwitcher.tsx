import { useTranslation } from "react-i18next";
import "../styles/LanguageSwitcher.css";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation("common");

  const changeLang = (lang: "vi" | "en") => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${i18n.language === "vi" ? "active" : ""}`}
        onClick={() => changeLang("vi")}
      >
        {t("lang_vi")}
      </button>
      <button
        className={`lang-btn ${i18n.language === "en" ? "active" : ""}`}
        onClick={() => changeLang("en")}
      >
        {t("lang_en")}
      </button>
    </div>
  );
};

export default LanguageSwitcher;
