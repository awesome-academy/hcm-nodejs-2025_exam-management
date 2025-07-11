import type { components, paths } from "../types/api";

export type TestQuestionSerializer =
  components["schemas"]["TestQuestionSerializer"];

export interface CreateTestQuestionFormValues {
  question_id: number;
  order_number: number;
}

export interface CreateBulkTestQuestionFormValues {
  questions: CreateTestQuestionFormValues[];
}

export type TestQuestionResponseAllByTest =
  paths["/test-questions/test/{testId}"]["get"]["responses"]["200"]["content"]["application/json"];

export type DeleteTestQuestionByIdResponse =
  paths["/test-questions/{testId}/{questionId}"]["delete"]["responses"]["200"]["content"]["application/json"];

export type CreateBulkTestQuestionResponse =
  paths["/test-questions/bulk/{testId}"]["post"]["responses"]["200"]["content"]["application/json"];

export type TestQuestionResponseForDoing =
  paths["/test-questions/doing/{testId}"]["get"]["responses"]["200"]["content"]["application/json"];
