import React from "react";
import { Modal, Form, Input, InputNumber, Select, Spin, Switch } from "antd";
import type { FormInstance } from "antd/es/form";
import type { SubjectSerializer } from "../../types/subject.type";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  loading: boolean;
  isEditMode: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: () => void;
  subjects: SubjectSerializer[];
}

const TestFormModal: React.FC<Props> = ({
  open,
  loading,
  isEditMode,
  form,
  onCancel,
  onSubmit,
  subjects,
}) => {
  const { t } = useTranslation("test");

  return (
    <Modal
      title={isEditMode ? t("edit_test") : t("add_test")}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={t("confirm")}
      cancelText={t("cancel")}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
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
            name="title"
            label={t("title")}
            rules={[{ required: true, message: t("title_required") }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label={t("description")}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="time_limit"
            label={t("time_limit")}
            rules={[{ required: true, message: t("time_limit_required") }]}
          >
            <InputNumber min={1} max={300} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="passing_score"
            label={t("passing_score")}
            rules={[
              { required: true, message: t("passing_score_required") },
              {
                type: "number",
                min: 0,
                max: 100,
                message: t("passing_score_range"),
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} addonAfter="%" />
          </Form.Item>

          <Form.Item
            name="is_published"
            label={t("is_published")}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default TestFormModal;
