import mongoose from 'mongoose';
import { config } from '@config/configs';

export const connectDB = async () => {
  const uri = config.mongoUri;
  if (!uri) {
    throw new Error('MONGODB_URI not set in environment variables');
  }
  try {
    await mongoose.connect(uri, {});
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}; 