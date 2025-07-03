export const getEmailVerificationTemplate = (verifyLink: string, expiresInMinutes: number) => {
  return `
    <h3>Chào bạn,</h3>
    <p>Nhấn vào liên kết sau để xác thực tài khoản của bạn:</p>
    <a href="${verifyLink}">${verifyLink}</a>
    <p>Liên kết này sẽ hết hạn trong ${expiresInMinutes} phút.</p>
  `;
};
