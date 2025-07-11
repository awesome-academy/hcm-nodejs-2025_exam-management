import type { paths } from "../types/api";
import type { components } from "../types/api";

export type TestSerializer = components["schemas"]["TestSerializer"];

export interface TestFormValues {
  subject_id: number;
  title: string;
  description?: string;
  time_limit: number;
  passing_score: number;
  is_published?: boolean;
}

export type TestResponseAll =
  paths["/tests"]["get"]["responses"]["200"]["content"]["application/json"];

export type TestResponseSingle =
  paths["/tests/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

export type DeleteTestResponse =
  paths["/tests/{id}"]["delete"]["responses"]["200"]["content"]["application/json"];
