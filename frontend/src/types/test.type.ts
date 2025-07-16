import type { paths } from "../types/api";
import type { components } from "../types/api";

export type TestSerializer = components["schemas"]["TestSerializer"];

export interface TestFormValues {
  title: string;
  time_limit: number;
  passing_score: number;
  subject_id: number;
  description?: string;
  is_published?: boolean;
  easy_question_count?: number;
  medium_question_count?: number;
  hard_question_count?: number;
  is_latest?: boolean;
  version?: number;
}

export type TestResponseAll =
  paths["/tests"]["get"]["responses"]["200"]["content"]["application/json"];

export type TestResponseSingle =
  paths["/tests/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

export type DeleteTestResponse =
  paths["/tests/{id}"]["delete"]["responses"]["200"]["content"]["application/json"];
