/**
 * Generator utility functions
 */

/**
 * Generate unique booking code
 * Format: BK + timestamp + random string
 */
export const generateBookingCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK${timestamp}${random}`;
};

/**
 * Generate random alphanumeric string
 */
export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate reference number
 */
export const generateReferenceNumber = (prefix: string = 'REF'): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Generate transaction ID
 */
export const generateTransactionId = (): string => {
  return `TXN-${Date.now()}-${generateRandomString(6)}`;
};

/**
 * Generate confirmation code (6 digits)
 */
export const generateConfirmationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate slug from text
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Generate UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generate seat layout for a bus
 */
export const generateSeatLayout = (totalSeats: number): number[] => {
  return Array.from({ length: totalSeats }, (_, i) => i + 1);
};

/**
 * Generate time slots for a day
 */
export const generateTimeSlots = (
  startHour: number = 6,
  endHour: number = 20,
  interval: number = 60
): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const timeString = `${String(hour).padStart(2, '0')}:${String(
        minute
      ).padStart(2, '0')}:00`;
      slots.push(timeString);
    }
  }
  return slots;
};