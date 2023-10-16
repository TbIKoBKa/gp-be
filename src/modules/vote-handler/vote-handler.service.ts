import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

import { VoteHandlerDto } from './dto/vote-handler.dto';
import { RconService } from '../rcon/rcon.service';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { VoteEntity } from './entities/vote.entity';
import { Repository } from 'typeorm';

const MONITORING_URL = 'https://tmonitoring.com/api/check/';

@Injectable()
export class VoteHandlerService {
  constructor(
    @InjectRepository(VoteEntity)
    private readonly voteEntityRepository: Repository<VoteEntity>,
    private readonly configService: ConfigService,
    private readonly rcon: RconService
  ) {}

  private readonly HOTMC_SECRET_KEY =
    this.configService.get('HOTMC_SECRET_KEY');

  async hotMcHandler({ nick, sign, time }: VoteHandlerDto) {
    const shasum = crypto.createHash('sha1');
    shasum.update(nick + time + this.HOTMC_SECRET_KEY);
    const sha1 = shasum.digest('hex');

    console.log(
      '🚀 ~ file: vote-handler.service.ts:21 ~ VoteHandlerService ~ handler ~ this.HOTMC_SECRET_KEY:',
      this.HOTMC_SECRET_KEY
    );
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

  async tMonitoringHandler(id: string, hash: string) {
    console.log(
      '🚀 ~ file: vote-handler.service.ts:54 ~ VoteHandlerService ~ tMonitoringHandler ~ hash:',
      hash
    );
    console.log(
      '🚀 ~ file: vote-handler.service.ts:54 ~ VoteHandlerService ~ tMonitoringHandler ~ id:',
      id
    );
    try {
      const response = await axios.get(`${MONITORING_URL}${hash}?id=${id}`);
      const data = response.data;
      console.log(
        '🚀 ~ file: vote-handler.service.ts:59 ~ VoteHandlerService ~ tMonitoringHandler ~ data:',
        data
      );

      if (data.hash.length !== 32 || hash.length !== 32 || data.hash !== hash) {
        throw new Error('Invalid hash');
      }

      const vote = await this.voteEntityRepository.findOne({
        where: {
          nickname: data.username,
        },
      });

      if (vote) {
        await this.voteEntityRepository.update(
          {
            id: vote.id,
          },
          {
            ...vote,
            balance: vote.balance + 1,
          }
        );
      } else {
        await this.voteEntityRepository.save({
          nickname: data.username,
          balance: 1,
        });
      }

      return 'Success';
    } catch (error) {
      return error.message;
    }
  }
}
