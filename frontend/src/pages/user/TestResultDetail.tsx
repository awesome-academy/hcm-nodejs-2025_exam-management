import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Typography,
  Spin,
  Radio,
  Space,
  Alert,
  message,
  Row,
  Col,
} from "antd";
import { getTestSessionById } from "../../services/test_sessionService";
import type { TestSessionSerializer } from "../../types/test_session.type";
import { useTranslation } from "react-i18next";
import "../../styles/DoTest.css";

const { Title, Paragraph, Text } = Typography;

const TestResult: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { t } = useTranslation("dotest");

  const [session, setSession] = useState<TestSessionSerializer | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await getTestSessionById(Number(sessionId));
      setSession(res.data ?? null);
    } catch {
      message.error(t("load_result_failed"));
    } finally {
      setLoading(false);
    }
  }, [sessionId, t]);

  useEffect(() => {
    if (sessionId) fetchSession();
  }, [sessionId, fetchSession]);

  if (loading || !session) {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <Spin tip={t("loading_test")} size="large" />
      </div>
    );
  }

  const correctCount = session.user_answers.filter((a) => a.is_correct).length;
  const totalQuestions = session.user_answers.length;
  const score = session.score ?? 0;
  const totalScore = session.user_answers.reduce(
    (sum, ua) => sum + (ua.question.points ?? 0),
    0
  );

  const testTitle = session.test.title;

  return (
    <div className="test-layout">
      {/* LEFT: Question Area */}
      <div className="question-area">
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
          {session.user_answers.map((item, index) => {
            const q = item.question;
            const correctAnswerId = q.answers.find((a) => a.is_correct)?.id;
            const selectedAnswerId = item.answer_id;

            return (
              <Card
                key={q.id}
                title={`${t("question_number", { index: index + 1 })}`}
                className="quiz-question-card"
              >
                <Paragraph className="question-text">
                  {q.question_text}
                </Paragraph>

                <Radio.Group
                  value={selectedAnswerId}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {q.answers.map((answer, i) => {
                    const isSelected = selectedAnswerId === answer.id;
                    const isCorrect = answer.id === correctAnswerId;

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
              </Card>
            );
          })}
        </Space>
      </div>

      {/* RIGHT: Sidebar */}
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

export default TestResult;
