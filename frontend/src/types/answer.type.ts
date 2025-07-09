import type { components, paths } from "../types/api";

export type AnswerSerializer = components["schemas"]["AnswerSerializer"];

export interface CreateAnswerFormValues {
  question_id: number;
  answer_text: string;
  is_correct: boolean;
  explanation?: string;
}

export interface UpdateAnswerFormValues {
  question_id?: number;
  answer_text?: string;
  is_correct?: boolean;
  explanation?: string;
}

export interface CreateBulkAnswerFormValues {
  answers: CreateAnswerFormValues[];
}

export type AnswerResponseAllByQuestion =
  paths["/answers/question/{questionId}"]["get"]["responses"]["200"]["content"]["application/json"];

export type DeleteAnswersByQuestionResponse =
  paths["/answers/question/{questionId}"]["delete"]["responses"]["200"]["content"]["application/json"];

export type UpdateAnswerResponse =
  paths["/answers/{id}"]["put"]["responses"]["200"]["content"]["application/json"];

export type DeleteAnswerResponse =
  paths["/answers/{id}"]["delete"]["responses"]["200"]["content"]["application/json"];

export type CreateBulkAnswerResponse =
  paths["/answers/bulk/{questionId}"]["post"]["responses"]["200"]["content"]["application/json"];
