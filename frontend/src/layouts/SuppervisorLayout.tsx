import { Layout, Menu, Avatar, Dropdown } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthForm } from "../hooks/useAuthForm";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import "../styles/Suppervisor.css";

const { Sider, Header, Content } = Layout;

const SupervisorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogout } = useAuthForm();
  const { t } = useTranslation("supervisor");

  const getSelectedKey = () => {
    if (location.pathname.includes("subjects")) return "subjects";
    if (location.pathname.includes("questions")) return "questions";
    if (location.pathname.includes("test-management")) return "test-management";
    if (location.pathname.includes("tests")) return "tests";
    return "";
  };

  const menuItems = [
    {
      key: "subjects",
      label: t("subjects"),
      onClick: () => navigate("/suppervisor/subjects"),
    },
    {
      key: "questions",
      label: t("questions"),
      onClick: () => navigate("/suppervisor/questions"),
    },
    {
      key: "test-management",
      label: t("test_management"),
      onClick: () => navigate("/suppervisor/test-management"),
    },
    {
      key: "tests",
      label: t("tests"),
      onClick: () => navigate("/suppervisor/tests"),
    },
    {
      key: "users",
      label: t("users_management"),
      onClick: () => navigate("/suppervisor/users"),
    },
  ];

  const avatarDropdownItems = [
    {
      key: "profile",
      label: t("profile"),
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      label: t("logout"),
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="supervisor-layout">
      <Sider className="supervisor-sider" width={220}>
        <div className="supervisor-sider-title">{t("sidebar_title")}</div>
        <Menu
          theme="light"
          mode="inline"
          items={menuItems}
          selectedKeys={[getSelectedKey()]}
        />
      </Sider>

      <Layout className="supervisor-main">
        <Header className="supervisor-header">
          <div className="supervisor-header-actions">
            <LanguageSwitcher />
            <Dropdown
              menu={{ items: avatarDropdownItems }}
              placement="bottomRight"
            >
              <Avatar icon={<UserOutlined />} style={{ cursor: "pointer" }} />
            </Dropdown>
          </div>
        </Header>

        <Content className="supervisor-content">
          <Outlet />
        </Content>

        <Footer />
      </Layout>
    </Layout>
  );
};

export default SupervisorLayout;
