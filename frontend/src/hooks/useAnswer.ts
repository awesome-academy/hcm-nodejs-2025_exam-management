import { useState, useEffect, useCallback } from "react";
import {
  getAnswersByQuestion,
  updateAnswer,
  deleteAnswer,
  createAnswer,
} from "../services/answerService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import type { AnswerSerializer, AnswerFormValues } from "../types/answer.type";
import { useAuth } from "./useAuth";

export const useAnswers = (questionId: number | null) => {
  const [answers, setAnswers] = useState<AnswerSerializer[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("answer");
  const { token } = useAuth();

  const loadAnswers = useCallback(async () => {
    if (!questionId) {
      setAnswers([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getAnswersByQuestion(questionId);
      setAnswers(data.data || []);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  const onUpdate = async (id: number, values: AnswerFormValues) => {
    try {
      await updateAnswer(id, values);
      toast.success(t("update_success"));
      await loadAnswers();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deleteAnswer(id);
      toast.success(t("delete_success"));
      await loadAnswers();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  const onCreate = async (values: AnswerFormValues) => {
    if (!questionId) return false;
    try {
      await createAnswer(questionId, values);
      toast.success(t("create_bulk_success"));
      await loadAnswers();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  useEffect(() => {
    if (token && questionId) {
      loadAnswers();
    } else {
      setAnswers([]);
    }
  }, [token, questionId, loadAnswers]);

  return {
    answers,
    loading,
    loadAnswers,
    onUpdate,
    onDelete,
    onCreate,
  };
};
