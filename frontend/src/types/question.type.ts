import type { components, paths } from "../types/api";

export type QuestionSerializer = components["schemas"]["QuestionSerializer"];

export interface AnswerFormValue {
  id?: number;
  answer_text: string;
  is_correct: boolean;
  explanation?: string;
  is_active?: boolean;
}

export interface CreateQuestionFormValues {
  subject_id: number;
  question_text: string;
  question_type: string;
  points: number;
  difficulty_level: string;
  is_active: boolean;
  answers: AnswerFormValue[];
}

export interface UpdateQuestionFormValues {
  subject_id?: number;
  question_text?: string;
  question_type?: string;
  points?: number;
  difficulty_level?: string;
  is_active: boolean;
  answers: AnswerFormValue[];
}

export type QuestionResponse =
  paths["/questions/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

export type QuestionResponseAll =
  paths["/questions"]["get"]["responses"]["200"]["content"]["application/json"];

export type DeleteQuestionResponse =
  paths["/questions/{id}"]["delete"]["responses"]["200"]["content"]["application/json"];

  export type QuestionStatsResponse =
  paths["/questions/stats/{subjectId}"]["get"]["responses"]["200"]["content"]["application/json"];
