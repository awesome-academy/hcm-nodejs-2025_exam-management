import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Spin,
  InputNumber,
  Space,
  Button,
} from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type { QuestionSerializer } from "../../types/question.type";
import type { SubjectSerializer } from "../../types/subject.type";
import { Switch } from "antd";
import { useWatch } from "antd/es/form/Form";

interface Props {
  open: boolean;
  loading: boolean;
  isEditMode: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: () => void;
  parentQuestions: QuestionSerializer[];
  subjects: SubjectSerializer[];
}

const QuestionFormModal: React.FC<Props> = ({
  open,
  loading,
  isEditMode,
  form,
  onCancel,
  onSubmit,
  subjects,
}) => {
  const { t } = useTranslation("question");
  const questionType = useWatch("question_type", form);

  return (
    <Modal
      title={isEditMode ? t("edit_question") : t("add_question")}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={t("confirm")}
      cancelText={t("cancel")}
      width={900}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            is_active: true,
            answers: [
              {
                is_active: true,
                is_correct: false,
              },
            ],
          }}
        >
          <Form.Item
            name="subject_id"
            label={t("subject_id")}
            rules={[{ required: true, message: t("subject_required") }]}
          >
            <Select placeholder={t("select_subject")}>
              {subjects.map((subject) => (
                <Select.Option key={subject.id} value={subject.id}>
                  #{subject.id} - {subject.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="question_text"
            label={t("question_text")}
            rules={[{ required: true, message: t("text_required") }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="question_type"
            label={t("question_type")}
            rules={[{ required: true, message: t("type_required") }]}
          >
            <Select>
              <Select.Option value="multiple_choice">
                {t("multiple_choice")}
              </Select.Option>
              <Select.Option value="essay">{t("essay")}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="points"
            label={t("points")}
            rules={[{ required: true, message: t("points_required") }]}
          >
            <InputNumber min={1} max={100} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="difficulty_level"
            label={t("difficulty_level")}
            rules={[{ required: true, message: t("difficulty_required") }]}
          >
            <Select>
              <Select.Option value="easy">{t("easy")}</Select.Option>
              <Select.Option value="medium">{t("medium")}</Select.Option>
              <Select.Option value="hard">{t("hard")}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="is_active"
            valuePropName="checked"
            label={t("status")}
          >
            <Switch />
          </Form.Item>

          {/* ANSWERS */}
          {questionType === "multiple_choice" && (
            <Form.List name="answers">
              {(fields, { add, remove }) => (
                <>
                  <h4>{t("answers")}</h4>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div
                      key={key}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 16,
                        background: "#fafafa",
                      }}
                    >
                      <Space
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <h5>
                          {t("answer")} #{index + 1}
                        </h5>
                        {!isEditMode && fields.length > 1 && (
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
                        name={[name, "answer_text"]}
                        label={t("answer_text")}
                        rules={[
                          {
                            required: true,
                            message: t("answer_text_required"),
                          },
                        ]}
                      >
                        <Input.TextArea rows={3} disabled={isEditMode} />
                      </Form.Item>

                      <Space direction="horizontal" size="large">
                        <Form.Item
                          name={[name, "is_correct"]}
                          valuePropName="checked"
                          label={t("is_correct")}
                        >
                          <Switch disabled={isEditMode} />
                        </Form.Item>

                        <Form.Item
                          name={[name, "is_active"]}
                          valuePropName="checked"
                          label={t("active")}
                        >
                          <Switch disabled={isEditMode} />
                        </Form.Item>
                      </Space>

                      <Form.Item shouldUpdate noStyle>
                        {() => {
                          const isCorrect = form.getFieldValue([
                            "answers",
                            name,
                            "is_correct",
                          ]);
                          return isCorrect ? (
                            <Form.Item
                              {...restField}
                              name={[name, "explanation"]}
                              label={t("explanation")}
                              rules={[
                                {
                                  required: true,
                                  message: t("explanation_required"),
                                },
                              ]}
                            >
                              <Input.TextArea rows={2} disabled={isEditMode} />
                            </Form.Item>
                          ) : null;
                        }}
                      </Form.Item>
                    </div>
                  ))}

                  {!isEditMode && (
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() =>
                          add({ is_active: true, is_correct: false })
                        }
                        block
                        icon={<PlusOutlined />}
                      >
                        {t("add_answer")}
                      </Button>
                    </Form.Item>
                  )}
                </>
              )}
            </Form.List>
          )}

          {questionType === "essay" && (
            <>
              <h4>{t("essay_answer")}</h4>
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 16,
                  background: "#fafafa",
                }}
              >
                <Form.Item
                  name={["answers", 0, "answer_text"]}
                  label={t("answer_text")}
                  rules={[
                    {
                      required: true,
                      message: t("answer_text_required"),
                    },
                  ]}
                >
                  <Input.TextArea rows={10} disabled={isEditMode} />
                </Form.Item>

                <Space direction="horizontal" size="large">
                  <Form.Item
                    name={["answers", 0, "is_correct"]}
                    valuePropName="checked"
                    label={t("is_correct")}
                  >
                    <Switch disabled={isEditMode} />
                  </Form.Item>

                  <Form.Item
                    name={["answers", 0, "is_active"]}
                    valuePropName="checked"
                    label={t("active")}
                  >
                    <Switch disabled={isEditMode} />
                  </Form.Item>
                </Space>

                <Form.Item shouldUpdate noStyle>
                  {() => {
                    const isCorrect = form.getFieldValue([
                      "answers",
                      0,
                      "is_correct",
                    ]);
                    return isCorrect ? (
                      <Form.Item
                        name={["answers", 0, "explanation"]}
                        label={t("explanation")}
                        rules={[
                          {
                            required: true,
                            message: t("explanation_required"),
                          },
                        ]}
                      >
                        <Input.TextArea rows={7} disabled={isEditMode} />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>
              </div>
            </>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};

export default QuestionFormModal;
