// Format date to locale string
const formatDate = (date, locale = 'en-US') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format date with time
const formatDateTime = (date, locale = 'en-US') => {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate days between two dates
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
};

// Check if date is in the past
const isPastDate = (date) => {
  return new Date(date) < new Date();
};

// Check if date is in the future
const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

// Add days to date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Get start of day
const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

// Get end of day
const endOfDay = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

// Check if dates overlap
const datesOverlap = (start1, end1, start2, end2) => {
  return start1 <= end2 && end1 >= start2;
};

module.exports = {
  formatDate,
  formatDateTime,
  calculateDays,
  isPastDate,
  isFutureDate,
  addDays,
  startOfDay,
  endOfDay,
  datesOverlap
};
