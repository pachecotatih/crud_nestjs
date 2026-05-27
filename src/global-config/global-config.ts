import { registerAs } from '@nestjs/config';

export default registerAs('globalConfig', () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  environment: process.env.NODE_ENV || 'development',
}));
