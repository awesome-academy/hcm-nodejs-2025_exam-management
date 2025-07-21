import api from "../api/apiClient";
import type {
  CreateTestSessionFormValues,
  SubmitTestSessionFormValues,
  CreateTestSessionResponse,
  SubmitTestSessionResponse,
  GetTestSessionHistoryListResponse,
  GetTestSessionDetailRawUserResponse,
  GetTestSessionDetailResponse,
  GetTestSessionListAdminResponse,
  GetTestSessionDetailRawAdminResponse,
  GetTestSessionQuestionsResponse
} from "../types/test_session.type";
import { handleAxiosError } from "../utils/handleError";

// Tạo mới một phiên làm bài
export const createTestSession = async (
  body: CreateTestSessionFormValues
): Promise<CreateTestSessionResponse> => {
  try {
    const res = await api.post("/test-sessions", body);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test_session.create_failed");
  }
};

// Nộp bài thi
export const submitTestSession = async (
  sessionId: number,
  body: SubmitTestSessionFormValues
): Promise<SubmitTestSessionResponse> => {
  try {
    const res = await api.post(`/test-sessions/${sessionId}/submit`, body);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test_session.submit_failed");
  }
};

// User lấy toàn bộ lịch sử làm bài
export const getTestSessionHistory =
  async (): Promise<GetTestSessionHistoryListResponse> => {
    try {
      const res = await api.get("/test-sessions/history/me");
      return res.data;
    } catch (err) {
      throw handleAxiosError(err, "test_session.history_failed");
    }
  };

// User xem chi tiết bài thi trong lịch sử
export const getTestSessionHistoryDetail = async (
  id: number
): Promise<GetTestSessionDetailRawUserResponse> => {
  try {
    const res = await api.get(`/test-sessions/raw/${id}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test_session.get_history_detail_failed");
  }
};

// User xem kết quả ngay sau khi submit
export const getTestSessionById = async (
  id: number
): Promise<GetTestSessionDetailResponse> => {
  try {
    const res = await api.get(`/test-sessions/${id}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test_session.get_by_id_failed");
  }
};

// Supervisor lấy toàn bộ lịch sử bài thi của tất cả user
export const getAllTestSessionsAdmin =
  async (): Promise<GetTestSessionListAdminResponse> => {
    try {
      const res = await api.get("/test-sessions/suppervisor/all");
      return res.data;
    } catch (err) {
      throw handleAxiosError(err, "test_session.admin_get_all_failed");
    }
  };

// Supervisor xem chi tiết bài thi bất kỳ của user
export const getTestSessionDetailAdmin = async (
  id: number
): Promise<GetTestSessionDetailRawAdminResponse> => {
  try {
    const res = await api.get(`/test-sessions/raw/supervisor/${id}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test_session.admin_get_detail_failed");
  }
};


export const getTestSessionQuestions = async (
  sessionId: number
): Promise<GetTestSessionQuestionsResponse> => {
  try {
    const res = await api.get(`/test-sessions/${sessionId}/questions`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test_session.get_questions_failed");
  }
};