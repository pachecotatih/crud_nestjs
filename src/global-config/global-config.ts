import { registerAs } from '@nestjs/config';

export default registerAs('globalConfig', () => ({
  database: {
    url: process.env.DATABASE_URL,
    autoLoadEntities: process.env.DATABASE_AUTOLOADENTITIES,
    synchronize: process.env.DATABASE_SYNCHRONIZE,
    ssl: process.env.SSL,
  },
  environment: process.env.NODE_ENV || 'development',
}));
