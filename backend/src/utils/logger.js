 // src/utils/logger.js
const isProd = process.env.NODE_ENV === 'production';

function log(level, ...args) {
  const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}]`;
  if (level === 'error' || level === 'warn') {
    console[level === 'error' ? 'error' : 'warn'](prefix, ...args);
  } else {
    console.log(prefix, ...args);
  }
}

module.exports = {
  info: (...args) => log('info', ...args),
  warn: (...args) => log('warn', ...args),
  error: (...args) => log('error', ...args),
  debug: (...args) => { if (!isProd) log('debug', ...args); }
};
