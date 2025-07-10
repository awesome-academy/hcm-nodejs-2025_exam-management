import React, { useState, useEffect } from "react";
import { Button, Card, Spin, Form, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { useQuestions } from "../../hooks/useQuestion";
import QuestionTable from "../../components/Questions/QuestionTable";
import QuestionFormModal from "../../components/Questions/QuestionFormModal";
import type {
  CreateQuestionFormValues,
  UpdateQuestionFormValues,
} from "../../types/question.type";
import { useSubjects } from "../../hooks/useSubjects";
import { useAnswers } from "../../hooks/useAnswer";
import AnswerTable from "../../components/Answers/AnswerTable";
import AnswerFormModal from "../../components/Answers/AnswerFormModal";

const QuestionManagement: React.FC = () => {
  //question
  const { t } = useTranslation("question");
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(
    null
  );
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

  //answer
  const [answerForm] = Form.useForm();
  const [showAnswerSection, setShowAnswerSection] = useState(false);
  const [answerModalOpen, setAnswerModalOpen] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);

  const {
    answers,
    loading: answersLoading,
    loadAnswers,
    onUpdate: onUpdateAnswer,
    onDelete: onDeleteAnswer,
    onCreateBulk,
  } = useAnswers(currentQuestionId);

  //Question handlers
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
        parent_question_id: selectedQuestion.parent_question_id,
        points: selectedQuestion.points,
        difficulty_level: selectedQuestion.difficulty_level,
      });
    }
  }, [isEditMode, selectedQuestion, form]);

  //Answer handlers
  const handleAddAnswer = (questionId: number) => {
    setCurrentQuestionId(questionId);
    setShowAnswerSection(true);
    loadAnswers();
  };

  const handleEditAnswer = (id: number) => {
    const answer = answers.find((a) => a.id === id);
    if (answer) {
      const { answer_text, is_correct, explanation } = answer;
      answerForm.setFieldsValue({
        answers: [
          {
            answer_text,
            is_correct,
            explanation,
          },
        ],
      });
      setEditingAnswerId(id);
      setAnswerModalOpen(true);
    }
  };

  const handleDeleteAnswer = async (id: number) => {
    await onDeleteAnswer(id);
    message.success(t("delete_success"));
    loadAnswers();
  };

  const handleAnswerSubmit = async () => {
    try {
      const values = await answerForm.validateFields();
      if (!currentQuestionId) {
        return message.error(t("select_question_first"));
      }

      if (editingAnswerId) {
        const { answers } = values;
        await onUpdateAnswer(editingAnswerId, answers[0]);
      } else {
        const { answers } = values;
        if (!answers || !Array.isArray(answers)) {
          return message.error(t("invalid_answer_list"));
        }
        await onCreateBulk({ answers });
      }

      await loadAnswers();
      setAnswerModalOpen(false);
      answerForm.resetFields();
    } catch (error) {
      message.error((error as Error).message);
    }
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
            onAddAnswer={handleAddAnswer}
            loading={loading}
            onTableChange={() => {
              setShowAnswerSection(false);
            }}
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
        <Card
          title={`${t("answers_for_question")} #${currentQuestionId}`}
          style={{ marginTop: 20 }}
          extra={
            <>
              <Button
                type="primary"
                onClick={() => {
                  setAnswerModalOpen(true);
                  setEditingAnswerId(null);
                  answerForm.resetFields();
                }}
                style={{ marginRight: 8 }}
              >
                {t("add_answer")}
              </Button>
              <Button danger onClick={() => setShowAnswerSection(false)}>
                {t("close_answer_section")}
              </Button>
            </>
          }
        >
          <AnswerTable
            data={answers}
            loading={answersLoading}
            onEdit={handleEditAnswer}
            onDelete={handleDeleteAnswer}
          />

          <AnswerFormModal
            open={answerModalOpen}
            loading={answersLoading}
            form={answerForm}
            onCancel={() => setAnswerModalOpen(false)}
            onSubmit={handleAnswerSubmit}
            isEditMode={!!editingAnswerId}
          />
        </Card>
      )}
    </>
  );
};

export default QuestionManagement;
