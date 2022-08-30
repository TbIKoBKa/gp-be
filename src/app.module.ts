import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { Logger, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { HealthModule } from './modules/health/health.module';
import { AuthMeModule } from './modules/authme/auth.module';

import { AppController } from './app.controller';
import { TypeOrmConfigService } from './config';
import { HttpExceptionFilter } from './utils';

@Module({
  providers: [
    Logger,
    {
      provide:  APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide:  APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide:  APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV as string}`,
    }),
    WinstonModule.forRootAsync({
      imports:    [ ConfigModule ],
      useFactory: () => {
        return {
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.simple(),
                winston.format.timestamp({ format: 'DD.MM.YYYY, HH:mm:ss' }),
                winston.format.ms(),
                winston.format.printf((debug) => {
                  const { timestamp, level, message, context, ms } = debug;

                  return `[Nest] ${timestamp as string}\t${level.toUpperCase()} [${context as string}] ${
                    message as string
                  } ${ms as string}`;
                }),
                winston.format.colorize({
                  all: true,
                }),
              ),
            }),
          ],
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports:  [ ConfigModule ],
      useClass: TypeOrmConfigService,
    }),
    ThrottlerModule.forRoot({
      ttl:   60,
      limit: 200,
    }),
    HealthModule,
    AuthMeModule,
  ],
  controllers: [ AppController ],
})
export class AppModule {}
