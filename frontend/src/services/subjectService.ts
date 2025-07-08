import api from "../api/apiClient";
import type {
  CreateSubjectFormData,
  UpdateSubjectFormData,
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
  data: CreateSubjectFormData
): Promise<SubjectResponse> => {
  try {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("code", data.code);
    if (data.description) formData.append("description", data.description);
    if (data.file) formData.append("file", data.file);

    const res = await api.post("/subjects", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (err) {
    throw handleAxiosError(err, "subject.create_failed");
  }
};

export const updateSubject = async (
  id: number,
  data: UpdateSubjectFormData
): Promise<SubjectResponse> => {
  try {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.code) formData.append("code", data.code);
    if (data.description) formData.append("description", data.description);
    if (data.file) formData.append("file", data.file);
    if (data.image_url) formData.append("image_url", data.image_url);

    const res = await api.put(`/subjects/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

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
