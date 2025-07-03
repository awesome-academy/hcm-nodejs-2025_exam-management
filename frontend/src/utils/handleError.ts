import axios from "axios";

export function handleAxiosError(
  err: unknown,
  defaultMessage = "Đã xảy ra lỗi"
) {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return new Error(message.join("\n"));
    return new Error(message || defaultMessage);
  }
  return new Error(defaultMessage);
}
