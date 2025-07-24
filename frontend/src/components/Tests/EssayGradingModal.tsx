import {
  Modal,
  Typography,
  InputNumber,
  Switch,
  Form,
  Button,
  Row,
  Col,
  Card,
  message,
} from "antd";
import { useEffect } from "react";
import type { EssayQuestion } from "../../types/test_session.type";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { gradeEssayTestSession } from "../../services/test_sessionService";
import { useTranslation } from "react-i18next";

const { Title, Paragraph, Text } = Typography;

const EssayGradingModal = ({
  visible,
  onClose,
  essayQuestions,
  sessionId,
  onGradingSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  essayQuestions: EssayQuestion[];
  sessionId: number;
  onGradingSuccess: () => void;
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation("dotest");

  useEffect(() => {
    if (visible) {
      const initialValues = essayQuestions.map((q) => ({
        [`isCorrect_${q.question?.id}`]: q.user_answer?.is_correct ?? false,
      }));
      form.setFieldsValue(Object.assign({}, ...initialValues));
    }
  }, [visible, essayQuestions, form]);

  const onFinish = async (values: Record<string, number | boolean>) => {
    const updates = essayQuestions
      .filter((q) => q.question)
      .map((q) => {
        const id = q.question!.id;
        const rawPoint = values[`points_${id}`];
        const rawCorrect = values[`isCorrect_${id}`];

        return {
          questionId: id,
          points: typeof rawPoint === "number" ? rawPoint : 0,
          isCorrect: typeof rawCorrect === "boolean" ? rawCorrect : undefined,
        };
      });

    try {
      await gradeEssayTestSession(sessionId, { updates });
      message.success(t("grading_success"));
      onClose();
      onGradingSuccess();
    } catch (err) {
      message.error(t("grading_failed"));
      console.error(err);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      title={t("essay_modal_title")}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {essayQuestions.map((q, index) =>
          q.question ? (
            <Card
              key={q.question.id}
              style={{ marginBottom: 24, borderRadius: 8 }}
              bodyStyle={{ padding: 20 }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={5} style={{ marginBottom: 4 }}>
                    {t("question_number", { index: index + 1 })}:{" "}
                    {q.question.question_text}
                  </Title>
                </Col>
                <Col>
                  <Text strong style={{ color: "#fa8c16" }}>
                    {t("max_score")}: {q.question.points}
                  </Text>
                </Col>
              </Row>

              {q.answers_snapshot?.[0]?.answer_text && (
                <Paragraph style={{ background: "#f6ffed", padding: 10 }}>
                  <strong>{t("sample_answer")}:</strong>{" "}
                  {q.answers_snapshot[0].answer_text}
                </Paragraph>
              )}

              {q.answers_snapshot?.[0]?.explanation && (
                <Paragraph style={{ background: "#e6f7ff", padding: 10 }}>
                  <strong>{t("explanation")}:</strong>{" "}
                  {q.answers_snapshot[0].explanation}
                </Paragraph>
              )}

              <Paragraph style={{ background: "#fff1f0", padding: 10 }}>
                <strong>{t("student_answer")}:</strong>{" "}
                {q.user_answer?.answer_text || `(${t("no_answer_submitted")})`}
              </Paragraph>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t("grading_score_label")}
                    name={`points_${q.question?.id}`}
                    rules={[
                      { required: true, message: t("grading_score_required") },
                      {
                        validator: (_, value) => {
                          const maxPoint = q.question?.points;
                          if (maxPoint !== undefined && value > maxPoint) {
                            return Promise.reject(
                              new Error(
                                t("grading_score_max", { max: maxPoint })
                              )
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      step={0.25}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={t("correct_or_not")}
                    name={`isCorrect_${q.question.id}`}
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren={<CheckOutlined />}
                      unCheckedChildren={<CloseOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ) : null
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            icon={<CheckOutlined />}
            style={{ marginTop: 16 }}
          >
            {t("confirm_grading")}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EssayGradingModal;
