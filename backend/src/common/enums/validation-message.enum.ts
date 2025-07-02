export enum ValidationMessage {
  USERNAME_REQUIRED = 'user.username_required',
  USERNAME_MIN = 'user.username_min',
  USERNAME_MAX = 'user.username_max',

  PASSWORD_REQUIRED = 'user.password_required',
  PASSWORD_MIN = 'user.password_min',
  PASSWORD_MAX = 'user.password_max',

  FULLNAME_REQUIRED = 'user.fullname_required',

  EMAIL_REQUIRED = 'user.email_required',
  EMAIL_INVALID = 'user.email_invalid',

  ROLE_INVALID = 'user.role_invalid',

  LOGIN_USERNAME_REQUIRED = 'user.login_username_required',
  LOGIN_PASSWORD_REQUIRED = 'user.login_password_required',

  AVATAR_URL_INVALID = 'user.avatar_url_invalid',

  CONFIRM_PASSWORD_REQUIRED = 'user.confirm_password_required',
  CONFIRM_PASSWORD_NOT_MATCH = 'user.confirm_password_not_match',
}
