import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../styles/HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  return (
    <div className="home-container">
      <Card title="Chào mừng bạn" className="home-card">
        {isLoggedIn ? (
          <Button type="primary" danger block onClick={logout}>
            Đăng xuất
          </Button>
        ) : (
          <>
            <Button
              type="primary"
              size="large"
              block
              onClick={() => navigate("/login")}
              style={{ marginBottom: 16 }}
            >
              Đăng nhập
            </Button>
            <Button
              type="default"
              size="large"
              block
              onClick={() => navigate("/register")}
            >
              Đăng ký
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default HomePage;
