import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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
  Button,
} from "antd";
import { getTestSessionById } from "../../services/test_sessionService";
import type { TestSessionSerializer } from "../../types/test_session.type";
import type { AnswerWithOriginal } from "../../types/answer.type";
import { useTranslation } from "react-i18next";
import "../../styles/DoTest.css";

const { Title, Paragraph, Text } = Typography;

const TestResult: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation("dotest");

  const [session, setSession] = useState<TestSessionSerializer | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const isFromHistory = searchParams.get("fromHistory") === "true";

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
  const hasEssay = session.user_answers.some(
    (ua) => ua.question?.question_type === "essay" && !ua.graded_at
  );

  const correctCount = session.user_answers.filter((a) => a.is_correct).length;
  const totalQuestions = session.user_answers.length;
  const score = session.score ?? 0;
  const totalScore = session.user_answers.reduce(
    (sum, ua) => sum + (ua.question?.points ?? 0),
    0
  );

  const testTitle = session.test.title;

  return (
    <div className="test-layout">
      <div className="question-area">
        <Button
          type="default"
          onClick={() => navigate(isFromHistory ? "/history" : "/dotest")}
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
          {session.user_answers.map((item, index) => {
            const q = item.question;
            const answers = (q.answers || []) as AnswerWithOriginal[];

            const selectedAnswer = answers.find(
              (a) => a.id === item.answer_id || a.original_id === item.answer_id
            );
            const selectedAnswerId = selectedAnswer?.id;

            const correctAnswer = answers.find((a) => a.is_correct);
            const correctAnswerId = correctAnswer?.id;

            return (
              <Card
                key={q.id}
                title={`${t("question_number", { index: index + 1 })}`}
                className="quiz-question-card"
              >
                <Paragraph className="question-text">
                  {q.question_text}
                </Paragraph>

                {q.question_type === "essay" ? (
                  <>
                    <Paragraph
                      style={{
                        background: "#f0f5ff",
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: "1px solid #d6e4ff",
                      }}
                    >
                      <Text strong>{t("your_answer")}:</Text>{" "}
                      {item.answer_text ? (
                        <Text>{item.answer_text}</Text>
                      ) : (
                        <Text type="secondary" italic>
                          {t("no_answer_submitted")}
                        </Text>
                      )}
                    </Paragraph>

                    {correctAnswer?.answer_text && (
                      <Paragraph style={{ marginTop: 12 }}>
                        <Text strong style={{ color: "#1890ff" }}>
                          {t("expected_answer")}:
                        </Text>{" "}
                        {correctAnswer.answer_text}
                      </Paragraph>
                    )}

                    {correctAnswer?.explanation && (
                      <Paragraph style={{ marginTop: 12 }}>
                        <Text strong style={{ color: "#28a745" }}>
                          {t("explanation")}:
                        </Text>{" "}
                        {correctAnswer.explanation}
                      </Paragraph>
                    )}
                  </>
                ) : (
                  <>
                    <Radio.Group
                      value={selectedAnswerId}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {answers.map((answer, i) => {
                        const isSelected = selectedAnswerId === answer.id;
                        const isCorrect = answer.id === correctAnswerId;

                        let backgroundColor = "";
                        if (isSelected && isCorrect)
                          backgroundColor = "#d4edda";
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

                    {!selectedAnswer && (
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
                  </>
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
            <Text strong>{hasEssay ? t("temporary_score") : t("score")}:</Text>{" "}
            {score} / {totalScore} {t("points")}
          </Paragraph>
          <Paragraph>
            <Text strong>{t("questions_count")}:</Text> {totalQuestions}
          </Paragraph>
          <Paragraph>
            <Text strong>{t("correct_answers")}:</Text> {correctCount}
          </Paragraph>
          {hasEssay && (
            <Paragraph>
              <Text type="warning" strong>
                ⚠️ {t("some_essays_not_graded_yet")}
              </Text>
            </Paragraph>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TestResult;
