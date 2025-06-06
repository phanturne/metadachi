export const ROUTES = {
  ROOT: '/',
  HOME: '/home',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  FORGOT_PASSWORD: '/forgot-password',
  NOT_FOUND: '/404',
  ERROR: '/error',
};

export const PROTECTED_ROUTES = [ROUTES.PROFILE, ROUTES.SETTINGS];

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.RESET_PASSWORD];
