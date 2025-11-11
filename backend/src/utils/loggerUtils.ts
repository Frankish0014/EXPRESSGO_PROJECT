/**
 * Logger utility functions
 */

enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
  SUCCESS = 'SUCCESS',
}

interface LogOptions {
  context?: string;
  userId?: number;
  requestId?: string;
  metadata?: Record<string, any>;
}

/**
 * Format log message with timestamp and level
 */
const formatLogMessage = (
  level: LogLevel,
  message: string,
  options?: LogOptions
): string => {
  const timestamp = new Date().toISOString();
  const parts = [
    `[${timestamp}]`,
    `[${level}]`,
    options?.context ? `[${options.context}]` : '',
    options?.userId ? `[User:${options.userId}]` : '',
    options?.requestId ? `[Req:${options.requestId}]` : '',
    message,
  ];

  return parts.filter(Boolean).join(' ');
};

/**
 * Log info message
 */
export const logInfo = (message: string, options?: LogOptions): void => {
  const formattedMessage = formatLogMessage(LogLevel.INFO, message, options);
  console.log('\x1b[36m%s\x1b[0m', formattedMessage); // Cyan

  if (options?.metadata) {
    console.log('Metadata:', JSON.stringify(options.metadata, null, 2));
  }
};

/**
 * Log warning message
 */
export const logWarn = (message: string, options?: LogOptions): void => {
  const formattedMessage = formatLogMessage(LogLevel.WARN, message, options);
  console.warn('\x1b[33m%s\x1b[0m', formattedMessage); // Yellow

  if (options?.metadata) {
    console.warn('Metadata:', JSON.stringify(options.metadata, null, 2));
  }
};

/**
 * Log error message
 */
export const logError = (
  message: string,
  error?: any,
  options?: LogOptions
): void => {
  const formattedMessage = formatLogMessage(LogLevel.ERROR, message, options);
  console.error('\x1b[31m%s\x1b[0m', formattedMessage); // Red

  if (error) {
    console.error('Error:', error.message || error);
    if (process.env.NODE_ENV === 'development' && error.stack) {
      console.error('Stack:', error.stack);
    }
  }

  if (options?.metadata) {
    console.error('Metadata:', JSON.stringify(options.metadata, null, 2));
  }
};

/**
 * Log debug message (only in development)
 */
export const logDebug = (message: string, options?: LogOptions): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const formattedMessage = formatLogMessage(LogLevel.DEBUG, message, options);
  console.debug('\x1b[35m%s\x1b[0m', formattedMessage); // Magenta

  if (options?.metadata) {
    console.debug('Metadata:', JSON.stringify(options.metadata, null, 2));
  }
};

/**
 * Log success message
 */
export const logSuccess = (message: string, options?: LogOptions): void => {
  const formattedMessage = formatLogMessage(LogLevel.SUCCESS, message, options);
  console.log('\x1b[32m%s\x1b[0m', formattedMessage); // Green

  if (options?.metadata) {
    console.log('Metadata:', JSON.stringify(options.metadata, null, 2));
  }
};

/**
 * Log HTTP request
 */
export const logRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  userId?: number
): void => {
  const message = `${method} ${url} ${statusCode} - ${duration}ms`;
  const color = statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
  console.log(`${color}%s\x1b[0m`, formatLogMessage(LogLevel.INFO, message, { userId }));
};

/**
 * Log database query
 */
export const logQuery = (query: string, duration?: number): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const message = duration ? `Query executed in ${duration}ms` : 'Query executed';
  logDebug(message, { metadata: { query } });
};

/**
 * Log authentication event
 */
export const logAuth = (event: string, userId?: number, success: boolean = true): void => {
  const message = `Auth event: ${event}`;
  if (success) {
    logSuccess(message, { userId });
  } else {
    logWarn(message, { userId });
  }
};

/**
 * Log booking event
 */
export const logBooking = (
  event: string,
  bookingCode: string,
  userId: number
): void => {
  logInfo(`Booking event: ${event}`, {
    context: 'BOOKING',
    userId,
    metadata: { bookingCode },
  });
};

/**
 * Create request logger middleware
 */
export const createRequestLogger = () => {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    // Store requestId for use in other logs
    req.requestId = requestId;

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logRequest(
        req.method,
        req.originalUrl,
        res.statusCode,
        duration,
        req.user?.id
      );
    });

    next();
  };
};

/**
 * Log system startup
 */
export const logStartup = (port: number, env: string): void => {
  console.log('\n' + '='.repeat(60));
  logSuccess(`🚀 Server started successfully`);
  logInfo(`📍 Port: ${port}`);
  logInfo(`🌍 Environment: ${env}`);
  logInfo(`📚 API Docs: http://localhost:${port}/api-docs`);
  console.log('='.repeat(60) + '\n');
};

/**
 * Log database connection
 */
export const logDatabaseConnection = (status: 'success' | 'error', message?: string): void => {
  if (status === 'success') {
    logSuccess('✅ Database connected successfully');
  } else {
    logError('❌ Database connection failed', message);
  }
};