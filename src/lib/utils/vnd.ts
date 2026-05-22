/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a number as Vietnamese Dong (VND) with vi-VN locale.
 * @param amount - The numeric amount in VND.
 * @param compact - If true, outputs compact forms like "50M ₫" or "1.5T ₫".
 */
export function formatVND(amount: number, compact = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 ₫';
  }

  if (compact) {
    if (amount >= 1e9) {
      return `${(amount / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}B ₫`;
    }
    if (amount >= 1e6) {
      return `${(amount / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M ₫`;
    }
    if (amount >= 1e3) {
      return `${(amount / 1e3).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}K ₫`;
    }
  }

  return `${amount.toLocaleString('vi-VN')} ₫`;
}

/**
 * Parses a string input representation of VND, handling shortcuts.
 * Shortcuts:
 * - 50m / 50tr / 50tr triệu -> 50.000.000
 * - 1.5t / 1.5ty / 1.5 tỷ -> 1.500.000.000
 * - 50k -> 50.000
 */
export function parseVND(input: string): number {
  if (!input) return 0;
  
  // Clean input string, remove spaces, non-numeric characters except for dots, commas, decimals
  const cleanInput = input.toLowerCase().trim().replace(/\s+/g, '');
  
  // Regex to extract number part and suffix
  const match = cleanInput.match(/^([\d.,]+)(k|m|tr|t|ty)?/);
  if (!match) return 0;

  const numPartStr = match[1].replace(/,/g, '.'); // Normalize decimals if any, though in VN they use dot/comma swapping.
  // Standard float parsing in JS expects dot as decimal separator. Let's do a reliable swap:
  // If there are multiple dots, it's thousands separator (e.g., 50.000.000)
  // Let's remove thousands separator dots first, but keep the last dot/comma if it is a decimal.
  let cleanNumStr = numPartStr;
  
  // Check if there is a common separator format
  if (cleanNumStr.includes('.') && cleanNumStr.includes(',')) {
    // Standard European/VN: thousands is '.', decimal is ','
    cleanNumStr = cleanNumStr.replace(/\./g, '').replace(/,/g, '.');
  } else if (cleanNumStr.includes(',')) {
    // If only commas exist, check if it's thousands or decimal
    // If it has a comma with 3 digits following it, let's treat it as a thousands separator if it's e.g. 50,000
    const parts = cleanNumStr.split(',');
    if (parts.length === 2 && parts[1].length !== 3) {
      // e.g. 1,5 -> 1.5
      cleanNumStr = cleanNumStr.replace(/,/g, '.');
    } else {
      // treat as thousands separator
      cleanNumStr = cleanNumStr.replace(/,/g, '');
    }
  } else {
    // If multiple dots, e.g. 50.000.000, remove them all
    const dotsCount = (cleanNumStr.match(/\./g) || []).length;
    if (dotsCount > 1) {
      cleanNumStr = cleanNumStr.replace(/\./g, '');
    }
  }

  const value = parseFloat(cleanNumStr);
  if (isNaN(value)) return 0;

  const suffix = match[2];
  if (!suffix) return value;

  switch (suffix) {
    case 'k':
      return value * 1e3;
    case 'm':
    case 'tr':
      return value * 1e6;
    case 't':
    case 'ty':
      return value * 1e9;
    default:
      return value;
  }
}
