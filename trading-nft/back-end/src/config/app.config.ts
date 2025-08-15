import { registerAs } from '@nestjs/config';

const config = {
  name: process.env.APP_NAME || 'Meme Server',
  env: process.env.NODE_ENV || 'development',
  prefix: process.env.APP_PREFIX || '/api',
  version: process.env.APP_VERSION || '1.0',
  url: process.env.APP_URL || 'http://localhost:3000',
  port: parseInt(process.env.APP_PORT || '3000', 10),
  swagger: {
    path: process.env.SWAGGER_PATH || '/api/docs',
    title: process.env.SWAGGER_TITLE || 'Meme Server API',
    description: process.env.SWAGGER_DESCRIPTION || 'Meme Server API Documentation',
    version: process.env.SWAGGER_VERSION || '1.0',
    user: process.env.SWAGGER_USER || 'admin',
    password: process.env.SWAGGER_PASSWORD || 'admin',
  },
};

// Validate configuration
if (isNaN(config.port)) {
  throw new Error('Invalid APP_PORT configuration');
}

export default registerAs('app', () => config);
