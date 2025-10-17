/**
 * Format a date to a specific format
 * @param {Date|string} date - The date to format
 * @param {string} format - The format string (DD, MMM, YYYY, etc.)
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'DD/MM/YYYY') {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (!(d instanceof Date) || isNaN(d)) {
    return 'Invalid Date';
  }

  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthNamesShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return format
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('D', day.toString())
    .replace('MMMM', monthNames[month])
    .replace('MMM', monthNamesShort[month])
    .replace('MM', (month + 1).toString().padStart(2, '0'))
    .replace('M', (month + 1).toString())
    .replace('YYYY', year.toString())
    .replace('YY', year.toString().slice(-2));
}

/**
 * Format a time from a date object
 * @param {Date|string} date - The date to extract time from
 * @param {boolean} use24Hour - Whether to use 24-hour format
 * @returns {string} Formatted time string
 */
export function formatTime(date, use24Hour = true) {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (!(d instanceof Date) || isNaN(d)) {
    return 'Invalid Time';
  }

  const hours = d.getHours();
  const minutes = d.getMinutes();

  if (use24Hour) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } else {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}

/**
 * Get the number of days until a future date
 * @param {Date|string} date - The future date
 * @returns {number} Number of days until the date
 */
export function getDaysUntil(date) {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (!(d instanceof Date) || isNaN(d)) {
    return null;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  const diffTime = d - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Format a date range
 * @param {Date|string} startDate - The start date
 * @param {Date|string} endDate - The end date
 * @returns {string} Formatted date range
 */
export function formatDateRange(startDate, endDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : null;

  if (!(start instanceof Date) || isNaN(start)) {
    return 'Invalid Date Range';
  }

  if (!end) {
    return formatDate(start, 'D MMM YYYY');
  }

  const startDay = start.getDate();
  const startMonth = start.getMonth();
  const startYear = start.getFullYear();

  const endDay = end.getDate();
  const endMonth = end.getMonth();
  const endYear = end.getFullYear();

  // Same day
  if (startDay === endDay && startMonth === endMonth && startYear === endYear) {
    return formatDate(start, 'D MMM YYYY');
  }

  // Same month and year
  if (startMonth === endMonth && startYear === endYear) {
    return `${startDay} - ${endDay} ${formatDate(start, 'MMM YYYY')}`;
  }

  // Same year
  if (startYear === endYear) {
    return `${formatDate(start, 'D MMM')} - ${formatDate(end, 'D MMM YYYY')}`;
  }

  // Different years
  return `${formatDate(start, 'D MMM YYYY')} - ${formatDate(end, 'D MMM YYYY')}`;
}

/**
 * Get a relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string} date - The date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (!(d instanceof Date) || isNaN(d)) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffMs = d - now;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`;
  } else if (diffDays === 0) {
    if (diffHours > 0) {
      return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMins > 0) {
      return `In ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else {
      return 'Now';
    }
  } else if (diffDays === -1) {
    return 'Yesterday';
  } else {
    return `${Math.abs(diffDays)} days ago`;
  }
}
