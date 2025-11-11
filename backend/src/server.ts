import app from './app';
import { config } from './config/app';
import sequelize, { testConnection } from './config/database';

const PORT = config.port;

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🌐 API URL: ${config.app.url}`);
      console.log(`💡 Health check: ${config.app.url}/health`);
      console.log(`📚 API Docs: ${config.app.url}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  await sequelize.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

startServer();