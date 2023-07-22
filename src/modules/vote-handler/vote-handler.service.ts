import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

import { VoteHandlerDto } from './dto/vote-handler.dto';
import { RconService } from '../rcon/rcon.service';

const shasum = crypto.createHash('sha1');

@Injectable()
export class VoteHandlerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly rcon: RconService
  ) {}

  private readonly HOTMC_SECRET_KEY =
    this.configService.get('HOTMC_SECRET_KEY');

  async handler({ nick, sign, time }: VoteHandlerDto) {
    shasum.update(nick + time + this.HOTMC_SECRET_KEY);
    const sha1 = shasum.digest('hex');

    console.log(
      '🚀 ~ file: vote-handler.service.ts:25 ~ VoteHandlerService ~ handler ~ sha1:',
      sha1
    );
    console.log(
      '🚀 ~ file: vote-handler.service.ts:25 ~ VoteHandlerService ~ handler ~ sign:',
      sign
    );

    if (sign !== sha1) {
      throw new UnauthorizedException();
    }

    await this.rcon.sendCommandClassic(`eco give ${nick} 1000`);

    return 'ok';
  }
}
