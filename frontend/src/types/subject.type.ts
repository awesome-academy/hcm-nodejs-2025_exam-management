import type { paths } from "../types/api";
import type { components } from "../types/api";

export type SubjectSerializer = components["schemas"]["SubjectSerializer"];

export type CreateSubjectDto =
  paths["/subjects"]["post"]["requestBody"]["content"]["application/json"];

export type UpdateSubjectDto =
  paths["/subjects/{id}"]["put"]["requestBody"]["content"]["application/json"];

export type SubjectResponse =
  paths["/subjects/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

export type SubjectResponseAll =
  paths["/subjects"]["get"]["responses"]["200"]["content"]["application/json"];

export type DeleteSubjectResponse =
  paths["/subjects/{id}"]["delete"]["responses"]["200"]["content"]["application/json"];
