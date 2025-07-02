export function generateToken(length = 13): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}
