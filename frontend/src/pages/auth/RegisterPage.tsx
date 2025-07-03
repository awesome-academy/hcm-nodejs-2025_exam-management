import { Form, Input, Button, Card } from "antd";
import { Link } from "react-router-dom";
import { useAuthForm } from "../../hooks/useAuthForm";
import "../styles/RegisterPage.css";

const Register = () => {
  const { handleRegister } = useAuthForm();

  return (
    <div className="register-container">
      <Card title="Đăng ký tài khoản" className="register-card">
        <Form layout="vertical" onFinish={handleRegister}>
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
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="abc@gmail.com" />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
        <div className="register-links">
          <p>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
