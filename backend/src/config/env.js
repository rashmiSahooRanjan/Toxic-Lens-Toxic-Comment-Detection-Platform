import 'dotenv/config';
export const env={
 port:Number(process.env.PORT||5000),
 mongo:process.env.MONGODB_URI||'mongodb+srv://23cse658subhrajitdas_db_user:6YDxEpG8yPladxNb@cluster0.olujmpa.mongodb.net/toxiccomment',
 jwtSecret:process.env.JWT_SECRET||'dev-only-change-me',
 mlUrl:process.env.ML_SERVICE_URL||'http://127.0.0.1:8000',
 clientUrl:process.env.CLIENT_URL||'http://localhost:5173'
};
