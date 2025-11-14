/**
 * Formatter utility functions
 */

/**
 * Format currency (Rwandan Francs)
 */
export const formatCurrency = (amount: number): string => {
  return `RWF ${amount.toLocaleString('en-RW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format phone number for display
 * Input: +250788123456
 * Output: +250 788 123 456
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  return phone;
};

/**
 * Format time (HH:MM:SS to HH:MM)
 */
export const formatTime = (time: string): string => {
  if (!time) return '';
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
};

/**
 * Format duration (minutes to hours and minutes)
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} minutes`;
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
};

/**
 * Format distance (km)
 */
export const formatDistance = (km: number): string => {
  return `${km.toFixed(1)} km`;
};

/**
 * Format date for display (DD/MM/YYYY)
 */
export const formatDateDisplay = (date: Date | string): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format datetime for display
 */
export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return `${formatDateDisplay(d)} ${formatTime(
    d.toTimeString().slice(0, 8)
  )}`;
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format seat number with prefix
 */
export const formatSeatNumber = (seatNumber: number): string => {
  return `Seat ${String(seatNumber).padStart(2, '0')}`;
};

/**
 * Format bus plate number
 */
export const formatPlateNumber = (plate: string): string => {
  return plate.toUpperCase().replace(/\s+/g, ' ').trim();
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format booking status for display
 */
export const formatBookingStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
  };
  return statusMap[status] || status;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};