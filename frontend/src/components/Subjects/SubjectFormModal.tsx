import React from "react";
import { Modal, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import type { FormInstance } from "antd/es/form";

interface Props {
  open: boolean;
  loading: boolean;
  isEditMode: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: () => void;
}

const SubjectFormModal: React.FC<Props> = ({
  open,
  loading,
  isEditMode,
  form,
  onCancel,
  onSubmit,
}) => {
  const { t } = useTranslation("subject");

  return (
    <Modal
      title={isEditMode ? t("edit_subject") : t("add_subject")}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={t("confirm")}
      cancelText={t("cancel")}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={t("name")}
          rules={[{ required: true, message: t("name_required") }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="code"
          label={t("code")}
          rules={[{ required: true, message: t("code_required") }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label={t("description")}
          rules={[{ required: true, message: t("description_required") }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubjectFormModal;
