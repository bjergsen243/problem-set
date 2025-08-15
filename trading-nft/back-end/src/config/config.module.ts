import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import appConfig from './app.config';

const logger = new Logger('ConfigModule');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => {
          const config = appConfig();
          logger.log('Loaded app config:', JSON.stringify(config, null, 2));
          return { app: config };
        },
        databaseConfig
      ],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {} 