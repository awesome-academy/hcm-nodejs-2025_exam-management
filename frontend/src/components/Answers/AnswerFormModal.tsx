import React, { useEffect } from "react";
import { Modal, Form, Input, Spin, Switch } from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";

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

  useEffect(() => {
    if (!isEditMode && open) {
      form.setFieldsValue({
        is_correct: false,
        is_active: false,
        explanation: undefined,
        answer_text: "",
      });
    }
  }, [open, isEditMode, form]);
  return (
    <Modal
      title={isEditMode ? t("edit_answer") : t("add_answer")}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={t("confirm")}
      cancelText={t("cancel")}
      width={600}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" name="answer-form-modal">
          <Form.Item
            name="answer_text"
            label={t("answer_text")}
            rules={[{ required: true, message: t("answer_text_required") }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="is_correct"
            label={t("is_correct")}
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="is_active"
            label={t("active")}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* Hiện explanation nếu is_correct = true */}
          <Form.Item shouldUpdate noStyle>
            {() => {
              const isCorrect = form.getFieldValue("is_correct");
              return isCorrect ? (
                <Form.Item
                  name="explanation"
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
        </Form>
      </Spin>
    </Modal>
  );
};

export default AnswerFormModal;
