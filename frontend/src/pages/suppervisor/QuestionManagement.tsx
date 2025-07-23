import React, { useEffect, useState } from "react";
import { Button, Card, Form, message, Spin, Input, Select } from "antd";
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

type FilterValues = {
  subject_id?: number;
  question_type?: string;
  content?: string;
  creator_id?: number;
};

const QuestionManagement: React.FC = () => {
  const { t } = useTranslation("question");
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
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
    loadQuestions,
  } = useQuestions();

  const questionTypes = Array.from(
    new Set(questions.map((q) => q.question_type).filter(Boolean))
  );

  const creators = Array.from(
    new Map(
      questions.filter((q) => q.creator).map((q) => [q.creator.id, q.creator])
    ).values()
  );

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
        answers: selectedQuestion.answers?.map((a) => ({
          id: a.id,
          answer_text: a.answer_text,
          is_correct: a.is_correct,
          explanation: a.explanation,
          is_active: a.is_active,
        })),
      });
    }
  }, [isEditMode, selectedQuestion, form]);

  const handleShowAnswer = (id: number) => {
    setCurrentQuestionId(id);
    setShowAnswerSection(true);
  };

  const handleSearch = async (values: FilterValues) => {
    setShowAnswerSection(false);
    await loadQuestions(values);
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
        <Form
          layout="inline"
          form={filterForm}
          onFinish={handleSearch}
          style={{
            marginBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Form.Item name="subject_id" label={t("subject")}>
            <Select
              allowClear
              placeholder={t("select_subject")}
              style={{ width: 160 }}
            >
              {subjects.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="question_type" label={t("type")}>
            <Select
              allowClear
              placeholder={t("select_type")}
              style={{ width: 160 }}
            >
              {questionTypes.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="question_text" label={t("content")}>
            <Input allowClear placeholder={t("search_by_content")} />
          </Form.Item>

          <Form.Item name="creator_id" label={t("creator")}>
            <Select
              allowClear
              placeholder={t("select_creator")}
              style={{ width: 160 }}
              optionFilterProp="children"
              showSearch
            >
              {creators.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.full_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", gap: 8 }}>
              <Button htmlType="submit" type="primary">
                {t("search")}
              </Button>
              <Button
                htmlType="button"
                onClick={() => {
                  filterForm.resetFields();
                  handleSearch(filterForm.getFieldsValue());
                }}
              >
                {t("reset")}
              </Button>
            </div>
          </Form.Item>
        </Form>

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
