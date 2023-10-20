import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthPlayerEntity } from './entities/player.entity';
import { Repository } from 'typeorm';
import { Sha256 } from '../../utils/sha256';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

const sha256 = new Sha256();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthPlayerEntity)
    private readonly playersEntityRepository: Repository<AuthPlayerEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async login({ login, password }: LoginDto, res: Response) {
    const player = await this.findOne(login);
    const { id, password: currentPassword } = player;

    const isValidPassword = sha256.isValidPassword(password, currentPassword);

    if (!isValidPassword) {
      throw new UnauthorizedException();
    }

    await this.generateTokens(id, res);

    return {
      ...player,
      password: undefined,
    };
  }

  async logout(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return true;
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const isValidRefresh = this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get('JWT_SECRET'),
    });

    if (!isValidRefresh) {
      throw new UnauthorizedException();
    }

    const { id } = this.jwtService.decode(refreshToken) as { id: number };

    if (!id) {
      throw new UnauthorizedException();
    }

    await this.generateTokens(id, res);

    return this.playersEntityRepository.findOne({
      where: {
        id,
      },
      relations: {
        coins: true,
      },
    });
  }

  async findOne(login: string) {
    const player = await this.playersEntityRepository.findOne({
      where: {
        username: login.toLowerCase(),
      },
      relations: {
        coins: true,
      },
    });

    if (!player) {
      throw new UnauthorizedException();
    }

    return player;
  }

  async generateTokens(id: number, res: Response) {
    const jwtAccessToken = await this.jwtService.signAsync(
      { id, type: 'access' },
      { secret: this.configService.get('JWT_SECRET') }
    );
    const jwtRefreshToken = await this.jwtService.signAsync(
      { id, type: 'refresh' },
      { secret: this.configService.get('JWT_SECRET') }
    );

    res.cookie('access_token', jwtAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      maxAge: 600000,
    });
    res.cookie('refresh_token', jwtRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      maxAge: 604800000,
    });

    return {
      jwtAccessToken,
      jwtRefreshToken,
    };
  }
}
