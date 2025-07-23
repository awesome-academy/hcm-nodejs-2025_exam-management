import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Spin,
  Progress,
  Statistic,
  Radio,
  Input,
  Space,
  Row,
  Col,
  Pagination,
} from "antd";
import { useTranslation } from "react-i18next";
import { useTestSession } from "../../hooks/useTestSession";
import "../../styles/DoTest.css";

const { Title, Paragraph, Text } = Typography;
const QUESTIONS_PER_PAGE = 2;

const DoTest: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const testId = Number(id);
  const { t } = useTranslation("dotest");

  const {
    testQuestions,
    loading,
    selectedAnswers,
    setSelectedAnswers,
    sessionId,
    startedAt,
    isSubmitting,
    handleFinish,
    testDetail,
  } = useTestSession(testId, t);

  const [currentPage, setCurrentPage] = useState(1);

  const testDuration = testDetail?.time_limit ?? 15;
  const testTitle = testDetail?.title ?? `Đề số ${testId}`;

  const totalQuestions = testQuestions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  const totalPoints = useMemo(() => {
    return testQuestions.reduce(
      (sum, tq) => sum + (tq.question?.points ?? 0),
      0
    );
  }, [testQuestions]);

  const deadline = useMemo(() => {
    return startedAt + testDuration * 60 * 1000;
  }, [startedAt, testDuration]);

  const handleChange = (
    testSessionQuestionId: number,
    value: { answerId?: number; answerText?: string }
  ) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [testSessionQuestionId]: {
        ...prev[testSessionQuestionId],
        ...value,
      },
    }));
  };

  const handleClearAnswer = (testSessionQuestionId: number) => {
    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[testSessionQuestionId];
      return newAnswers;
    });
  };

  const paginatedQuestions = [...testQuestions]
    .sort((a, b) => a.order_number - b.order_number)
    .slice(
      (currentPage - 1) * QUESTIONS_PER_PAGE,
      currentPage * QUESTIONS_PER_PAGE
    );

  if (loading || !testQuestions.length || !sessionId) {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <Spin tip={t("loading_test")} size="large" />
      </div>
    );
  }

  return (
    <div className="test-layout">
      {/* LEFT: Question Area */}
      <div className="question-area">
        <Title level={2}>{t("title", { title: testTitle })}</Title>

        <Progress
          percent={Math.round((answeredCount / totalQuestions) * 100)}
          status="active"
          style={{ marginBottom: 24 }}
        />

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {paginatedQuestions.map((testQuestion, index) => {
            const question = testQuestion.question;
            const selected = selectedAnswers[testQuestion.id];

            return (
              <Card
                key={testQuestion.id}
                title={t("question_number", {
                  index: (currentPage - 1) * QUESTIONS_PER_PAGE + index + 1,
                })}
                className="quiz-question-card"
                extra={
                  selected !== undefined && (
                    <Button
                      danger
                      size="small"
                      onClick={() => handleClearAnswer(testQuestion.id)}
                    >
                      {t("clear_answer")}
                    </Button>
                  )
                }
              >
                {question ? (
                  <>
                    <Paragraph className="question-text">
                      {question.question_text}
                    </Paragraph>

                    {question.question_type === "multiple_choice" ? (
                      <Radio.Group
                        onChange={(e) =>
                          handleChange(testQuestion.id, {
                            answerId: e.target.value,
                          })
                        }
                        value={selected?.answerId}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {testQuestion.answers_snapshot?.map((answer, i) => (
                          <Radio
                            key={answer.id}
                            value={answer.id}
                            className={
                              selected?.answerId === answer.id
                                ? "selected"
                                : ""
                            }
                          >
                            <b>{String.fromCharCode(65 + i)}.</b>{" "}
                            {answer.answer_text}
                          </Radio>
                        ))}
                      </Radio.Group>
                    ) : question.question_type === "essay" ? (
                      <Input.TextArea
                        rows={6}
                        value={selected?.answerText ?? ""}
                        onChange={(e) =>
                          handleChange(testQuestion.id, {
                            answerText: e.target.value,
                          })
                        }
                        placeholder={t("enter_answer")}
                      />
                    ) : (
                      <Paragraph type="secondary">
                        {t("unsupported_question_type")}
                      </Paragraph>
                    )}
                  </>
                ) : (
                  <Paragraph type="secondary">
                    {t("question_not_found")}
                  </Paragraph>
                )}
              </Card>
            );
          })}
        </Space>

        <Pagination
          current={currentPage}
          total={totalQuestions}
          pageSize={QUESTIONS_PER_PAGE}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          style={{ marginTop: 24, textAlign: "center" }}
        />
      </div>

      {/* RIGHT: Sidebar */}
      <div className="sidebar">
        <Card>
          <Title level={5}>{t("info")}</Title>
          <Paragraph>
            <Text strong>{t("name")}</Text> {testTitle}
          </Paragraph>
          <Paragraph>
            <Text strong>{t("duration")}</Text> {testDuration} {t("minutes")}
          </Paragraph>
          <Paragraph>
            <Text strong>{t("questions_count")}</Text> {totalQuestions}
          </Paragraph>
          <Paragraph>
            <Text strong>{t("total_score")}</Text> {totalPoints} {t("points")}
          </Paragraph>
          <Paragraph>
            <Text strong>{t("answered")}</Text> {answeredCount}
          </Paragraph>
          <Paragraph>
            <Text strong>{t("unanswered")}</Text> {unansweredCount}
          </Paragraph>

          <Statistic.Countdown
            title={t("countdown_title")}
            value={deadline}
            format="mm:ss"
            onFinish={handleFinish}
            style={{ marginBottom: 16 }}
          />

          <div className="question-numbers">
            <Row gutter={[8, 8]}>
              {testQuestions.map((q, index) => {
                const isAnswered = selectedAnswers[q.id];
                const page = Math.floor(index / QUESTIONS_PER_PAGE) + 1;

                return (
                  <Col key={q.id}>
                    <Button
                      shape="circle"
                      size="small"
                      type={isAnswered ? "primary" : "default"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {index + 1}
                    </Button>
                  </Col>
                );
              })}
            </Row>
          </div>

          <Button
            type="primary"
            block
            style={{ marginTop: 16 }}
            onClick={handleFinish}
            loading={isSubmitting}
          >
            {t("submit")}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default DoTest;
