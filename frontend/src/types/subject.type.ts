import type { paths } from "../types/api";
import type { components } from "../types/api";

export type SubjectSerializer = components["schemas"]["SubjectSerializer"];

export interface CreateSubjectFormData {
  name: string;
  code: string;
  description?: string;
  file?: File;
}

export interface UpdateSubjectFormData {
  name?: string;
  code?: string;
  description?: string;
  image_url?: string;
  file?: File;
}

export interface SubjectFormValues {
  name: string;
  code: string;
  description?: string;
  image?: {
    originFileObj: File;
  }[];
}

export type SubjectResponse =
  paths["/subjects/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

export type SubjectResponseAll =
  paths["/subjects"]["get"]["responses"]["200"]["content"]["application/json"];

export type DeleteSubjectResponse =
  paths["/subjects/{id}"]["delete"]["responses"]["200"]["content"]["application/json"];
