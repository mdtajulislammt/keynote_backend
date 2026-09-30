import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (uri: string = env.MONGODB_URI): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true, // Automatically build explicit indexes in schemas
    });
    console.log(`✅ MongoDB connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected successfully');
  }
};
