const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const formatLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logObject = {
    timestamp,
    level,
    message,
    ...meta
  };
  return JSON.stringify(logObject);
};

const writeToFile = (logEntry) => {
  try {
    fs.appendFileSync(logFile, logEntry + '\n');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
};

const logger = {
  info: (message, meta = {}) => {
    const logEntry = formatLog('INFO', message, meta);
    console.log(`${colors.green}[INFO]${colors.reset} ${message}`, meta);
    writeToFile(logEntry);
  },

  error: (message, meta = {}) => {
    const logEntry = formatLog('ERROR', message, meta);
    console.error(`${colors.red}[ERROR]${colors.reset} ${message}`, meta);
    writeToFile(logEntry);
  },

  warn: (message, meta = {}) => {
    const logEntry = formatLog('WARN', message, meta);
    console.warn(`${colors.yellow}[WARN]${colors.reset} ${message}`, meta);
    writeToFile(logEntry);
  },

  debug: (message, meta = {}) => {
    if (process.env.DEBUG === 'true') {
      const logEntry = formatLog('DEBUG', message, meta);
      console.log(`${colors.cyan}[DEBUG]${colors.reset} ${message}`, meta);
      writeToFile(logEntry);
    }
  },

  http: (message, meta = {}) => {
    const logEntry = formatLog('HTTP', message, meta);
    console.log(`${colors.blue}[HTTP]${colors.reset} ${message}`, meta);
    writeToFile(logEntry);
  }
};

module.exports = logger;
