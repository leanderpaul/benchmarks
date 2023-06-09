/**
 * Importing npm packages.
 */

/**
 * Importing user defined packages.
 */

/**
 * Declaring the constants.
 */
const isDebug = process.env.DEBUG === 'true';

class Logger {
  log(...args) {
    console.log(...args);
  }

  error(...args) {
    console.error(...args);
  }

  table(...args) {
    console.table(...args);
  }

  debug(...args) {
    if (isDebug) {
      console.log(...args);
    }
  }
}

export const logger = new Logger();
