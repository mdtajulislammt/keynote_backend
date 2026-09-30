import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/database';

let server: http.Server;

const startServer = async () => {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Start HTTP server listener
    server = app.listen(env.PORT, () => {
      console.log(`🚀 Production server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`📡 Health check available at http://localhost:${env.PORT}/health`);
      console.log(`📚 API base URL: http://localhost:${env.PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to start application server:', error);
    process.exit(1);
  }
};

// ==========================================
// GRACEFUL SHUTDOWN & PROCESS MANAGEMENT
// ==========================================
const handleShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('🔒 HTTP server closed');
      await disconnectDB();
      console.log('👋 Process terminated gracefully');
      process.exit(0);
    });

    // Force shutdown if cleanup takes too long
    setTimeout(() => {
      console.error('⚠️ Graceful shutdown timed out. Forcing termination.');
      process.exit(1);
    }, 10000);
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

process.on('unhandledRejection', (reason: unknown) => {
  console.error('💥 Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Launch server
void startServer();
