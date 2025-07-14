import React, { useEffect, useState } from "react";
import { Button, Card, Form, message, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { useQuestions } from "../../hooks/useQuestion";
import { useSubjects } from "../../hooks/useSubjects";
import QuestionTable from "../../components/Questions/QuestionTable";
import QuestionFormModal from "../../components/Questions/QuestionFormModal";
import AnswerSection from "../../components/Answers/AnswerSection";

import type {
  CreateQuestionFormValues,
  UpdateQuestionFormValues,
} from "../../types/question.type";

const QuestionManagement: React.FC = () => {
  const { t } = useTranslation("question");
  const [form] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(
    null
  );
  const [showAnswerSection, setShowAnswerSection] = useState(false);

  const { subjects } = useSubjects();

  const {
    questions,
    selectedQuestion,
    fetchQuestionById,
    onCreate,
    onUpdate,
    onDelete,
    loading,
  } = useQuestions();

  // CRUD - Question
  const showModal = () => {
    setIsEditMode(false);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEdit = async (id: number) => {
    setCurrentQuestionId(id);
    setIsEditMode(true);
    await fetchQuestionById(id);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await onDelete(id);
    message.success(t("delete_success"));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEditMode && currentQuestionId) {
        await onUpdate(currentQuestionId, values as UpdateQuestionFormValues);
      } else {
        await onCreate(values as CreateQuestionFormValues);
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  useEffect(() => {
    if (isEditMode && selectedQuestion) {
      form.setFieldsValue({
        subject_id: selectedQuestion.subject_id,
        question_text: selectedQuestion.question_text,
        question_type: selectedQuestion.question_type,
        points: selectedQuestion.points,
        difficulty_level: selectedQuestion.difficulty_level,
        is_active: selectedQuestion.is_active,
      });
    }
  }, [isEditMode, selectedQuestion, form]);

  const handleShowAnswer = (id: number) => {
    setCurrentQuestionId(id);
    setShowAnswerSection(true);
  };

  return (
    <>
      <Card
        title={t("question_management")}
        extra={
          <Button icon={<PlusOutlined />} onClick={showModal} type="primary">
            {t("add_question")}
          </Button>
        }
      >
        <Spin spinning={loading}>
          <QuestionTable
            data={questions}
            onEdit={(id) => {
              setShowAnswerSection(false);
              handleEdit(id);
            }}
            onDelete={async (id) => {
              setShowAnswerSection(false);
              await handleDelete(id);
            }}
            onAddAnswer={handleShowAnswer}
            loading={loading}
            onTableChange={() => setShowAnswerSection(false)}
          />
        </Spin>

        <QuestionFormModal
          open={isModalVisible}
          loading={loading}
          isEditMode={isEditMode}
          form={form}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          parentQuestions={questions}
          subjects={subjects}
        />
      </Card>

      {showAnswerSection && currentQuestionId && (
        <AnswerSection
          questionId={currentQuestionId}
          onClose={() => setShowAnswerSection(false)}
        />
      )}
    </>
  );
};

export default QuestionManagement;
