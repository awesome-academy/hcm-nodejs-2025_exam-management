import React from "react";
import { Modal, Form, Select, InputNumber, Spin, Button, Space } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";
import type { QuestionSerializer } from "../../types/question.type";

interface Props {
  open: boolean;
  loading: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: () => void;
  questions: QuestionSerializer[];
  subjectId: number | null;
  isEditMode?: boolean;
  testQuestions: { question_id: number }[];
}

const TestQuestionFormModal: React.FC<Props> = ({
  open,
  loading,
  form,
  onCancel,
  onSubmit,
  questions,
  subjectId,
  testQuestions,
}) => {
  const { t } = useTranslation("test_question");

  const filteredQuestions = questions.filter((q) => q.subject_id === subjectId);

  return (
    <Modal
      title={t("add_test_question")}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={t("confirm")}
      cancelText={t("cancel")}
      width={800}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" name="test-question-form">
          <Form.List name="questions" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => {
                  const selectedIds =
                    (
                      form.getFieldValue("questions") as {
                        question_id?: number;
                      }[]
                    )?.map((x) => x?.question_id) || [];

                  const currentValue = form.getFieldValue([
                    "questions",
                    name,
                    "question_id",
                  ]);

                  return (
                    <div
                      key={key}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 16,
                        background: "#fdfdfd",
                      }}
                    >
                      <Space
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <h4>
                          {t("question")} #{index + 1}
                        </h4>
                        {fields.length > 1 && (
                          <Button
                            type="link"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                          >
                            {t("remove")}
                          </Button>
                        )}
                      </Space>

                      <Form.Item
                        {...restField}
                        name={[name, "question_id"]}
                        label={t("question")}
                        rules={[
                          {
                            required: true,
                            message: t("question_required"),
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          placeholder={t("select_question")}
                          optionFilterProp="label"
                          disabled={!subjectId}
                        >
                          {filteredQuestions.map((q) => {
                            const isSelected = selectedIds.includes(q.id);
                            const isCurrent = currentValue === q.id;
                            const isAlreadyInTest = testQuestions.some(
                              (tq) => tq.question_id === q.id
                            );

                            return (
                              <Select.Option
                                key={q.id}
                                value={q.id}
                                disabled={
                                  (isSelected || isAlreadyInTest) && !isCurrent
                                }
                              >
                                #{q.id} - {q.question_text.slice(0, 50)}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "order_number"]}
                        label={t("order_number")}
                        rules={[
                          {
                            required: true,
                            message: t("order_number_required"),
                          },
                        ]}
                      >
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                    </div>
                  );
                })}

                <Form.Item>
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                  >
                    {t("add_test_question")}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Spin>
    </Modal>
  );
};

export default TestQuestionFormModal;
