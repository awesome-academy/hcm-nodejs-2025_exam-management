import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation("common");

  return (
    <footer style={{ textAlign: "center", padding: 16 }}>
      © {new Date().getFullYear()} {t("footer_text")}
    </footer>
  );
};

export default Footer;
