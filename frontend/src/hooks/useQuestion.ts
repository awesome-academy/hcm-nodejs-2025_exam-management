import { useState, useEffect } from "react";
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../services/questionService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import type {
  QuestionSerializer,
  CreateQuestionFormValues,
  UpdateQuestionFormValues,
} from "../types/question.type";
import { useAuth } from "./useAuth";

export const useQuestions = () => {
  const [questions, setQuestions] = useState<QuestionSerializer[]>([]);
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionSerializer | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("question");
  const { token } = useAuth();

  const loadQuestions = async (filters?: {
    subject_id?: number;
    question_type?: string;
    question_text?: string;
    creator_id?: number;
  }) => {
    setLoading(true);
    try {
      const data = await getAllQuestions(filters);
      setQuestions(data.data || []);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionById = async (
    id: number
  ): Promise<QuestionSerializer | null> => {
    try {
      const data = await getQuestionById(id);
      const question = data.data ?? null;
      setSelectedQuestion(question);
      return question;
    } catch (err) {
      toast.error((err as Error).message);
      return null;
    }
  };

  const onCreate = async (values: CreateQuestionFormValues) => {
    try {
      await createQuestion(values);
      toast.success(t("create_success"));
      await loadQuestions();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  const onUpdate = async (id: number, values: UpdateQuestionFormValues) => {
    try {
      await updateQuestion(id, values);
      toast.success(t("update_success"));
      await loadQuestions();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deleteQuestion(id);
      toast.success(t("delete_success"));
      await loadQuestions();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  useEffect(() => {
    if (token) {
      loadQuestions();
    }
  }, [token]);

  return {
    questions,
    loading,
    selectedQuestion,
    fetchQuestionById,
    onCreate,
    onUpdate,
    onDelete,
    loadQuestions,
  };
};
