import type { components, paths } from "../types/api";

export type AnswerSerializer = components["schemas"]["AnswerSerializer"];

export interface AnswerFormValues {
  question_id?: number;
  answer_text?: string;
  is_correct?: boolean;
  explanation?: string;
  is_active: boolean;
}

export interface AnswerWithOriginal {
  id: number;
  original_id?: number;
  answer_text: string;
  is_correct: boolean;
  explanation: string;
}

export type AnswerResponseAllByQuestion =
  paths["/answers/question/{questionId}"]["get"]["responses"]["200"]["content"]["application/json"];

export type DeleteAnswerResponse =
  paths["/answers/{id}"]["delete"]["responses"]["200"]["content"]["application/json"];

export type AnswerCreateRequest =
  paths["/answers/question/{questionId}/answers"]["post"]["requestBody"]["content"]["application/json"];

export type AnswerUpdateRequest =
  paths["/answers/{id}"]["put"]["requestBody"]["content"]["application/json"];
