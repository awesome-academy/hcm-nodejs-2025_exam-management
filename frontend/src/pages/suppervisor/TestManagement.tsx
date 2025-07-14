import React, { useEffect, useState } from "react";
import { Button, Card, Form, message, Spin, Select, Space } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { useTests } from "../../hooks/useTest";
import { useSubjects } from "../../hooks/useSubjects";
import TestFormModal from "../../components/Tests/TestFormModal";
import TestTable from "../../components/Tests/TestTable";
import type { TestFormValues } from "../../types/test.type";

import TestQuestionSection from "../../components/TestQuestion/TestQuestionSection";

const TestManagement: React.FC = () => {
  const { t } = useTranslation("test");
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTestId, setCurrentTestId] = useState<number | null>(null);

  const { subjects } = useSubjects();

  const [openTestQuestionTestId, setOpenTestQuestionTestId] = useState<
    number | null
  >(null);

  const handleViewQuestions = (testId: number) => {
    setOpenTestQuestionTestId(testId);
  };

  const {
    tests,
    selectedTest,
    fetchTestById,
    onCreate,
    onUpdate,
    onDelete,
    loadTests,
    loading,
  } = useTests();

  // --- FILTER ---
  const handleFilter = async () => {
    setOpenTestQuestionTestId(null);
    const values = filterForm.getFieldsValue();
    await loadTests(values);
  };

  const resetFilter = async () => {
    setOpenTestQuestionTestId(null);
    filterForm.resetFields();
    await loadTests();
  };

  // --- CRUD ---
  const showModal = () => {
    setOpenTestQuestionTestId(null);
    setIsEditMode(false);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEdit = async (id: number) => {
    setOpenTestQuestionTestId(null);
    setCurrentTestId(id);
    setIsEditMode(true);
    await fetchTestById(id);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    setOpenTestQuestionTestId(null);
    await onDelete(id);
    message.success(t("delete_success"));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
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
          onViewQuestions={handleViewQuestions}
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
      />
      {openTestQuestionTestId !== null && (
        <TestQuestionSection
          testId={openTestQuestionTestId}
          subjectId={
            tests.find((t) => t.id === openTestQuestionTestId)?.subject_id ??
            null
          }
          onClose={() => setOpenTestQuestionTestId(null)}
        />
      )}
    </Card>
  );
};

export default TestManagement;
