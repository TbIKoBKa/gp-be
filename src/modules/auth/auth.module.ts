import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthPlayerEntity } from './entities/player.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GoCoinEntity } from '../go-coins/entities/go-coin.entity';

@Module({
  imports: [
    PassportModule.register({
      session: false,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),
    TypeOrmModule.forFeature([AuthPlayerEntity, GoCoinEntity]),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, Logger],
})
export class AuthModule {}
