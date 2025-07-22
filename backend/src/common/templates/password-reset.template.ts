export const getPasswordResetTemplate = (resetLink: string, expiresInMinutes: number) => {
  return `
    <h3>Chào bạn,</h3>
    <p>Nhấn vào liên kết sau để đặt lại mật khẩu của bạn:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>Liên kết này sẽ hết hạn trong ${expiresInMinutes} phút.</p>
  `;
};
