import React, { useEffect, useState } from "react";
import { Button, Card, Form, message, Spin, Select, Space } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { useTests } from "../../hooks/useTest";
import { useSubjects } from "../../hooks/useSubjects";
import TestFormModal from "../../components/Tests/TestFormModal";
import TestTable from "../../components/Tests/TestTable";
import type { TestFormValues } from "../../types/test.type";

const TestManagement: React.FC = () => {
  const { t } = useTranslation("test");
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<number | null>(null);

  const { subjects } = useSubjects();

  const [originalSubjectId, setOriginalSubjectId] = useState<number | null>(
    null
  );

  const {
    tests,
    selectedTest,
    fetchTestById,
    onCreate,
    onUpdate,
    onDelete,
    loadTests,
    loading,
    questionStats,
    fetchQuestionStats,
  } = useTests();

  // --- FILTER ---
  const handleFilter = async () => {
    const values = filterForm.getFieldsValue();
    await loadTests(values);
  };

  const resetFilter = async () => {
    filterForm.resetFields();
    await loadTests();
  };

  // --- CRUD ---
  const showModal = () => {
    setIsEditMode(false);
    setIsModalVisible(true);
    form.resetFields();

    const defaultSubjectId = subjects[0]?.id;
    if (defaultSubjectId) {
      fetchQuestionStats(defaultSubjectId); 
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEdit = async (id: number) => {
    setCurrentTestId(id);
    setIsEditMode(true);
    const test = await fetchTestById(id);
    if (test) {
      setOriginalSubjectId(test.subject_id);
    }
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await onDelete(id);
    message.success(t("delete_success"));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Kiểm tra nếu đang ở chế độ edit và môn học bị thay đổi
      const shouldClone =
        isEditMode &&
        currentTestId &&
        originalSubjectId !== null &&
        values.subject_id !== originalSubjectId;

      if (shouldClone) {
        const confirmed = window.confirm(t("confirm_clone_message"));
        if (!confirmed) return;
      }

      if (isEditMode && currentTestId) {
        await onUpdate(currentTestId, values as TestFormValues);
      } else {
        await onCreate(values as TestFormValues);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  useEffect(() => {
    if (isEditMode && selectedTest) {
      form.setFieldsValue({ ...selectedTest });
    }
  }, [isEditMode, selectedTest, form]);

  return (
    <Card
      title={t("test_management")}
      extra={
        <Button icon={<PlusOutlined />} onClick={showModal} type="primary">
          {t("add_test")}
        </Button>
      }
    >
      {/* FILTER */}
      <Form
        layout="inline"
        form={filterForm}
        onFinish={handleFilter}
        style={{ marginBottom: 20 }}
      >
        <Form.Item name="subject_id" label={t("subject")}>
          <Select
            allowClear
            placeholder={t("select_subject")}
            style={{ width: 200 }}
          >
            {subjects.map((s) => (
              <Select.Option key={s.id} value={s.id}>
                #{s.id} - {s.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="is_published" label={t("published")}>
          <Select allowClear style={{ width: 140 }}>
            <Select.Option value={true}>{t("published")}</Select.Option>
            <Select.Option value={false}>{t("draft")}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {t("filter")}
            </Button>
            <Button icon={<ReloadOutlined />} onClick={resetFilter}>
              {t("reset")}
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* TABLE + MODAL */}
      <Spin spinning={loading}>
        <TestTable
          data={tests}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </Spin>

      <TestFormModal
        open={isModalVisible}
        loading={loading}
        isEditMode={isEditMode}
        form={form}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        subjects={subjects}
        questionStats={questionStats ?? { easy: 0, medium: 0, hard: 0 }}
        onSubjectChange={(subjectId) => {
          fetchQuestionStats(subjectId);
        }}
        //  isLatest={isEditMode ? selectedTest?.is_latest ?? true : true}
      />
    </Card>
  );
};

export default TestManagement;
