export const ROUTES = {
  ROOT: '/',
  HOME: '/home',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register',
  BIND_ACCOUNT: '/bind-account',
  RESET_PASSWORD: '/reset-password',
  FORGOT_PASSWORD: '/forgot-password',
  NOT_FOUND: '/404',
  ERROR: '/error',
};

export const PROTECTED_ROUTES = [ROUTES.PROFILE, ROUTES.SETTINGS];

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.BIND_ACCOUNT,
  ROUTES.RESET_PASSWORD,
];
