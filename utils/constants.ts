export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
  ERROR: '/error',
  CHAT: '/chat',
};

export const PROTECTED_ROUTES = [ROUTES.PROFILE, ROUTES.SETTINGS];
