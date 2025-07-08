import React, { useState, useEffect } from "react";
import { Button, Card, Spin, Form, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useSubjects } from "../../hooks/useSubjects";

import SubjectTable from "../../components/Subjects/SubjectTable";
import SubjectFormModal from "../../components/Subjects/SubjectFormModal";
import type { SubjectFormValues } from "../../types/subject.type";

const SubjectManagement: React.FC = () => {
  const { t } = useTranslation("subject");
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSubjectId, setCurrentSubjectId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    subjects,
    loading,
    selectedSubject,
    fetchSubjectById,
    onCreate,
    onUpdate,
    onDelete,
  } = useSubjects();

  const showModal = () => {
    setIsModalVisible(true);
    setIsEditMode(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEdit = async (id: number) => {
    setCurrentSubjectId(id);
    setIsEditMode(true);
    await fetchSubjectById(id);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await onDelete(id);
    message.success(t("delete_success"));
  };

  const handleSubmit = async () => {
    try {
      const values = (await form.validateFields()) as SubjectFormValues;
      setUploading(true);

      if (isEditMode && currentSubjectId) {
        await onUpdate(currentSubjectId, values);
      } else {
        await onCreate(values);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : t("common.unknown_error")
      );
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (isEditMode && selectedSubject) {
      form.setFieldsValue({
        name: selectedSubject.name,
        code: selectedSubject.code,
        description: selectedSubject.description,
      });
    }
  }, [selectedSubject, isEditMode, form]);

  return (
    <Card
      title={t("subject_management")}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          {t("add_subject")}
        </Button>
      }
    >
      <Spin spinning={loading}>
        <SubjectTable
          data={subjects}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </Spin>

      <SubjectFormModal
        open={isModalVisible}
        loading={loading}
        uploading={uploading}
        isEditMode={isEditMode}
        form={form}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </Card>
  );
};

export default SubjectManagement;
