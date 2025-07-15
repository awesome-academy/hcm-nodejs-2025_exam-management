import api from "../api/apiClient";
import type {
  CreateTestSessionFormValues,
  SubmitTestSessionFormValues,
  CreateTestSessionResponse,
  SubmitTestSessionResponse,
  GetTestSessionHistoryResponse,
  GetTestSessionByIdResponse,
  GetTestSessionHistoryDetailResponse,
  GetAllTestSessionsAdminResponse,
  GetTestSessionDetailAdminResponse,
} from "../types/test_session.type";
import { handleAxiosError } from "../utils/handleError";

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

export const getTestSessionHistory =
  async (): Promise<GetTestSessionHistoryResponse> => {
    try {
      const res = await api.get("/test-sessions/history/me");
      return res.data;
    } catch (err) {
      throw handleAxiosError(err, "test_session.history_failed");
    }
  };

//  Dùng cho kết quả từ lịch sử (không lọc câu bị ẩn)
export const getTestSessionHistoryDetail = async (
  id: number
): Promise<GetTestSessionHistoryDetailResponse> => {
  try {
    const res = await api.get(`/test-sessions/${id}/history`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test_session.get_history_detail_failed");
  }
};

//  Dùng cho kết quả ngay sau khi submit (có lọc câu bị xóa)
export const getTestSessionById = async (
  id: number
): Promise<GetTestSessionByIdResponse> => {
  try {
    const res = await api.get(`/test-sessions/${id}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test_session.get_by_id_failed");
  }
};

// Lấy toàn bộ bài thi (admin)
export const getAllTestSessionsAdmin =
  async (): Promise<GetAllTestSessionsAdminResponse> => {
    try {
      const res = await api.get("/test-sessions/suppervisor/all");
      return res.data;
    } catch (err) {
      throw handleAxiosError(err, "test_session.admin_get_all_failed");
    }
  };

// Lấy chi tiết bài thi bất kỳ (admin)
export const getTestSessionDetailAdmin = async (
  id: number
): Promise<GetTestSessionDetailAdminResponse> => {
  try {
    const res = await api.get(`/test-sessions/suppervisor/${id}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test_session.admin_get_detail_failed");
  }
};
