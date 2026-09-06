/**
 * Normalizes a phone number for display.
 *
 * Handles messy stored values like "+92+923001234567", "++923001234567",
 * "0923001234567" or "03001234567" and always renders a clean
 * single-"+92" Pakistani format: "+92 300 1234567".
 */
export const normalizePhone = (phone: string | null | undefined): string => {
  if (!phone) return '';

  const digits = phone.replace(/[^0-9]/g, '');

  if (digits.length === 0) return phone;

  let local = digits;

  // Strip leading "00" (e.g. "00923001234567")
  if (local.startsWith('00')) {
    local = local.slice(2);
  }

  // Strip leading "92" repeatedly while we still have excess digits.
  // This handles "923001234567" and messy doubles like "+92+923001234567"
  // whose digits come out as "92923001234567".
  while (local.startsWith('92') && local.length > 10) {
    local = local.slice(2);
  }

  // Local number with leading 0 (e.g. "03001234567")
  if (local.startsWith('0') && local.length === 11) {
    local = local.slice(1);
  }

  // Now expect a 10-digit local number like 3001234567
  if (local.length === 10) {
    return `+92 ${local.slice(0, 3)} ${local.slice(3, 7)} ${local.slice(7)}`;
  }

  // Fallback: return the cleaned digits as-is
  return `+${digits}`;
};