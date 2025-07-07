import { Button, Card, Typography, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/HomePage.css";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { t } = useTranslation("home");

  const handleStart = () => {
    if (user?.role_name === "user") {
      navigate("/tests");
    } else if (user?.role_name === "suppervisor") {
      navigate("/suppervisor/subjects");
    }
  };

  return (
    <div className="home-container">
      <Card className="home-card">
        <Row gutter={[32, 16]} align="middle">
          <Col xs={24} md={14}>
            <Title>{t("title")}</Title>
            <Paragraph>{t("desc_1")}</Paragraph>
            <Paragraph>{t("desc_2")}</Paragraph>

            {isLoggedIn && (
              <Button type="primary" size="large" onClick={handleStart}>
                {t("enter_system")}
              </Button>
            )}
          </Col>
          <Col xs={24} md={10}>
            <div className="image-wrapper">
              <img
                src="https://gnums.co.in/Default/assets/img-gnweb/Exam_Module_28-07-2023.png"
                alt="Exam illustration"
                className="home-image"
              />
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default HomePage;
