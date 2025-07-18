import React, { useState, useEffect } from "react";
import { Button, Card, Form, message, Spin } from "antd";
import AnswerTable from "./AnswerTable";
import AnswerFormModal from "./AnswerFormModal";
import { useAnswers } from "../../hooks/useAnswer";
import { useTranslation } from "react-i18next";

interface Props {
  questionId: number;
  onClose: () => void;
}

const AnswerSection: React.FC<Props> = ({ questionId, onClose }) => {
  const { t } = useTranslation("question");
  const [form] = Form.useForm();
  const [answerModalOpen, setAnswerModalOpen] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);

  const { answers, loading, loadAnswers, onUpdate, onDelete, onCreate } =
    useAnswers(questionId);

  useEffect(() => {
    loadAnswers();
  }, [loadAnswers]);

  const handleEditAnswer = (id: number) => {
    const answer = answers.find((a) => a.id === id);
    if (answer) {
      const { answer_text, is_correct, explanation, is_active } = answer;
      form.setFieldsValue({
        answer_text,
        is_correct,
        explanation,
        is_active,
      });

      setEditingAnswerId(id);
      setAnswerModalOpen(true);
    }
  };

  const handleDeleteAnswer = async (id: number) => {
    await onDelete(id);
    message.success(t("delete_success"));
    loadAnswers();
  };

  const handleAnswerSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingAnswerId) {
        await onUpdate(editingAnswerId, values);
      } else {
        await onCreate(values);
      }

      await loadAnswers();
      setAnswerModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <Card
      title={`${t("answers_for_question")} #${questionId}`}
      style={{ marginTop: 20 }}
      extra={
        <>
          <Button
            type="primary"
            onClick={() => {
              setEditingAnswerId(null);
              form.resetFields();
              setAnswerModalOpen(true);
            }}
            style={{ marginRight: 8 }}
          >
            {t("add_answer")}
          </Button>
          <Button danger onClick={onClose}>
            {t("close_answer_section")}
          </Button>
        </>
      }
    >
      <Spin spinning={loading}>
        <AnswerTable
          data={answers}
          loading={loading}
          onEdit={handleEditAnswer}
          onDelete={handleDeleteAnswer}
        />
      </Spin>

      <AnswerFormModal
        open={answerModalOpen}
        loading={loading}
        form={form}
        onCancel={() => setAnswerModalOpen(false)}
        onSubmit={handleAnswerSubmit}
        isEditMode={!!editingAnswerId}
      />
    </Card>
  );
};

export default AnswerSection;
