import { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Input, Button, Card, Modal } from "antd";
import ResendVerify from "../../components/ResendVerify";
import "../../styles/LoginPage.css";
import { useAuthForm } from "../../hooks/useAuthForm";
import { useEmailVerifyQuery } from "../../hooks/useEmailVerifyQuery";
import { useTranslation } from "react-i18next";

const Login = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleLogin } = useAuthForm();
  useEmailVerifyQuery();
  const { t } = useTranslation("auth");

  return (
    <div className="login-container">
      <Card title={t("login_title")} className="login-card">
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="username"
            label={t("username")}
            rules={[{ required: true, message: t("username_required") }]}
          >
            <Input placeholder={t("username")} />
          </Form.Item>

          <Form.Item
            name="password"
            label={t("password")}
            rules={[{ required: true, message: t("password_required") }]}
          >
            <Input.Password placeholder={t("password")} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t("login")}
            </Button>
          </Form.Item>
        </Form>

        <div className="login-links">
          <p>
            {t("dont_have_account")} <Link to="/register">{t("register")}</Link>
          </p>
          <p>
            <span
              style={{ color: "#1677ff", cursor: "pointer" }}
              onClick={() => setIsModalOpen(true)}
            >
              {t("not_verified")}
            </span>
          </p>
        </div>
      </Card>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <ResendVerify onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Login;
