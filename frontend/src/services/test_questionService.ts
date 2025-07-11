import api from "../api/apiClient";
import type {
  TestQuestionResponseAllByTest,
  CreateBulkTestQuestionFormValues,
  CreateBulkTestQuestionResponse,
  DeleteTestQuestionByIdResponse,
  TestQuestionResponseForDoing,
} from "../types/test_question.type";
import { handleAxiosError } from "../utils/handleError";

export const getTestQuestionsByTestId = async (
  testId: number
): Promise<TestQuestionResponseAllByTest> => {
  try {
    const res = await api.get(`/test-questions/test/${testId}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test_question.fetch_failed");
  }
};

export const createBulkTestQuestions = async (
  testId: number,
  body: CreateBulkTestQuestionFormValues
): Promise<CreateBulkTestQuestionResponse> => {
  try {
    const res = await api.post(`/test-questions/bulk/${testId}`, body);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test_question.create_failed");
  }
};

export const deleteTestQuestion = async (
  testId: number,
  questionId: number
): Promise<DeleteTestQuestionByIdResponse> => {
  try {
    const res = await api.delete(`/test-questions/${testId}/${questionId}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test_question.delete_failed");
  }
};
export const getDoingTestQuestions = async (
  testId: number
): Promise<TestQuestionResponseForDoing> => {
  try {
    const res = await api.get(`/test-questions/doing/${testId}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "test_question.fetch_failed");
  }
};
