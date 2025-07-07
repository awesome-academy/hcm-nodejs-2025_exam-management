import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { DownOutlined, GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import "../styles/LanguageSwitcher.css";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation("common");

  const changeLang = (lang: "vi" | "en") => {
    i18n.changeLanguage(lang);
  };


  const items: MenuProps["items"] = [
    {
      key: "vi",
      label: (
        <span onClick={() => changeLang("vi")}>
          {t("lang_vi")}
        </span>
      ),
    },
    {
      key: "en",
      label: (
        <span onClick={() => changeLang("en")}>
          {t("lang_en")}
        </span>
      ),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" arrow>
      <div className="language-switcher">
        <GlobalOutlined />
        <span className="label">{t(`lang_${i18n.language}`)}</span>
        <DownOutlined style={{ fontSize: 10 }} />
      </div>
    </Dropdown>
  );
};

export default LanguageSwitcher;
