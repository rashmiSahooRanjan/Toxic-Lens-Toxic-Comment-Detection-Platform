import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 5000),
  mongo: process.env.MONGODB_URI || 'mongodb+srv://sahooranjanrashmi009_db_user:CygqP9Yq35NHZgOu@cluster0.4clokic.mongodb.net/toxiccomment',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  mlUrl: (process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, ''),
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '')
};
