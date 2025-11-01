enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

const formatLogMessage = (level: LogLevel, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

export const logInfo = (message: string): void => {
  console.log('\x1b[36m%s\x1b[0m', formatLogMessage(LogLevel.INFO, message));
};

export const logWarn = (message: string): void => {
  console.warn('\x1b[33m%s\x1b[0m', formatLogMessage(LogLevel.WARN, message));
};

export const logError = (message: string, error?: any): void => {
  console.error('\x1b[31m%s\x1b[0m', formatLogMessage(LogLevel.ERROR, message));
  if (error) {
    console.error('Error:', error.message || error);
    if (process.env.NODE_ENV === 'development' && error.stack) {
      console.error('Stack:', error.stack);
    }
  }
};

export const logSuccess = (message: string): void => {
  console.log('\x1b[32m%s\x1b[0m', formatLogMessage(LogLevel.SUCCESS, message));
};

export const logAuth = (event: string, userId?: number, success: boolean = true): void => {
  const message = `Auth event: ${event}${userId ? ` (User: ${userId})` : ''}`;
  if (success) {
    logSuccess(message);
  } else {
    logWarn(message);
  }
};