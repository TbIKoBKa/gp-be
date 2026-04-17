import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { Logger, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { HealthModule } from './modules/health/health.module';
import { PlayerModule } from './modules/player/player.module';
import { AppController } from './app.controller';
import { HttpExceptionFilter } from './utils';
import { VotesModule } from './modules/votes/votes.module';
import { AuthModule } from './modules/auth/auth.module';
import { ShopModule } from './modules/shop/shop.module';
import { BridgeModule } from './modules/bridge/bridge.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { AdminModule } from './modules/admin/admin.module';

import { LimboAuthPlayer } from './modules/auth/entities/limboauth-player.entity';
import { OrderEntity } from './modules/shop/entities/order.entity';
import { VoteEntity } from './modules/votes/entities/vote.entity';
import { VoteBalanceEntity } from './modules/votes/entities/vote-balance.entity';
import { ServerStatusLogEntity } from './modules/monitoring/entities/server-status-log.entity';
import { ServerStatusHourlyEntity } from './modules/monitoring/entities/server-status-hourly.entity';

@Module({
  providers: [
    Logger,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV as string}`,
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.simple(),
              winston.format.timestamp({ format: 'DD.MM.YYYY, HH:mm:ss' }),
              winston.format.ms(),
              winston.format.printf((debug) => {
                const { timestamp, level, message, context, ms } = debug;
                return `[Nest] ${timestamp as string}\t${level.toUpperCase()} [${context as string}] ${message as string} ${ms as string}`;
              }),
              winston.format.colorize({ all: true }),
            ),
          }),
        ],
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('GP_DB_HOST'),
        port: Number(config.get('GP_DB_PORT')),
        username: config.get<string>('GP_DB_USER'),
        password: config.get<string>('GP_DB_PASSWORD'),
        database: config.get<string>('GP_DB_NAME'),
        entities: [OrderEntity, VoteEntity, VoteBalanceEntity, ServerStatusLogEntity, ServerStatusHourlyEntity],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forRootAsync({
      name: 'minecraft',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('MC_DB_HOST'),
        port: Number(config.get('MC_DB_PORT')),
        username: config.get<string>('MC_DB_USER'),
        password: config.get<string>('MC_DB_PASSWORD'),
        database: config.get<string>('MC_DB_NAME'),
        entities: [LimboAuthPlayer],
        synchronize: false,
      }),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 200,
      },
    ]),
    HealthModule,
    PlayerModule,
    VotesModule,
    AuthModule,
    BridgeModule,
    ShopModule,
    MonitoringModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
