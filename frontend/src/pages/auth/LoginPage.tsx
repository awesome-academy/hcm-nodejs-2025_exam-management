import { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Input, Button, Card, Modal } from "antd";
import ResendVerify from "../../components/ResendVerify";
import "../styles/LoginPage.css";
import { useAuthForm } from "../../hooks/useAuthForm";
import { useEmailVerifyQuery } from "../../hooks/useEmailVerifyQuery";

const Login = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleLogin } = useAuthForm();
  useEmailVerifyQuery();

  return (
    <div className="login-container">
      <Card title="Đăng nhập" className="login-card">
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div className="login-links">
          <p>
            Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
          <p>
            <span
              style={{ color: "#1677ff", cursor: "pointer" }}
              onClick={() => setIsModalOpen(true)}
            >
              Chưa nhận được email xác thực?
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
