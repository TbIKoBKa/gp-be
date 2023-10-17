import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

import { MineservVoteHandlerDto } from './dto/mineserv-vote-handler.dto';
import { HotmcVoteHandlerDto } from './dto/hotmc-vote-handler.dto copy';
import { RconService } from '../rcon/rcon.service';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { VoteEntity } from './entities/vote.entity';
import { Repository } from 'typeorm';

const TMONITORING_URL = 'https://tmonitoring.com/api/check/';

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

  async hotMcHandler({ nick, sign, time }: HotmcVoteHandlerDto) {
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

  async mineservHandler({
    project,
    signature,
    timestamp,
    username,
  }: MineservVoteHandlerDto) {
    const secret = this.configService.get('MINESERV_SECRET_KEY');
    console.log(
      '🚀 ~ file: vote-handler.service.ts:61 ~ VoteHandlerService ~ secret:',
      secret
    );
    const toHash = `${project}.${secret}.${timestamp}.${username}`;

    console.log(
      '🚀 ~ file: vote-handler.service.ts:64 ~ VoteHandlerService ~ toHash:',
      toHash
    );
    const selfSign = crypto.createHash('sha256').update(toHash).digest('hex');
    console.log(
      '🚀 ~ file: vote-handler.service.ts:66 ~ VoteHandlerService ~ selfSign:',
      selfSign
    );

    if (selfSign !== signature) {
      console.error('not valid signature');
      throw new UnauthorizedException();
    }

    await this.increaseBalance(username);
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
      const response = await axios.get(`${TMONITORING_URL}${hash}?id=${id}`);
      const data = response.data;
      console.log(
        '🚀 ~ file: vote-handler.service.ts:59 ~ VoteHandlerService ~ tMonitoringHandler ~ data:',
        data
      );

      if (data.hash.length !== 32 || hash.length !== 32 || data.hash !== hash) {
        throw new Error('Invalid hash');
      }

      await this.increaseBalance(data.username);

      return 'Success';
    } catch (error) {
      return error.message;
    }
  }

  async increaseBalance(nickname: string) {
    const vote = await this.voteEntityRepository.findOne({
      where: {
        nickname,
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
        nickname,
        balance: 1,
      });
    }
  }
}
