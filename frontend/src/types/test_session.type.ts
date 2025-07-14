import type { components, paths } from "../types/api";

export type TestSessionSerializer =
  components["schemas"]["TestSessionSerializer"];

export interface CreateTestSessionFormValues {
  testId: number;
}

export interface SubmitTestSessionFormValues {
  answers: {
    questionId: number;
    answerId: number;
  }[];
}

export type CreateTestSessionResponse =
  paths["/test-sessions"]["post"]["responses"]["200"]["content"]["application/json"];

export type SubmitTestSessionResponse =
  paths["/test-sessions/{id}/submit"]["post"]["responses"]["200"]["content"]["application/json"];

export type GetTestSessionHistoryResponse =
  paths["/test-sessions/history/me"]["get"]["responses"]["200"]["content"]["application/json"];

export type GetTestSessionByIdResponse =
  paths["/test-sessions/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
