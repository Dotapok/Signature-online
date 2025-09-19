import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isAfter, isBefore, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

type FileWithPreview = File & {
  preview?: string;
};

// ==============================================
// Tailwind CSS Utilities
// ==============================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const variantProps = (variant: string, color: string) => {
  const variants: Record<string, Record<string, string>> = {
    solid: {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    },
  };

  return variants[variant]?.[color] || variants.solid.primary;
};

// ==============================================
// Date and Time Utilities
// ==============================================

export const formatDate = (date: Date | string, formatStr: string = 'PPP'): string => {
  if (!date) return '';
  return format(new Date(date), formatStr, { locale: fr });
};

export const formatDateTime = (date: Date | string): string => {
  if (!date) return '';
  return format(new Date(date), 'PPPp', { locale: fr });
};

export const timeAgo = (date: Date | string): string => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
};

export const isPastDue = (date: Date | string): boolean => {
  if (!date) return false;
  return isBefore(new Date(date), new Date()) && !isToday(new Date(date));
};

export const isDueSoon = (date: Date | string, days: number = 1): boolean => {
  if (!date) return false;
  const dueDate = new Date(date);
  const today = new Date();
  const soon = new Date();
  soon.setDate(today.getDate() + days);
  return isAfter(dueDate, today) && isBefore(dueDate, soon);
};

// ==============================================
// String Utilities
// ==============================================

export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (!str || str.length <= length) return str;
  return `${str.substring(0, length)}${suffix}`;
};

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// ==============================================
// Array Utilities
// ==============================================

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const unique = <T>(array: T[], key?: string): T[] => {
  if (!array) return [];
  if (key) {
    const seen = new Set();
    return array.filter((item) => {
      const value = item[key as keyof typeof item];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  return [...new Set(array)];
};

export const sortBy = <T>(
  array: T[],
  key: string,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  if (!array) return [];
  return [...array].sort((a, b) => {
    const aValue = a[key as keyof typeof a];
    const bValue = b[key as keyof typeof b];

    if (aValue === bValue) return 0;

    const sortValue = aValue > bValue ? 1 : -1;
    return direction === 'asc' ? sortValue : -sortValue;
  });
};

// ==============================================
// Object Utilities
// ==============================================

export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const deepClone = <T>(obj: T): T => {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
};

// ==============================================
// Form Utilities
// ==============================================

export const getFormData = (form: HTMLFormElement): Record<string, any> => {
  const formData = new FormData(form);
  const data: Record<string, any> = {};
  
  for (const [key, value] of formData.entries()) {
    // Handle multi-select and checkboxes
    if (key in data) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }
  
  return data;
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  return { valid: true };
};

// ==============================================
// Error Handling
// ==============================================

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Une erreur inconnue est survenue';
};

export const handleApiError = (error: unknown): { message: string; status: number } => {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return {
      message: error.message || 'Une erreur est survenue lors de la communication avec le serveur',
      status: 500,
    };
  }
  
  if (typeof error === 'string') {
    return { message: error, status: 500 };
  }
  
  return {
    message: 'Une erreur inconnue est survenue',
    status: 500,
  };
};

// ==============================================
// Promise Utilities
// ==============================================

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

// ==============================================
// Local Storage Utilities
// ==============================================

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

// ==============================================
// Number Utilities
// ==============================================

export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPercent = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

// ==============================================
// URL Utilities
// ==============================================

export const getQueryParam = (key: string, url: string = window.location.href): string | null => {
  const param = new URLSearchParams(new URL(url).search);
  return param.get(key);
};

export const setQueryParam = (key: string, value: string, url: string = window.location.href): string => {
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);
  
  if (value === null || value === '') {
    params.delete(key);
  } else {
    params.set(key, value);
  }
  
  urlObj.search = params.toString();
  return urlObj.toString();
};

// ==============================================
// File Utilities
// ==============================================

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const downloadFile = (data: Blob | string, filename: string): void => {
  const url = typeof data === 'string' ? data : URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ==============================================
// Color Utilities
// ==============================================

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const getContrastColor = (hexColor: string): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  // Calculate luminance using the WCAG formula
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// ==============================================
// Event Utilities
// ==============================================

export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number = 300
): ((...args: Parameters<F>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return function (this: any, ...args: Parameters<F>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  limit: number = 300
): ((...args: Parameters<F>) => void) => {
  let inThrottle: boolean;
  
  return function (this: any, ...args: Parameters<F>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ==============================================
// Formatting Utilities
// ==============================================

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  // Check if the phone number is valid
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
  }
  
  return phoneNumber;
};

// ==============================================
// Validation Utilities
// ==============================================

export const isRequired = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  return true;
};

export const isEmail = (value: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value);
};

export const isUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch (e) {
    return false;
  }
};

// ==============================================
// UUID and ID Generation
// ==============================================

export const generateId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

export const generateUuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
