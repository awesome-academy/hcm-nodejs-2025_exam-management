import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import "../../styles/HomePage.css";
import LanguageSwitcher from "../../components/LanguageSwitcher"; 

const HomePage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const { t } = useTranslation("auth");

  return (
    <div className="home-container">
      <LanguageSwitcher />
      <Card title={t("welcome")} className="home-card">
        {isLoggedIn ? (
          <Button type="primary" danger block onClick={logout}>
            {t("logout")}
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
              {t("login")}
            </Button>
            <Button
              type="default"
              size="large"
              block
              onClick={() => navigate("/register")}
            >
              {t("register")}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default HomePage;
