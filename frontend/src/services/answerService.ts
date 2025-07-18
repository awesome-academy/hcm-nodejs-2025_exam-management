import api from "../api/apiClient";
import type {
  AnswerResponseAllByQuestion,
  DeleteAnswerResponse,
  AnswerSerializer,
  AnswerFormValues,
} from "../types/answer.type";
import { handleAxiosError } from "../utils/handleError";

export const getAnswersByQuestion = async (
  questionId: number
): Promise<AnswerResponseAllByQuestion> => {
  try {
    const res = await api.get(`/answers/question/${questionId}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "answer.fetch_all_failed");
  }
};

export const deleteAnswer = async (
  id: number
): Promise<DeleteAnswerResponse> => {
  try {
    const res = await api.delete(`/answers/${id}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "answer.delete_failed");
  }
};

export const createAnswer = async (
  questionId: number,
  data: AnswerFormValues
): Promise<AnswerSerializer> => {
  try {
    const res = await api.post(`/answers/question/${questionId}/answers`, data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "answer.create_failed");
  }
};

export const updateAnswer = async (
  id: number,
  data: AnswerFormValues
): Promise<AnswerSerializer> => {
  try {
    const res = await api.put(`/answers/${id}`, data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "answer.update_failed");
  }
};
