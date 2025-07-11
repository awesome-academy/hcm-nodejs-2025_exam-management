import React from "react";
import { Modal, Form, Input, Checkbox, Spin, Button, Space } from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

interface Props {
  open: boolean;
  loading: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: () => void;
  isEditMode?: boolean;
}

const AnswerFormModal: React.FC<Props> = ({
  open,
  loading,
  form,
  onCancel,
  onSubmit,
  isEditMode,
}) => {
  const { t } = useTranslation("answer");

  return (
    <Modal
      title={isEditMode ? t("edit_answer") : t("add_answer")}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={t("confirm")}
      cancelText={t("cancel")}
      width={700}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" name="answer-form-modal">
          <Form.List name="answers" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
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
                      <h4>
                        {t("answer")} #{index + 1}
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
                      name={[name, "answer_text"]}
                      label={t("answer_text")}
                      rules={[
                        { required: true, message: t("answer_text_required") },
                      ]}
                    >
                      <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "is_correct"]}
                      valuePropName="checked"
                    >
                      <Checkbox>{t("is_correct")}</Checkbox>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "is_active"]}
                      valuePropName="checked"
                    >
                      <Checkbox>{t("active")}</Checkbox>
                    </Form.Item>

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
                            <Input.TextArea rows={2} />
                          </Form.Item>
                        ) : null;
                      }}
                    </Form.Item>
                  </div>
                ))}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    {t("add_answer")}
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

export default AnswerFormModal;
