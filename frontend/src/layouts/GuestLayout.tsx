import { Layout, Menu, Avatar, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuthForm } from "../hooks/useAuthForm";
import { useAuth } from "../hooks/useAuth";
import Footer from "../components/Footer";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import "../styles/Layouts.css";

const { Header, Content } = Layout;

const GuestLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const { handleLogout } = useAuthForm();
  const { t } = useTranslation("guest");

  const getSelectedKey = () => {
    if (location.pathname === "/") return "home";
    if (location.pathname.includes("/subjects")) return "subjects";
    return "";
  };

  const menuItems: MenuProps["items"] = [
    { key: "home", label: t("home"), onClick: () => navigate("/") },
    {
      key: "subjects",
      label: t("subjects"),
      onClick: () => navigate("/subjects"),
    },
  ];

  const dropdownItems: MenuProps["items"] = isLoggedIn
    ? [
        {
          key: "profile",
          label: t("profile"),
          onClick: () => navigate("/"),
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
      ]
    : [
        {
          key: "login",
          label: t("login"),
          onClick: () => navigate("/login"),
        },
        {
          key: "register",
          label: t("register"),
          onClick: () => navigate("/register"),
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
        <div className="guest-user-header-actions">
          <LanguageSwitcher />
          <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
            <a onClick={(e) => e.preventDefault()}>
              <Avatar
                style={{
                  backgroundColor: isLoggedIn ? "#87d068" : "#f56a00",
                  cursor: "pointer",
                }}
                icon={<UserOutlined />}
              />
            </a>
          </Dropdown>
        </div>
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

export default GuestLayout;
