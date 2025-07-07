import { Layout, Menu } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthForm } from "../hooks/useAuthForm";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import "../styles/Layouts.css";

const { Header, Content } = Layout;

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogout } = useAuthForm();
  const { t } = useTranslation("user");

  const getSelectedKey = () => {
    if (location.pathname.includes("/subjects")) return "subjects";
    if (location.pathname.includes("/tests")) return "tests";
    if (location.pathname.includes("/history")) return "history";
    return "";
  };

  const menuItems = [
    {
      key: "subjects",
      label: t("subjects"),
      onClick: () => navigate("/subjects"),
    },
    {
      key: "tests",
      label: t("tests"),
      onClick: () => navigate("/tests"),
    },
    {
      key: "history",
      label: t("history"),
      onClick: () => navigate("/history"),
    },
    {
      key: "logout",
      label: t("logout"),
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="layout-container">
      <Header className="layout-header">
        <Menu
          theme="dark"
          mode="horizontal"
          items={menuItems}
          selectedKeys={[getSelectedKey()]}
          style={{ flex: 1 }}
        />
        <LanguageSwitcher />
      </Header>
      <Content className="layout-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default UserLayout;
