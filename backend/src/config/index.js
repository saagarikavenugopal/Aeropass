require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/airport_platform',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB || 10),
  providers: {
    ocr: process.env.OCR_PROVIDER || 'stub',
    aiVerification: process.env.AI_VERIFICATION_PROVIDER || 'stub',
    payment: process.env.PAYMENT_PROVIDER || 'stub',
    notifications: process.env.NOTIFICATIONS_PROVIDER || 'stub',
  },
  baggage: {
    freeAllowanceKg: Number(process.env.BAGGAGE_FREE_ALLOWANCE_KG || 20),
    excessRatePerKg: Number(process.env.BAGGAGE_EXCESS_RATE_PER_KG || 8),
  },
};
