export const config = {
  // Application
  app: {
    name: 'SignaturePro',
    url: process.env.APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  },

  // Authentication
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000',
  },

  // Database
  db: {
    url: process.env.DATABASE_URL!,
  },

  // Storage (MinIO/S3)
  storage: {
    endpoint: process.env.S3_ENDPOINT!,
    port: parseInt(process.env.S3_PORT || '9000', 10),
    useSSL: process.env.S3_USE_SSL === 'true',
    accessKey: process.env.S3_ACCESS_KEY!,
    secretKey: process.env.S3_SECRET_KEY!,
    bucket: process.env.S3_BUCKET || 'signatures',
    region: process.env.S3_REGION || 'us-east-1',
  },

  // Email
  email: {
    server: process.env.EMAIL_SERVER!,
    from: process.env.EMAIL_FROM || 'noreply@example.com',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: '7d', // Token expiration
  },

  // Contract
  contract: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    expiresInDays: 30, // Default expiration time for contracts
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'S3_ENDPOINT',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
  'JWT_SECRET',
  'EMAIL_SERVER',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
  console.error('Missing required environment variables:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  process.exit(1);
}

export default config;
