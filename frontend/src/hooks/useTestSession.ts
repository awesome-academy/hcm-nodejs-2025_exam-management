import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import {
  createTestSession,
  submitTestSession,
  getTestSessionQuestions,
} from "../services/test_sessionService";
import { getTestById } from "../services/testService";
import { useNavigate } from "react-router-dom";
import type { TFunction } from "i18next";
import type {
  TestSessionQuestionSerializer,
  TestSessionSerializer,
} from "../types/test_session.type";
import type { TestSerializer } from "../types/test.type";
import { message } from "antd";

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

  const [testSessionQuestions, setTestSessionQuestions] = useState<
    TestSessionQuestionSerializer[]
  >([]);
  const [testSession, setTestSession] = useState<TestSessionSerializer | null>(
    null
  );
  const [testDetail, setTestDetail] = useState<TestSerializer | null>(null);
  const [loading, setLoading] = useState(false);

  // Load lại dữ liệu từ localStorage
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

  // Lưu dữ liệu vào localStorage
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify({ selectedAnswers, sessionId, startedAt })
      );
    }
  }, [selectedAnswers, sessionId, startedAt, LOCAL_KEY]);

  // Gửi bài làm
  const handleFinish = useCallback(async () => {
    if (!sessionId || isSubmitting) return;
    setIsSubmitting(true);

    const answers = Object.entries(selectedAnswers).map(
      ([tsqIdStr, answerId]) => {
        const tsqId = Number(tsqIdStr);
        const tsq = testSessionQuestions.find((q) => q.id === tsqId);
        return {
          questionId: tsq?.question?.id ?? -1,
          answerId,
        };
      }
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
  }, [
    sessionId,
    isSubmitting,
    selectedAnswers,
    testSessionQuestions,
    t,
    navigate,
    LOCAL_KEY,
  ]);

  // Tạo phiên làm bài mới
  useEffect(() => {
    const startSession = async () => {
      if (hasCreatedSession.current || !testId) return;
      try {
        const res = await createTestSession({ testId });
        const data = res?.data;
        if (data?.id) {
          const now = Date.now();
          setSessionId(data.id);
          setStartedAt(now);
          setTestSession(data);
          hasCreatedSession.current = true;

          localStorage.setItem(
            LOCAL_KEY,
            JSON.stringify({
              selectedAnswers,
              sessionId: data.id,
              startedAt: now,
            })
          );

          const questionRes = await getTestSessionQuestions(data.id);
          setTestSessionQuestions(questionRes.data || []);
        }
      } catch {
        message.error(t("test_session.create_failed"));
      }
    };
    startSession();
  }, [testId, t, LOCAL_KEY, selectedAnswers]);

  // Lấy danh sách câu hỏi
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!sessionId) return;
      setLoading(true);
      try {
        const res = await getTestSessionQuestions(sessionId);
        setTestSessionQuestions(res.data || []);
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [sessionId]);

  // Lấy chi tiết đề thi
  useEffect(() => {
    const fetchTestDetail = async () => {
      if (!testId) return;
      try {
        const res = await getTestById(testId);
        setTestDetail(res.data ?? null);
      } catch (err) {
        toast.error((err as Error).message);
      }
    };
    fetchTestDetail();
  }, [testId]);

  return {
    selectedAnswers,
    setSelectedAnswers,
    sessionId,
    startedAt,
    isSubmitting,
    handleFinish,
    testQuestions: testSessionQuestions,
    loading,
    testSession,
    testDetail,
  };
}
