import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LimboAuthPlayer } from './entities/limboauth-player.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    TypeOrmModule.forFeature([LimboAuthPlayer], 'minecraft'),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, Logger],
  exports: [TypeOrmModule],
})
export class AuthModule {}
