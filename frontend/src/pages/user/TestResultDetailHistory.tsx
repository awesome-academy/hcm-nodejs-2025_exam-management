import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Spin,
  Radio,
  Space,
  Alert,
  Row,
  Col,
  Button,
  message,
} from "antd";
import { getTestSessionHistoryDetail } from "../../services/test_sessionService";
import { useTranslation } from "react-i18next";
import type { TestSessionSerializer } from "../../types/test_session.type";
import "../../styles/DoTest.css";

const { Title, Paragraph, Text } = Typography;

const TestResultDetailHistory = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("dotest");

  const [session, setSession] = useState<TestSessionSerializer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getTestSessionHistoryDetail(Number(sessionId));
        if (res.data) {
          setSession(res.data);
        } else {
          message.error(t("load_result_failed"));
        }
      } catch {
        message.error(t("load_result_failed"));
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) fetchDetail();
  }, [sessionId, t]);

  if (loading || !session) {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <Spin tip={t("loading_test")} size="large" />
      </div>
    );
  }

  const correctCount = session.test_session_questions.filter((tsq) => {
    const correctAnswer = tsq.answers_snapshot?.find((a) => a.is_correct);
    return tsq.user_answer?.answer_id === correctAnswer?.id;
  }).length;

  const totalQuestions = session.test_session_questions.length;
  const score = session.score ?? 0;
  const totalScore = session.test_session_questions.reduce(
    (sum, tsq) => sum + (tsq.question?.points ?? 0),
    0
  );

  const testTitle = session.test?.title || "";

  return (
    <div className="test-layout">
      <div className="question-area">
        <Button
          type="default"
          onClick={() => navigate("/history")}
          style={{ marginBottom: 16 }}
        >
          ← {t("back")}
        </Button>

        <Title level={2}>{t("result_title", { title: testTitle })}</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Alert
              message={`${t("your_score", { score })} / ${totalScore} ${t(
                "points"
              )}`}
              description={`${t(
                "correct_answers"
              )}: ${correctCount}/${totalQuestions}`}
              type="success"
              showIcon
            />
          </Col>
        </Row>

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {session.test_session_questions.map((tsq, index) => {
            const question = tsq.question;
            const answers = tsq.answers_snapshot ?? [];
            const selectedAnswerId = tsq.user_answer?.answer_id;
            const correctAnswer = answers.find((a) => a.is_correct);

            return (
              <Card
                key={tsq.id}
                title={`${t("question_number", { index: index + 1 })}`}
                className="quiz-question-card"
              >
                <Paragraph className="question-text">
                  {question?.question_text}
                </Paragraph>

                <Radio.Group
                  value={selectedAnswerId}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {answers.map((answer, i) => {
                    const isSelected = selectedAnswerId === answer.id;
                    const isCorrect = answer.is_correct;

                    let backgroundColor = "";
                    if (isSelected && isCorrect) backgroundColor = "#d4edda";
                    else if (isSelected && !isCorrect)
                      backgroundColor = "#f8d7da";
                    else if (!isSelected && isCorrect)
                      backgroundColor = "#cce5ff";

                    return (
                      <Radio
                        key={answer.id}
                        value={answer.id}
                        disabled
                        style={{
                          backgroundColor,
                          padding: "6px 10px",
                          borderRadius: 6,
                          border:
                            isCorrect && isSelected
                              ? "1px solid #28a745"
                              : isSelected
                              ? "1px solid #dc3545"
                              : isCorrect
                              ? "1px solid #007bff"
                              : undefined,
                        }}
                      >
                        <b>{String.fromCharCode(65 + i)}.</b>{" "}
                        {answer.answer_text}
                      </Radio>
                    );
                  })}
                </Radio.Group>

                {!selectedAnswerId && (
                  <Text type="secondary" italic>
                    {t("no_answer_selected")}
                  </Text>
                )}

                {correctAnswer?.explanation && (
                  <Paragraph style={{ marginTop: 12 }}>
                    <Text strong style={{ color: "#28a745" }}>
                      {t("explanation")}:
                    </Text>{" "}
                    {correctAnswer.explanation}
                  </Paragraph>
                )}
              </Card>
            );
          })}
        </Space>
      </div>

      <div className="sidebar">
        <Card>
          <Title level={5}>{t("info")}</Title>
          <Paragraph>
            <Text strong>{t("name")}:</Text> {testTitle}
          </Paragraph>
          <Paragraph>
            <Text strong>{t("score")}:</Text> {score} / {totalScore}{" "}
            {t("points")}
          </Paragraph>
          <Paragraph>
            <Text strong>{t("questions_count")}:</Text> {totalQuestions}
          </Paragraph>
          <Paragraph>
            <Text strong>{t("correct_answers")}:</Text> {correctCount}
          </Paragraph>
        </Card>
      </div>
    </div>
  );
};

export default TestResultDetailHistory;
