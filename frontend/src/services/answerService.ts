import api from "../api/apiClient";
import type {
  AnswerResponseAllByQuestion,
  DeleteAnswersByQuestionResponse,
  UpdateAnswerFormValues,
  CreateBulkAnswerFormValues,
  UpdateAnswerResponse,
  DeleteAnswerResponse,
  CreateBulkAnswerResponse,
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

export const deleteAnswersByQuestion = async (
  questionId: number
): Promise<DeleteAnswersByQuestionResponse> => {
  try {
    const res = await api.delete(`/answers/question/${questionId}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "answer.delete_failed");
  }
};

export const updateAnswer = async (
  id: number,
  data: UpdateAnswerFormValues
): Promise<UpdateAnswerResponse> => {
  try {
    const res = await api.put(`/answers/${id}`, data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "answer.update_failed");
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

export const createBulkAnswers = async (
  questionId: number,
  data: CreateBulkAnswerFormValues
): Promise<CreateBulkAnswerResponse> => {
  try {
    const res = await api.post(`/answers/bulk/${questionId}`, data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "answer.create_bulk_failed");
  }
};
