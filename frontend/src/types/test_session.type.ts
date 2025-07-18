import type { components, paths } from "../types/api";

/* ========== CUSTOM OVERRIDE TYPES ========== */

// Snapshot cho đáp án của một câu hỏi trong bài thi
export interface AnswerSnapshot {
  id: number;
  answer_text: string;
  is_correct: boolean;
  explanation: string;
}

// Dữ liệu câu hỏi đã snapshot trong phiên thi (có thể kèm question gốc)
export interface TestSessionQuestionSerializer {
  id: number;
  session_id: number;
  question_id: number;
  order_number: number;
  question?: {
    id: number;
    subject_id: number;
    question_text: string;
    points: number;
    difficulty_level: string;
    creator_id: number;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    version: string;
  };
  answers_snapshot?: AnswerSnapshot[];
}

// Thông tin toàn phiên thi
export type TestSessionSerializer =
  components["schemas"]["TestSessionSerializer"];

// Đáp án người dùng chọn (gắn vào từng câu hỏi)
export type UserAnswerSerializer =
  components["schemas"]["UserAnswerSerializer"];

// User xem chi tiết bài thi sau khi thi
export type GetTestSessionDetailResponse =
  paths["/test-sessions/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

// Supervisor xem chi tiết bài thi
export type GetTestSessionDetailRawAdminResponse =
  paths["/test-sessions/raw/supervisor/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

// User xem chi tiết bài thi trong lịch sử
export type GetTestSessionDetailRawUserResponse =
  paths["/test-sessions/raw/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

// Lấy tất cả lịch sử bài thi của học viên (admin)
export type GetTestSessionListAdminResponse =
  paths["/test-sessions/suppervisor/all"]["get"]["responses"]["200"]["content"]["application/json"];

// Lấy tất cả lịch sử bài thi của user
export type GetTestSessionHistoryListResponse =
  paths["/test-sessions/history/me"]["get"]["responses"]["200"]["content"]["application/json"];

// Lấy danh sách câu hỏi trong phiên thi
export type GetTestSessionQuestionsResponse =
  paths["/test-sessions/{id}/questions"]["get"]["responses"]["200"]["content"]["application/json"];

/* ========== FORM DATA ========== */

export interface CreateTestSessionFormValues {
  testId: number;
}

export interface SubmitTestSessionFormValues {
  answers: {
    questionId: number;
    answerId: number;
  }[];
}

export type CreateTestSessionResponse =
  paths["/test-sessions"]["post"]["responses"]["200"]["content"]["application/json"];

export type SubmitTestSessionResponse =
  paths["/test-sessions/{id}/submit"]["post"]["responses"]["200"]["content"]["application/json"];
