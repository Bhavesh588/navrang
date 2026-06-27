// Data validation utilities

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validatePhoneNumber = (phone) => {
  // Accept various phone formats
  const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const validatePositiveNumber = (num) => {
  return Number.isFinite(num) && num > 0;
};

const validateNonNegativeNumber = (num) => {
  return Number.isFinite(num) && num >= 0;
};

const validateDateRange = (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end && !isNaN(start) && !isNaN(end);
  } catch (error) {
    return false;
  }
};

const validateRequiredFields = (data, fields) => {
  const missing = [];
  fields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  });
  return missing;
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateUrl,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateDateRange,
  validateRequiredFields
};
