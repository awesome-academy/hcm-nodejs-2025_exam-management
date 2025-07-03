export enum ValidationMessage {
  USERNAME_REQUIRED = 'validation.username_required',
  USERNAME_MIN = 'validation.username_min',
  USERNAME_MAX = 'validation.username_max',

  PASSWORD_REQUIRED = 'validation.password_required',
  PASSWORD_MIN = 'validation.password_min',
  PASSWORD_MAX = 'validation.password_max',

  FULLNAME_REQUIRED = 'validation.fullname_required',

  EMAIL_REQUIRED = 'validation.email_required',
  EMAIL_INVALID = 'validation.email_invalid',

  ROLE_INVALID = 'validation.role_invalid',

  LOGIN_USERNAME_REQUIRED = 'validation.login_username_required',
  LOGIN_PASSWORD_REQUIRED = 'validation.login_password_required',

  AVATAR_URL_INVALID = 'validation.avatar_url_invalid',

  CONFIRM_PASSWORD_REQUIRED = 'validation.confirm_password_required',
  CONFIRM_PASSWORD_NOT_MATCH = 'validation.confirm_password_not_match',
}
