// ==============================================
// Application Constants
// ==============================================

export const APP_NAME = 'Signature Numérique';
export const APP_DESCRIPTION = 'Une solution de signature électronique simple et sécurisée';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ==============================================
// API Routes
// ==============================================

export const API_ROUTES = {
  // Auth
  AUTH: {
    SIGN_IN: '/api/auth/signin',
    SIGN_OUT: '/api/auth/signout',
    SESSION: '/api/auth/session',
    CSRF: '/api/auth/csrf',
  },
  
  // API
  API: {
    BASE: '/api',
    CONTRACTS: '/api/contracts',
    SIGNERS: '/api/signers',
    USERS: '/api/users',
    UPLOAD: '/api/upload',
    DOWNLOAD: '/api/download',
  },
};

// ==============================================
// Storage Constants
// ==============================================

export const STORAGE_KEYS = {
  AUTH: 'auth',
  THEME: 'theme',
  LANGUAGE: 'language',
  REDIRECT_URL: 'redirect_url',
  SIGNATURE: 'signature',
  DRAFT_CONTRACT: 'draft_contract',
};

// ==============================================
// Contract Status
// ==============================================

export const CONTRACT_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  IN_PROGRESS: 'IN_PROGRESS',
  SIGNED: 'SIGNED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export type ContractStatus = keyof typeof CONTRACT_STATUS;

// ==============================================
// Event Types
// ==============================================

export const EVENT_TYPES = {
  // Contract Events
  CONTRACT_CREATED: 'CONTRACT_CREATED',
  CONTRACT_UPDATED: 'CONTRACT_UPDATED',
  CONTRACT_SENT: 'CONTRACT_SENT',
  CONTRACT_SIGNED: 'CONTRACT_SIGNED',
  CONTRACT_DECLINED: 'CONTRACT_DECLINED',
  CONTRACT_COMPLETED: 'CONTRACT_COMPLETED',
  CONTRACT_EXPIRED: 'CONTRACT_EXPIRED',
  CONTRACT_CANCELLED: 'CONTRACT_CANCELLED',
  
  // Signer Events
  SIGNER_VIEWED: 'SIGNER_VIEWED',
  SIGNER_SIGNED: 'SIGNER_SIGNED',
  SIGNER_DECLINED: 'SIGNER_DECLINED',
  
  // System Events
  REMINDER_SENT: 'REMINDER_SENT',
  EMAIL_SENT: 'EMAIL_SENT',
} as const;

export type EventType = keyof typeof EVENT_TYPES;

// ==============================================
// File Types
// ==============================================

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ==============================================
// Validation Messages
// ==============================================

export const VALIDATION_MESSAGES = {
  REQUIRED: 'Ce champ est obligatoire',
  EMAIL: 'Veuillez entrer une adresse email valide',
  MIN_LENGTH: (length: number) => `Ce champ doit contenir au moins ${length} caractères`,
  MAX_LENGTH: (length: number) => `Ce champ ne doit pas dépasser ${length} caractères`,
  PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
  INVALID_DATE: 'Date invalide',
  INVALID_FILE_TYPE: 'Type de fichier non autorisé',
  FILE_TOO_LARGE: (size: string) => `Le fichier est trop volumineux (max: ${size})`,
};

// ==============================================
// UI Constants
// ==============================================

export const UI = {
  // Breakpoints
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  
  // Z-index
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    NOTIFICATION: 1080,
  },
  
  // Animation
  TRANSITION: {
    DURATION: 200,
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ==============================================
// Email Templates
// ==============================================

export const EMAIL_TEMPLATES = {
  SIGNATURE_REQUEST: 'SIGNATURE_REQUEST',
  SIGNATURE_COMPLETED: 'SIGNATURE_COMPLETED',
  SIGNATURE_REMINDER: 'SIGNATURE_REMINDER',
  PASSWORD_RESET: 'PASSWORD_RESET',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
} as const;

export type EmailTemplate = keyof typeof EMAIL_TEMPLATES;

// ==============================================
// Default Values
// ==============================================

export const DEFAULTS = {
  PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
  },
  SIGNATURE: {
    WIDTH: 200,
    HEIGHT: 100,
    COLOR: '#000000',
    BACKGROUND: 'transparent',
  },
  EXPIRATION_DAYS: 30,
  REMINDER_DAYS: 3,
};

// ==============================================
// Feature Flags
// ==============================================

export const FEATURE_FLAGS = {
  ENABLE_SIGNUP: process.env.NEXT_PUBLIC_ENABLE_SIGNUP === 'true',
  ENABLE_OAUTH: process.env.NEXT_PUBLIC_ENABLE_OAUTH === 'true',
  ENABLE_EMAIL_SIGNIN: process.env.NEXT_PUBLIC_ENABLE_EMAIL_SIGNIN === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
};

// ==============================================
// Error Messages
// ==============================================

export const ERROR_MESSAGES = {
  // Auth
  UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette page',
  FORBIDDEN: 'Vous n\'êtes pas autorisé à effectuer cette action',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  ACCOUNT_LOCKED: 'Votre compte a été verrouillé. Veuillez réessayer plus tard',
  SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter',
  
  // Validation
  VALIDATION_ERROR: 'Une erreur de validation est survenue',
  INVALID_EMAIL: 'Veuillez entrer une adresse email valide',
  INVALID_PASSWORD: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
  PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
  
  // Files
  FILE_TOO_LARGE: 'Le fichier est trop volumineux',
  INVALID_FILE_TYPE: 'Type de fichier non pris en charge',
  UPLOAD_FAILED: 'Échec du téléchargement du fichier',
  
  // Contracts
  CONTRACT_NOT_FOUND: 'Contrat introuvable',
  CONTRACT_EXPIRED: 'Ce contrat a expiré',
  CONTRACT_CANCELLED: 'Ce contrat a été annulé',
  CONTRACT_ALREADY_SIGNED: 'Ce contrat a déjà été signé',
  SIGNATURE_REQUIRED: 'Une signature est requise',
  
  // Server
  INTERNAL_SERVER_ERROR: 'Une erreur est survenue. Veuillez réessayer plus tard',
  SERVICE_UNAVAILABLE: 'Service temporairement indisponible',
  
  // Network
  NETWORK_ERROR: 'Erreur de connexion. Veuillez vérifier votre connexion internet',
  TIMEOUT_ERROR: 'La requête a expiré. Veuillez réessayer',
  
  // Default
  DEFAULT: 'Une erreur inattendue est survenue',
};

// ==============================================
// Success Messages
// ==============================================

export const SUCCESS_MESSAGES = {
  // Auth
  SIGNED_IN: 'Connexion réussie',
  SIGNED_OUT: 'Déconnexion réussie',
  PASSWORD_RESET_SENT: 'Un email de réinitialisation de mot de passe a été envoyé',
  PASSWORD_UPDATED: 'Votre mot de passe a été mis à jour avec succès',
  
  // Contracts
  CONTRACT_CREATED: 'Le contrat a été créé avec succès',
  CONTRACT_UPDATED: 'Le contrat a été mis à jour avec succès',
  CONTRACT_DELETED: 'Le contrat a été supprimé avec succès',
  CONTRACT_SENT: 'Le contrat a été envoyé aux signataires',
  CONTRACT_SIGNED: 'Le contrat a été signé avec succès',
  CONTRACT_DECLINED: 'Le contrat a été refusé',
  
  // Files
  FILE_UPLOADED: 'Le fichier a été téléchargé avec succès',
  FILE_DELETED: 'Le fichier a été supprimé avec succès',
  
  // Profile
  PROFILE_UPDATED: 'Votre profil a été mis à jour avec succès',
  
  // Default
  DEFAULT: 'Opération effectuée avec succès',
};

// ==============================================
// API Response Status
// ==============================================

export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  FAIL: 'fail',
} as const;

export type ApiStatus = keyof typeof API_STATUS;

// ==============================================
// API Error Codes
// ==============================================

export const API_ERROR_CODES = {
  // Client Errors (4xx)
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  
  // Custom Errors (5xx+)
  VALIDATION_ERROR: 422,
  RATE_LIMIT_EXCEEDED: 429,
  MAINTENANCE_MODE: 503,
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_CODES;
