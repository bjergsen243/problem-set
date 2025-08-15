import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/all-exception.filter';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import * as fs from 'fs';
import * as httpContext from 'express-http-context';
import { useContainer } from 'class-validator';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
          }),
        ),
      }),
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });

  const configService = app.get(ConfigService);

  // Global filters and pipes
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Security
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // API versioning and prefix
  app.setGlobalPrefix(configService.get('app.prefix'));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get('app.version'),
  });

  // Setup validator container
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Setup Swagger
  await setupSwagger(app);

  // Start the server
  const port = configService.get('app.port');
  const appConfig = configService.get('app');

  const serverPort = appConfig?.port || 3000;
  const swaggerPath = appConfig?.swagger?.path || '/api/docs';

  await app.listen(serverPort, () => {
    logger.log(`Application is running on: http://localhost:${serverPort}`);
    logger.log(
      `Swagger documentation: http://localhost:${serverPort}${swaggerPath}`,
    );
  });
}

async function setupSwagger(app: INestApplication) {
  const configService = app.get(ConfigService);
  const swaggerConfig = configService.get('app.swagger') || {
    path: '/api/docs',
    title: 'API Documentation',
    description: 'API Documentation',
    version: '1.0',
    user: 'admin',
    password: 'admin',
  };

  // Setup basic auth for Swagger
  if (swaggerConfig.user && swaggerConfig.password) {
    app.use(
      [swaggerConfig.path],
      basicAuth({
        challenge: true,
        users: {
          [swaggerConfig.user]: swaggerConfig.password,
        },
      }),
    );
  }

  const options = new DocumentBuilder()
    .setTitle(configService.get('app.name') || 'API Documentation')
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  // Save Swagger JSON file
  try {
    const outputDir = './docs';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    fs.writeFileSync(
      `${outputDir}/swagger-spec.json`,
      JSON.stringify(document, null, 2),
    );
  } catch (error) {
    console.warn('Could not write swagger file:', error);
  }

  SwaggerModule.setup(swaggerConfig.path, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: configService.get('app.name') || 'API Documentation',
  });
}

bootstrap();
