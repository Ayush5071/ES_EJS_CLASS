import mongoose from 'mongoose';

export async function connectDB(uri = 'mongodb://127.0.0.1:27017/classDB') {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}
