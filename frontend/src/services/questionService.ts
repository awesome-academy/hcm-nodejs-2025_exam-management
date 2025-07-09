import api from "../api/apiClient";
import type {
  CreateQuestionFormValues,
  UpdateQuestionFormValues,
  QuestionResponse,
  QuestionResponseAll,
  DeleteQuestionResponse,
} from "../types/question.type";
import { handleAxiosError } from "../utils/handleError";

export const getAllQuestions = async (): Promise<QuestionResponseAll> => {
  try {
    const res = await api.get("/questions");
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "question.fetch_all_failed");
  }
};

export const getQuestionById = async (
  id: number
): Promise<QuestionResponse> => {
  try {
    const res = await api.get(`/questions/${id}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "question.fetch_one_failed");
  }
};

export const createQuestion = async (
  data: CreateQuestionFormValues
): Promise<QuestionResponse> => {
  try {
    const res = await api.post("/questions", data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "question.create_failed");
  }
};

export const updateQuestion = async (
  id: number,
  data: UpdateQuestionFormValues
): Promise<QuestionResponse> => {
  try {
    const res = await api.put(`/questions/${id}`, data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "question.update_failed");
  }
};

export const deleteQuestion = async (
  id: number
): Promise<DeleteQuestionResponse> => {
  try {
    const res = await api.delete(`/questions/${id}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "question.delete_failed");
  }
};
