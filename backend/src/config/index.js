require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM,
  },
  workhub: {
    baseUrl: process.env.WORKHUB_BASE_URL || 'https://app.workhub24.com',
    tenantId: process.env.WORKHUB_TENANT_ID,
    workflowId: process.env.WORKHUB_WORKFLOW_ID,
    username: process.env.WORKHUB_API_USERNAME,
    password: process.env.WORKHUB_API_PASSWORD,
    clientId: process.env.WORKHUB_CLIENT_ID,
    clientSecret: process.env.WORKHUB_CLIENT_SECRET,
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10'),
  },
};
