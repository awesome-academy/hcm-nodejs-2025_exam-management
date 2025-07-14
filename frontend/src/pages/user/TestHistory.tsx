import { useEffect, useState } from "react";
import { List, Card, Typography, Spin, message, Tag, Space, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import { getTestSessionHistory } from "../../services/test_sessionService";
import type { TestSessionSerializer } from "../../types/test_session.type";
import { useTranslation } from "react-i18next";

const { Title, Paragraph, Text } = Typography;

const TestHistory = () => {
  const { t } = useTranslation("test_history");
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<TestSessionSerializer[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getTestSessionHistory();
        setSessions(res.data || []);
      } catch {
        message.error(t("load_result_failed"));
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [t]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <Spin tip={t("loading_test")} size="large" />
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <Empty description={t("no_data")} />
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        {t("test_history")}
      </Title>

      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={sessions}
        renderItem={(item) => {
          const score = item.score ?? 0;
          const totalScore =
            item.user_answers?.reduce(
              (sum, ua) => sum + (ua.question?.points ?? 0),
              0
            ) ?? 0;

          const submittedAt = item.submitted_at
            ? new Date(item.submitted_at).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }) +
              " " +
              new Date(item.submitted_at).toLocaleDateString("vi-VN")
            : t("no_data");

          const isSubmitted = !!item.submitted_at;

          return (
            <List.Item>
              <Card
                hoverable
                onClick={() => navigate(`/results/${item.id}?fromHistory=true`)}
                style={{ borderRadius: 12 }}
              >
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <Text strong>{item.test?.title || t("no_test_title")}</Text>
                  <Space wrap>
                    <Tag color="blue">{t("submitted_at")}: {submittedAt}</Tag>
                    <Tag color={isSubmitted ? "green" : "red"}>
                      {t("status")}: {t(isSubmitted ? "status_submitted" : "status_not_submitted")}
                    </Tag>
                  </Space>
                  <Paragraph style={{ margin: 0 }}>
                    <Text strong>{t("score")}:</Text> {score} / {totalScore} {t("points")}
                  </Paragraph>
                </Space>
              </Card>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default TestHistory;
