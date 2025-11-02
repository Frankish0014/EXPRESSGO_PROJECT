import app from './app';
import { config } from './config/app';
import { testConnection } from './config/database';
import { logInfo, logSuccess, logError } from './utils/loggerUtils';

const PORT = config.port;

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      logSuccess(`🚀 Server started successfully`);
      logInfo(`📍 Port: ${PORT}`);
      logInfo(`🌍 Environment: ${config.nodeEnv}`);
      logInfo(`💡 Health check: ${config.app.url}/health`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    logError('❌ Failed to start server', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logInfo('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logInfo('👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});

startServer();