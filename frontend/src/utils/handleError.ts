import axios from "axios";
import i18n from "../i18n";

export function handleAxiosError(
  err: unknown,
  defaultMessageKey = "common.unknown_error"
) {
  const defaultMessage = i18n.t(defaultMessageKey);

  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return new Error(message.join("\n"));
    return new Error(message || defaultMessage);
  }

  return new Error(defaultMessage);
}
