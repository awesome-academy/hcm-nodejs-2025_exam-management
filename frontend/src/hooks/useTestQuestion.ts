import { useState, useEffect, useCallback } from "react";
import {
  getTestQuestionsByTestId,
  createBulkTestQuestions,
  deleteTestQuestion,
} from "../services/test_questionService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import type {
  TestQuestionSerializer,
  CreateBulkTestQuestionFormValues,
} from "../types/test_question.type";
import { useAuth } from "./useAuth";

export const useTestQuestions = (testId: number | null) => {
  const [testQuestions, setTestQuestions] = useState<TestQuestionSerializer[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("test_question");
  const { token } = useAuth();

  const loadTestQuestions = useCallback(async () => {
    if (!testId) {
      setTestQuestions([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getTestQuestionsByTestId(testId);
      setTestQuestions(data.data || []);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  const onCreateBulk = async (values: CreateBulkTestQuestionFormValues) => {
    if (!testId) return false;
    try {
      await createBulkTestQuestions(testId, values);
      toast.success(t("create_bulk_success"));
      await loadTestQuestions();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  const onDeleteOne = async (questionId: number) => {
    if (!testId) return false;
    try {
      await deleteTestQuestion(testId, questionId);
      toast.success(t("delete_success"));
      await loadTestQuestions();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  useEffect(() => {
    if (token && testId) {
      loadTestQuestions();
    } else {
      setTestQuestions([]);
    }
  }, [token, testId, loadTestQuestions]);

  return {
    testQuestions,
    loading,
    loadTestQuestions,
    onCreateBulk,
    onDeleteOne,
  };
};
