export const ROUTES = {
  PROFILE: '/profile',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  CHAT: '/chat',
  ASSISTANTS: '/assistants',
  LIBRARY: '/library',
  EXPLORE: '/explore',
  TOOLS: '/tools',
  HOME: '/',
  FORGOT_PASSWORD: '/forgot-password',
  NOT_FOUND: '/404',
  ERROR: '/error',
};

export const PROTECTED_ROUTES = [ROUTES.PROFILE, ROUTES.SETTINGS];

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.RESET_PASSWORD,
];

// AI constants
export const CHUNK_SIZE = 500;
export const CHUNK_OVERLAP = 100;

export const DEFAULT_FILE_SIZE_LIMIT = 10485760; // 10MB
