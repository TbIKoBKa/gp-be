import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare } from 'bcryptjs';
import { ApiTags } from '@nestjs/swagger';

import { AdminLoginDto } from './dto';

@ApiTags('admin')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto): Promise<{ token: string }> {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPasswordHash = this.configService.get<string>('ADMIN_PASSWORD_HASH');

    if (!adminUsername || !adminPasswordHash) {
      throw new UnauthorizedException('Admin credentials not configured');
    }

    if (dto.username !== adminUsername) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(dto.password, adminPasswordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.jwtService.signAsync(
      { username: dto.username, role: 'admin' },
      {
        secret: this.configService.get('ADMIN_JWT_SECRET'),
        expiresIn: '24h',
      },
    );

    return { token };
  }
}
