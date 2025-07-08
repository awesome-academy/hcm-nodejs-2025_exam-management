import api from "../api/apiClient";
import type {
  CreateSubjectDto,
  UpdateSubjectDto,
  SubjectResponse,
  SubjectResponseAll,
  DeleteSubjectResponse,
} from "../types/subject.type";
import { handleAxiosError } from "../utils/handleError";

export const getAllSubjects = async (): Promise<SubjectResponseAll> => {
  try {
    const res = await api.get("/subjects");
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "subject.fetch_all_failed");
  }
};

export const getSubjectById = async (id: number): Promise<SubjectResponse> => {
  try {
    const res = await api.get(`/subjects/${id}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "subject.fetch_one_failed");
  }
};

export const createSubject = async (
  data: CreateSubjectDto
): Promise<SubjectResponse> => {
  try {
    const res = await api.post("/subjects", data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "subject.create_failed");
  }
};

export const updateSubject = async (
  id: number,
  data: UpdateSubjectDto
): Promise<SubjectResponse> => {
  try {
    const res = await api.put(`/subjects/${id}`, data);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "subject.update_failed");
  }
};

export const deleteSubject = async (
  id: number
): Promise<DeleteSubjectResponse> => {
  try {
    const res = await api.delete(`/subjects/${id}`);
    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "subject.delete_failed");
  }
};
