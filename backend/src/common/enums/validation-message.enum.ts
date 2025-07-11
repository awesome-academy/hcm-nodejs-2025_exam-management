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

  TEST_TITLE_REQUIRED = 'test.title_required',
  TEST_TITLE_MAX = 'test.title_max',

  TEST_DESCRIPTION_MAX = 'test.description_max',

  TEST_TIME_REQUIRED = 'test.time_required',
  TEST_TIME_MIN = 'test.time_min',
  TEST_TIME_MAX = 'test.time_max',

  TEST_TOTAL_POINTS_REQUIRED = 'test.total_points_required',
  TEST_TOTAL_POINTS_MIN = 'test.total_points_min',

  TEST_PASSING_SCORE_REQUIRED = 'test.passing_score_required',
  TEST_PASSING_SCORE_MIN = 'test.passing_score_min',
  TEST_PASSING_SCORE_MAX = 'test.passing_score_max',
}
