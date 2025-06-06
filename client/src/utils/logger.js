import { isDevelopment } from '../config/environment';

class Logger {
  static info(message, ...args) {
    if (isDevelopment) {
      console.log(message, ...args);
    }
    // In production, you would send this to your logging service
  }

  static error(message, ...args) {
    if (isDevelopment) {
      console.error(message, ...args);
    }
    // In production, you would send this to your error tracking service
  }

  static warn(message, ...args) {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
    // In production, you would send this to your logging service
  }

  static debug(message, ...args) {
    if (isDevelopment) {
      console.debug(message, ...args);
    }
  }
}

export default Logger; 