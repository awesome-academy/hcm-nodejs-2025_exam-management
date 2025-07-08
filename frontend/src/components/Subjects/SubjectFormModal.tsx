import React from "react";
import { Modal, Form, Input, Upload, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { FormInstance } from "antd/es/form";

interface Props {
  open: boolean;
  loading: boolean;
  uploading: boolean;
  isEditMode: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: () => void;
}

const SubjectFormModal: React.FC<Props> = ({
  open,
  loading,
  uploading,
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
      <Spin spinning={uploading}>
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

          <Form.Item
            name="image"
            label={t("image")}
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload
              name="file"
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
            >
              <button className="ant-btn">
                <UploadOutlined /> {t("upload_image")}
              </button>
            </Upload>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default SubjectFormModal;
