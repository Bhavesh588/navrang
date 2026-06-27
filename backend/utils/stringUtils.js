// String utilities

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const truncate = (str, length = 100) => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + '...';
};

const removeWhitespace = (str) => {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
};

const extractNumbers = (str) => {
  if (!str) return [];
  return str.match(/\d+/g) || [];
};

const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};

const isEmail = (str) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
};

module.exports = {
  capitalize,
  capitalizeWords,
  slugify,
  truncate,
  removeWhitespace,
  extractNumbers,
  isEmpty,
  isEmail
};
