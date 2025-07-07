import { Form, Input, Button, Card } from "antd";
import { Link } from "react-router-dom";
import { useAuthForm } from "../../hooks/useAuthForm";
import { useTranslation } from "react-i18next";
import "../../styles/RegisterPage.css";

const Register = () => {
  const { handleRegister } = useAuthForm();
  const { t } = useTranslation("auth");

  return (
    <div className="register-container">
      <Card title={t("register_title")} className="register-card">
        <Form layout="vertical" onFinish={handleRegister}>
          <Form.Item
            name="username"
            label={t("username")}
            rules={[{ required: true, message: t("username_required") }]}
          >
            <Input placeholder={t("username")} />
          </Form.Item>

          <Form.Item
            name="email"
            label={t("email")}
            rules={[
              { required: true, message: t("email_required") },
              { type: "email", message: t("email_invalid") },
            ]}
          >
            <Input placeholder="abc@gmail.com" />
          </Form.Item>

          <Form.Item
            name="full_name"
            label={t("full_name")}
            rules={[{ required: true, message: t("full_name_required") }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label={t("password")}
            rules={[{ required: true, message: t("password_required") }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t("register")}
            </Button>
          </Form.Item>
        </Form>
        <div className="register-links">
          <p>
            {t("already_have_account")} <Link to="/login">{t("login")}</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
