import React, { useEffect, useState } from "react";
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
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getTestSessionDetailAdmin } from "../../services/test_sessionService";
import type { TestSessionSerializer } from "../../types/test_session.type";
import type { AnswerWithOriginal } from "../../types/answer.type";
import { useTranslation } from "react-i18next";

const { Title, Paragraph, Text } = Typography;

const TestReviewDetail: React.FC = () => {
  const { t } = useTranslation("dotest");
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<TestSessionSerializer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await getTestSessionDetailAdmin(Number(sessionId));
        setSession(res.data ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) fetchSession();
  }, [sessionId]);

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
    (sum, ua) => sum + (ua.question?.points ?? 0),
    0
  );

  return (
    <div className="test-layout">
      {/* LEFT: Question Area */}
      <div className="question-area">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/suppervisor/tests")}
          type="default"
          style={{ marginBottom: 16 }}
        >
          Quay lại danh sách
        </Button>

        <Title level={2}>
          {t("result_title", { title: session.test.title })}
        </Title>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Alert
              message={`${t("your_score", { score })} / ${totalScore} ${t(
                "points"
              )}`}
              description={`${t(
                "correct_answers"
              )}: ${correctCount}/${totalQuestions}`}
              type="info"
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

                <Radio.Group
                  value={selectedAnswerId}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {answers.map((answer, i) => {
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

                {!selectedAnswer && (
                  <Text type="secondary" italic>
                    {t("no_answer_selected")}
                  </Text>
                )}

                {/* ✅ Giải thích đáp án đúng */}
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

      {/* RIGHT: Sidebar */}
      <div className="sidebar">
        <Card>
          <Title level={5}>{t("info")}</Title>
          <Paragraph>
            <Text strong>{t("name")}:</Text> {session.test.title}
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
          <Paragraph>
            <Text strong>{t("user")}:</Text> {session.user?.full_name} (ID{" "}
            {session.user_id})
          </Paragraph>
        </Card>
      </div>
    </div>
  );
};
export default TestReviewDetail;
