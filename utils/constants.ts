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
export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
];

// AI constants
export const CHUNK_SIZE = 500;
export const CHUNK_OVERLAP = 100;

export const DEFAULT_FILE_SIZE_LIMIT = 10485760; // 10MB