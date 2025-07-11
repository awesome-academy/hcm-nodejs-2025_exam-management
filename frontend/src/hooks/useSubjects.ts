import { useState, useEffect, useCallback } from "react";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../services/subjectService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import type {
  CreateSubjectFormData,
  UpdateSubjectFormData,
  SubjectSerializer,
  SubjectFormValues,
} from "../types/subject.type";
import { useAuth } from "./useAuth";

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<SubjectSerializer[]>([]);
  const [selectedSubject, setSelectedSubject] =
    useState<SubjectSerializer | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("subject");
  const { token } = useAuth();

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await getAllSubjects();
      setSubjects(data.data || []);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectById = useCallback(
    async (id: number): Promise<SubjectSerializer | null> => {
      try {
        const data = await getSubjectById(id);
        const subject = data.data ?? null;
        setSelectedSubject(subject);
        return subject;
      } catch (err) {
        toast.error((err as Error).message);
        return null;
      }
    },
    []
  );

  const onCreate = async (values: SubjectFormValues) => {
    try {
      const file = values.image?.[0]?.originFileObj;
      const payload: CreateSubjectFormData = {
        name: values.name,
        code: values.code,
        description: values.description,
        file,
      };

      await createSubject(payload);
      toast.success(t("create_success"));
      await loadSubjects();
      return true;
    } catch (err) {
      console.log("err.message", (err as Error).message);
      toast.error((err as Error).message);
      return false;
    }
  };

  const onUpdate = async (id: number, values: SubjectFormValues) => {
    try {
      const file = values.image?.[0]?.originFileObj;
      const payload: UpdateSubjectFormData = {
        name: values.name,
        code: values.code,
        description: values.description,
        file,
      };

      await updateSubject(id, payload);
      toast.success(t("update_success"));
      await loadSubjects();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deleteSubject(id);
      toast.success(t("delete_success"));
      await loadSubjects();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  useEffect(() => {
    if (token) {
      loadSubjects();
    }
  }, [token]);

  return {
    subjects,
    loading,
    selectedSubject,
    fetchSubjectById,
    onCreate,
    onUpdate,
    onDelete,
    loadSubjects,
  };
};
