import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import {
  createTestSession,
  submitTestSession,
} from "../services/test_sessionService";
import { getDoingTestQuestions } from "../services/test_questionService";
import { useNavigate } from "react-router-dom";
import type { TFunction } from "i18next";
import type { TestQuestionSerializer } from "../types/test_question.type";

export function useTestSession(testId: number, t: TFunction) {
  const navigate = useNavigate();
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasCreatedSession = useRef(false);

  const LOCAL_KEY = useMemo(() => `session_${testId}_data`, [testId]);

  const [testQuestions, setTestQuestions] = useState<TestQuestionSerializer[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // ✅ Khôi phục localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.selectedAnswers) setSelectedAnswers(parsed.selectedAnswers);
      if (parsed.sessionId) setSessionId(parsed.sessionId);
      if (parsed.startedAt) setStartedAt(parsed.startedAt);
      hasCreatedSession.current = true;
    }
  }, [LOCAL_KEY]);

  // ✅ Lưu lại localStorage khi thay đổi
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify({ selectedAnswers, sessionId, startedAt })
      );
    }
  }, [selectedAnswers, sessionId, startedAt, LOCAL_KEY]);

  // ✅ Submit bài làm
  const handleFinish = useCallback(async () => {
    if (!sessionId || isSubmitting) return;
    setIsSubmitting(true);

    const answers = Object.entries(selectedAnswers).map(
      ([questionId, answerId]) => ({
        questionId: Number(questionId),
        answerId,
      })
    );

    try {
      const res = await submitTestSession(sessionId, { answers });
      const score = res?.data?.score ?? 0;
      toast.success(`${t("submit_success")} (${score} điểm)`);
      localStorage.removeItem(LOCAL_KEY);
      navigate(`/results/${sessionId}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, isSubmitting, selectedAnswers, t, navigate, LOCAL_KEY]);

  // ✅ Khởi tạo test session
  useEffect(() => {
    const startSession = async () => {
      if (hasCreatedSession.current || !testId) return;
      try {
        const res = await createTestSession({ testId });
        if (res?.data?.id) {
          const now = Date.now();
          setSessionId(res.data.id);
          setStartedAt(now);
          hasCreatedSession.current = true;
          localStorage.setItem(
            LOCAL_KEY,
            JSON.stringify({
              selectedAnswers,
              sessionId: res.data.id,
              startedAt: now,
            })
          );
        }
      } catch (err) {
        toast.error((err as Error).message);
      }
    };
    startSession();
  }, [testId, t, LOCAL_KEY, selectedAnswers]);

  const loadDoingTestQuestions = useCallback(async () => {
    if (!testId) {
      setTestQuestions([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getDoingTestQuestions(testId);
      setTestQuestions(data.data || []);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  return {
    selectedAnswers,
    setSelectedAnswers,
    sessionId,
    startedAt,
    isSubmitting,
    handleFinish,
    loadDoingTestQuestions,
    testQuestions,
    loading,
  };
}
