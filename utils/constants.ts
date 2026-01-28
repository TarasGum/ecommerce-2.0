// utils/constants.ts

// ==================== APPLICATION ====================
export const APP_NAME = 'Ecommerce Platform';
export const APP_VERSION = '1.0.0';

// ==================== API & NETWORK ====================
export const API_TIMEOUT_MS = 30000;
export const RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_MS = 1000;

// ==================== AUTHENTICATION ====================
export const TOKEN_COOKIE_NAME = 'auth.access';
export const REFRESH_COOKIE_NAME = 'auth.refresh';

export const COOKIE_MAX_AGE = {
  ACCESS: 60 * 60 * 24 * 7, // 7 days in seconds
  REFRESH: 60 * 60 * 24 * 30, // 30 days in seconds
} as const;

export const COOKIE_CONFIG = {
  names: {
    access: 'auth.access',
    refresh: 'auth.refresh',
  },
  maxAge: {
    access: 60 * 60 * 24 * 7, // 7 days
    refresh: 60 * 60 * 24 * 30, // 30 days
  },
  options: {
    sameSite: 'strict' as const,
    path: '/',
    // secure is set at runtime based on environment
  },
} as const;

// ==================== PAGINATION ====================
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE_SMALL: 10,
  PAGE_SIZE_DEFAULT: 20,
  PAGE_SIZE_MEDIUM: 25,
  PAGE_SIZE_LARGE: 50,
  PAGE_SIZE_MAX: 100,
} as const;

// ==================== DEBOUNCE TIMINGS ====================
export const DEBOUNCE_MS = {
  SEARCH_SHORT: 300,
  SEARCH_DEFAULT: 400,
  SEARCH_LONG: 500,
  INPUT_DEFAULT: 300,
  RESIZE: 150,
} as const;

// ==================== ORDER STATUS ====================
export const ORDER_STATUS = {
  UNPROCESSED: 'U',
  OPEN: 'O',
  CLOSED: 'X',
} as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.UNPROCESSED]: 'Unprocessed',
  [ORDER_STATUS.OPEN]: 'Open',
  [ORDER_STATUS.CLOSED]: 'Closed',
} as const;

export const ORDER_STATUS_SEVERITIES: Record<OrderStatus, string> = {
  [ORDER_STATUS.UNPROCESSED]: 'warning',
  [ORDER_STATUS.OPEN]: 'info',
  [ORDER_STATUS.CLOSED]: 'success',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// ==================== PROPOSAL STATUS ====================
export const PROPOSAL_STATUS = {
  OPEN: 'O',
  ACCEPTED: 'A',
  LOST: 'L',
  CANCELLED: 'C',
  EXPIRED: 'E',
} as const;

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  [PROPOSAL_STATUS.OPEN]: 'Open',
  [PROPOSAL_STATUS.ACCEPTED]: 'Accepted',
  [PROPOSAL_STATUS.LOST]: 'Lost',
  [PROPOSAL_STATUS.CANCELLED]: 'Cancelled',
  [PROPOSAL_STATUS.EXPIRED]: 'Expired',
} as const;

export const PROPOSAL_STATUS_SEVERITIES: Record<ProposalStatus, string> = {
  [PROPOSAL_STATUS.OPEN]: 'info',
  [PROPOSAL_STATUS.ACCEPTED]: 'success',
  [PROPOSAL_STATUS.LOST]: 'danger',
  [PROPOSAL_STATUS.CANCELLED]: 'secondary',
  [PROPOSAL_STATUS.EXPIRED]: 'warning',
} as const;

export type ProposalStatus = typeof PROPOSAL_STATUS[keyof typeof PROPOSAL_STATUS];

// ==================== USER ROLES ====================
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.SUPERADMIN]: 'SuperAdmin',
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.USER]: 'User',
} as const;

export const USER_ROLE_SEVERITIES: Record<UserRole, string> = {
  [USER_ROLES.SUPERADMIN]: 'danger',
  [USER_ROLES.ADMIN]: 'warning',
  [USER_ROLES.USER]: 'info',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// ==================== VALIDATION ====================
export const VALIDATION_LIMITS = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: 255,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  SEARCH_MIN_LENGTH: 2,
} as const;

// ==================== TOAST DURATIONS ====================
export const TOAST_DURATION_MS = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;

// ==================== TEXT TRUNCATION ====================
export const TEXT_TRUNCATE_LENGTH = {
  SHORT: 20,
  DEFAULT: 40,
  MEDIUM: 60,
  LONG: 100,
} as const;

// ==================== DATE & LOCALE ====================
export const LOCALE_DEFAULT = 'en-US';
export const CURRENCY_DEFAULT = 'USD';

export const DATE_FORMAT_OPTIONS = {
  DISPLAY: { 
    year: 'numeric' as const, 
    month: 'short' as const, 
    day: 'numeric' as const 
  },
  FULL: { 
    year: 'numeric' as const, 
    month: 'long' as const, 
    day: 'numeric' as const 
  },
  SHORT: { 
    year: '2-digit' as const, 
    month: 'numeric' as const, 
    day: 'numeric' as const 
  },
} as const;

// ==================== HELPER FUNCTIONS ====================

/**
 * Get display label for order status
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] || status;
}

/**
 * Get PrimeVue severity for order status badge
 */
export function getOrderStatusSeverity(status: OrderStatus): string {
  return ORDER_STATUS_SEVERITIES[status] || 'secondary';
}

/**
 * Get display label for user role
 */
export function getUserRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role] || role;
}

/**
 * Get PrimeVue severity for user role badge
 */
export function getUserRoleSeverity(role: UserRole): string {
  return USER_ROLE_SEVERITIES[role] || 'secondary';
}

/**
 * Check if user has superadmin role
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === USER_ROLES.SUPERADMIN;
}

/**
 * Check if user has admin or superadmin role
 */
export function isAdmin(role: UserRole): boolean {
  return role === USER_ROLES.ADMIN || role === USER_ROLES.SUPERADMIN;
}

/**
 * Get display label for proposal status
 */
export function getProposalStatusLabel(status: ProposalStatus): string {
  return PROPOSAL_STATUS_LABELS[status] || status;
}

/**
 * Get PrimeVue severity for proposal status badge
 */
export function getProposalStatusSeverity(status: ProposalStatus): string {
  return PROPOSAL_STATUS_SEVERITIES[status] || 'secondary';
}
