import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { compare } from 'bcryptjs';
import crypto from 'crypto';

import { LimboAuthPlayer } from './entities/limboauth-player.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(LimboAuthPlayer, 'minecraft')
    private readonly authRepository: Repository<LimboAuthPlayer>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login({ login, password }: LoginDto, res: Response) {
    const player = await this.authRepository.findOne({
      where: { lowercaseNickname: login.toLowerCase() },
    });

    if (!player) throw new UnauthorizedException();

    const valid = await this.verifyPassword(password, player.hash);
    if (!valid) throw new UnauthorizedException();

    await this.generateTokens(player, res);

    return this.sanitize(player);
  }

  async logout(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return true;
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException();

    let payload: { nickname: string; uuid: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException();
    }

    if (!payload.nickname) throw new UnauthorizedException();

    const player = await this.authRepository.findOne({
      where: { lowercaseNickname: payload.nickname.toLowerCase() },
    });

    if (!player) throw new UnauthorizedException();

    await this.generateTokens(player, res);

    return this.sanitize(player);
  }

  private async verifyPassword(plain: string, hash: string): Promise<boolean> {
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return compare(plain, hash);
    }

    if (hash.startsWith('$SHA$')) {
      return this.verifySha256(plain, hash);
    }

    return false;
  }

  private verifySha256(password: string, hash: string): boolean {
    const parts = hash.split('$');
    if (parts.length !== 4) return false;
    const salt = parts[2];
    const hashed = crypto.createHash('sha256').update(password).digest('hex');
    const finalHash = crypto.createHash('sha256').update(hashed + salt).digest('hex');
    return hash === `$SHA$${salt}$${finalHash}`;
  }

  private sanitize(player: LimboAuthPlayer) {
    return {
      nickname: player.nickname,
      uuid: player.uuid,
      regDate: player.regDate,
      loginDate: player.loginDate,
    };
  }

  private async generateTokens(player: LimboAuthPlayer, res: Response) {
    const payload = { nickname: player.lowercaseNickname, uuid: player.uuid };
    const secret = this.configService.get('JWT_SECRET');

    const accessToken = await this.jwtService.signAsync(
      { ...payload, type: 'access' },
      { secret, expiresIn: '10m' },
    );
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      { secret, expiresIn: '7d' },
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      maxAge: 600_000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      maxAge: 604_800_000,
    });
  }
}
