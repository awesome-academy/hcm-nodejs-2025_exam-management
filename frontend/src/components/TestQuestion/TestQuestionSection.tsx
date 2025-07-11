import React, { useEffect, useState } from "react";
import { Button, Card, Form, message, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { PlusOutlined } from "@ant-design/icons";

import { useQuestions } from "../../hooks/useQuestion";
import { useTestQuestions } from "../../hooks/useTestQuestion";
import TestQuestionFormModal from "./TestQuestionFormModal";
import TestQuestionTable from "./TestQuestionTable";

interface Props {
  testId: number;
  onClose: () => void;
  subjectId: number | null;
}

const TestQuestionSection: React.FC<Props> = ({
  testId,
  onClose,
  subjectId,
}) => {
  const { t } = useTranslation("test_question");
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { questions } = useQuestions();

  const {
    testQuestions,
    loading,
    loadTestQuestions,
    onCreateBulk,
    onDeleteOne,
  } = useTestQuestions(testId);

  const handleAdd = () => {
    setEditingId(null);
    setModalOpen(true);
    form.resetFields();
  };

  const handleEdit = (questionId: number) => {
    const item = testQuestions.find((q) => q.question_id === questionId);
    if (item) {
      form.setFieldsValue({
        question_id: item.question_id,
        order_number: item.order_number,
      });
      setEditingId(questionId);
      setModalOpen(true);
    }
  };

  const handleDelete = async (questionId: number) => {
    await onDeleteOne(questionId);
    message.success(t("delete_success"));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!values.questions || values.questions.length === 0) {
        return message.warning(t("question_required"));
      }

      await onCreateBulk({ questions: values.questions });
      message.success(t("create_success"));
      setModalOpen(false);
      loadTestQuestions();
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  useEffect(() => {
    loadTestQuestions();
  }, [loadTestQuestions]);

  return (
    <Card
      title={t("test_questions_for_test", { id: testId })}
      extra={
        <>
          <Button
            icon={<PlusOutlined />}
            onClick={handleAdd}
            type="primary"
            style={{ marginRight: 8 }}
          >
            {t("add_test_question")}
          </Button>
          <Button danger onClick={onClose}>
            {t("close")}
          </Button>
        </>
      }
      style={{ marginTop: 20 }}
    >
      <Spin spinning={loading}>
        <TestQuestionTable
          data={testQuestions}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <TestQuestionFormModal
          open={modalOpen}
          loading={loading}
          form={form}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          isEditMode={!!editingId}
          questions={questions}
          subjectId={subjectId}
          testQuestions={testQuestions}
        />
      </Spin>
    </Card>
  );
};

export default TestQuestionSection;
