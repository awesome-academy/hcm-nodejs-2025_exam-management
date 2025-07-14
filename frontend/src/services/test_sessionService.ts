import api from "../api/apiClient";
import type {
  CreateTestSessionFormValues,
  SubmitTestSessionFormValues,
  CreateTestSessionResponse,
  SubmitTestSessionResponse,
  GetTestSessionHistoryResponse,
  GetTestSessionByIdResponse,
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
