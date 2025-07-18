import api from "../api/apiClient";
import type {
  TestResponseAll,
  TestResponseSingle,
  DeleteTestResponse,
  TestFormValues,
} from "../types/test.type";
import { handleAxiosError } from "../utils/handleError";

export const getAllTests = async (filters?: {
  subject_id?: number;
  is_published?: boolean;
}): Promise<TestResponseAll> => {
  try {
    const res = await api.get("/tests", {
      params: filters,
    });
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test.fetch_all_failed");
  }
};

export const getTestById = async (id: number): Promise<TestResponseSingle> => {
  try {
    const res = await api.get(`/tests/${id}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test.fetch_one_failed");
  }
};

export const createTest = async (
  data: TestFormValues
): Promise<TestResponseSingle> => {
  try {
    const res = await api.post("/tests", data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test.create_failed");
  }
};

export const updateTest = async (
  id: number,
  data: TestFormValues
): Promise<TestResponseSingle> => {
  try {
    const res = await api.put(`/tests/${id}`, data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test.update_failed");
  }
};

export const deleteTest = async (id: number): Promise<DeleteTestResponse> => {
  try {
    const res = await api.delete(`/tests/${id}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test.delete_failed");
  }
};
