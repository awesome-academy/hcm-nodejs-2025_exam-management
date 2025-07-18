import { useState, useEffect } from "react";
import {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
} from "../services/testService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import type { TestSerializer, TestFormValues } from "../types/test.type";
import { useAuth } from "./useAuth";
import { getQuestionStats } from "../services/questionService";
import type { QuestionStatsResponse } from "../types/question.type";

export const useTests = () => {
  const [tests, setTests] = useState<TestSerializer[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestSerializer | null>(null);
  const [questionStats, setQuestionStats] = useState<
    QuestionStatsResponse["data"]
  >({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("test");
  const { token } = useAuth();

  const loadTests = async (filters?: {
    subject_id?: number;
    is_published?: boolean;
  }) => {
    setLoading(true);
    try {
      const data = await getAllTests(filters);
      setTests(data.data || []);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionStats = async (subjectId: number) => {
    try {
      const res = await getQuestionStats(subjectId);
      setQuestionStats(res.data);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const fetchTestById = async (id: number): Promise<TestSerializer | null> => {
    try {
      const data = await getTestById(id);
      const test = data.data ?? null;
      setSelectedTest(test);

      if (test?.subject_id) {
        await fetchQuestionStats(test.subject_id);
      }

      return test;
    } catch (err) {
      toast.error((err as Error).message);
      return null;
    }
  };

  const onCreate = async (values: TestFormValues) => {
    try {
      await createTest(values);
      toast.success(t("create_success"));
      await loadTests();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  const onUpdate = async (id: number, values: TestFormValues) => {
    try {
      await updateTest(id, values);
      toast.success(t("update_success"));
      await loadTests();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deleteTest(id);
      toast.success(t("delete_success"));
      await loadTests();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  useEffect(() => {
    if (token) {
      loadTests();
    }
  }, [token]);

  return {
    tests,
    loading,
    selectedTest,
    fetchTestById,
    onCreate,
    onUpdate,
    onDelete,
    loadTests,
    questionStats,
    fetchQuestionStats,
  };
};
