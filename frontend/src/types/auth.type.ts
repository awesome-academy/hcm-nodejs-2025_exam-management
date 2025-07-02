import type { paths } from "../types/api";

export type RegisterFormData =
  paths["/users/register"]["post"]["requestBody"]["content"]["application/json"];

export type LoginFormData =
  paths["/auth/login"]["post"]["requestBody"]["content"]["application/json"];

export type LoginResponse =
  paths["/auth/login"]["post"]["responses"]["default"]["content"]["application/json"];
