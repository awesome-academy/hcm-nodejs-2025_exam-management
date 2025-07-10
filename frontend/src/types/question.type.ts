import type { components, paths } from "../types/api";

export type QuestionSerializer = components["schemas"]["QuestionSerializer"];

export interface CreateQuestionFormValues {
  subject_id: number;
  question_text: string;
  question_type: string;
  parent_question_id?: number;
  points: number;
  difficulty_level: string;
}

export interface UpdateQuestionFormValues {
  subject_id?: number;
  question_text?: string;
  question_type?: string;
  parent_question_id?: number;
  points?: number;
  difficulty_level?: string;
}

export type QuestionResponse =
  paths["/questions/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

export type QuestionResponseAll =
  paths["/questions"]["get"]["responses"]["200"]["content"]["application/json"];

export type DeleteQuestionResponse =
  paths["/questions/{id}"]["delete"]["responses"]["200"]["content"]["application/json"];
