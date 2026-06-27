// Number/Math utilities

const formatCurrency = (amount, currency = '₹', decimals = 2) => {
  return `${currency}${amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const formatNumber = (num, decimals = 2) => {
  return parseFloat(num).toFixed(decimals);
};

const roundToDecimal = (num, decimals = 2) => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

const calculateDiscount = (original, discount) => {
  return original - (original * discount / 100);
};

const calculateTax = (amount, taxRate) => {
  return (amount * taxRate / 100).toFixed(2);
};

const sumArray = (arr) => {
  return arr.reduce((sum, val) => sum + parseFloat(val || 0), 0);
};

const averageArray = (arr) => {
  if (arr.length === 0) return 0;
  return (sumArray(arr) / arr.length).toFixed(2);
};

const minValue = (arr) => {
  return Math.min(...arr.map(val => parseFloat(val || 0)));
};

const maxValue = (arr) => {
  return Math.max(...arr.map(val => parseFloat(val || 0)));
};

module.exports = {
  formatCurrency,
  formatNumber,
  roundToDecimal,
  calculatePercentage,
  calculateDiscount,
  calculateTax,
  sumArray,
  averageArray,
  minValue,
  maxValue
};
