// utils/formatters.ts

import { 
  LOCALE_DEFAULT, 
  CURRENCY_DEFAULT, 
  DATE_FORMAT_OPTIONS,
  TEXT_TRUNCATE_LENGTH 
} from './constants';

/**
 * Format date string to localized date
 * @param date - ISO date string or null
 * @param locale - Locale for formatting (default: 'en-US')
 * @param options - Intl.DateTimeFormat options (default: DATE_FORMAT_OPTIONS.DISPLAY)
 * @param fallback - Fallback string when date is null/invalid (default: '—')
 * @returns Formatted date string or fallback
 * 
 * @example
 * formatDate('2024-01-15') // 'Jan 15, 2024'
 * formatDate(null) // '—'
 * formatDate('2024-01-15', 'en-US', DATE_FORMAT_OPTIONS.FULL) // 'January 15, 2024'
 */
export function formatDate(
  date: string | null | undefined,
  locale: string = LOCALE_DEFAULT,
  options: Intl.DateTimeFormatOptions = DATE_FORMAT_OPTIONS.DISPLAY,
  fallback: string = '—'
): string {
  if (!date) return fallback;
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return fallback;
    
    return d.toLocaleDateString(locale, options);
  } catch {
    return fallback;
  }
}

/**
 * Format number as currency
 * @param amount - String or number amount
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * @param fallback - Fallback string when amount is invalid (default: '$0.00')
 * @returns Formatted currency string or fallback
 * 
 * @example
 * formatCurrency('1234.56') // '$1,234.56'
 * formatCurrency(1234.56) // '$1,234.56'
 * formatCurrency('') // '$0.00'
 * formatCurrency('1234.56', 'EUR', 'de-DE') // '1.234,56 €'
 */
export function formatCurrency(
  amount: string | number | null | undefined,
  currency: string = CURRENCY_DEFAULT,
  locale: string = LOCALE_DEFAULT,
  fallback: string = '$0.00'
): string {
  if (amount === undefined || amount === null || amount === '') {
    return fallback;
  }
  
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return fallback;
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(num);
  } catch {
    return fallback;
  }
}

/**
 * Format quantity with proper decimal places
 * @param quantity - String or number quantity
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - Locale for formatting (default: 'en-US')
 * @param fallback - Fallback string when quantity is invalid (default: '—')
 * @returns Formatted quantity string or fallback
 * 
 * @example
 * formatQuantity('10') // '10'
 * formatQuantity('10.5') // '10.5'
 * formatQuantity('10.567', 2) // '10.57'
 * formatQuantity('10.1', 0) // '10'
 */
export function formatQuantity(
  quantity: string | number | null | undefined,
  decimals: number = 2,
  locale: string = LOCALE_DEFAULT,
  fallback: string = '—'
): string {
  if (!quantity && quantity !== 0) return fallback;
  
  try {
    const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    if (isNaN(num)) return fallback;
    
    return num.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  } catch {
    return fallback;
  }
}

/**
 * Truncate long text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: TEXT_TRUNCATE_LENGTH.DEFAULT = 40)
 * @param ellipsis - Ellipsis string (default: '...')
 * @returns Truncated text
 * 
 * @example
 * truncateText('This is a very long text', 10) // 'This is a ...'
 * truncateText('Short', 10) // 'Short'
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number = TEXT_TRUNCATE_LENGTH.DEFAULT,
  ellipsis: string = '...'
): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + ellipsis;
}

/**
 * Format number as percentage
 * @param value - Number between 0 and 1 (e.g., 0.25 for 25%)
 * @param decimals - Number of decimal places (default: 0)
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted percentage string
 * 
 * @example
 * formatPercentage(0.25) // '25%'
 * formatPercentage(0.256, 1) // '25.6%'
 * formatPercentage(1.5) // '150%'
 */
export function formatPercentage(
  value: number,
  decimals: number = 0,
  locale: string = LOCALE_DEFAULT
): string {
  return (value * 100).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + '%';
}

/**
 * Format ISO date to DD.MM.YYYY, HH:MM:SS
 * @param date - ISO date string
 * @param fallback - Fallback string when date is invalid
 * @returns Formatted date-time string
 * 
 * @example
 * formatHealthDateTime('2026-02-13T10:08:39.000Z') // '13.02.2026, 12:08:39'
 */
export function formatHealthDateTime(
  date: string | null | undefined,
  fallback: string = '—'
): string {
  if (!date) return fallback;

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return fallback;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
  } catch {
    return fallback;
  }
}

/**
 * Format response time in ms to human-readable string
 * @param ms - Response time in milliseconds
 * @returns Formatted string like "651ms" or "2.6s"
 * 
 * @example
 * formatResponseTime(651)    // '651ms'
 * formatResponseTime(2587)   // '2.6s'
 * formatResponseTime(102414) // '102.4s'
 */
export function formatResponseTime(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Format phone number (US format)
 * @param phone - Phone number string
 * @returns Formatted phone number or original if invalid
 * 
 * @example
 * formatPhone('1234567890') // '(123) 456-7890'
 * formatPhone('123-456-7890') // '(123) 456-7890'
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Return original if not valid
  return phone;
}
