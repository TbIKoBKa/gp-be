import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

import { MineservVoteHandlerDto } from './dto/mineserv-vote-handler.dto';
import { HotmcVoteHandlerDto } from './dto/hotmc-vote-handler.dto copy';
import { McMonitorVoteHandlerDto } from './dto/mcmonitor-vote-handler.dto';
import { RconService } from '../rcon/rcon.service';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { VoteEntity } from './entities/vote.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

const TMONITORING_URL = 'https://tmonitoring.com/api/check/';

@Injectable()
export class VoteHandlerService {
  constructor(
    @InjectRepository(VoteEntity)
    private readonly voteEntityRepository: Repository<VoteEntity>,
    private readonly configService: ConfigService,
    private readonly rcon: RconService
  ) {}

  async getVotes(where: FindOptionsWhere<VoteEntity>) {
    return this.voteEntityRepository.findAndCount({
      where,
    });
  }

  async getVoteByNickname(nickname: string) {
    const vote = await this.voteEntityRepository.findOne({
      where: {
        nickname: nickname.toLowerCase(),
      },
    });

    if (!vote) {
      throw new NotFoundException();
    }

    return vote;
  }

  async hotMcHandler({ nick, sign, time }: HotmcVoteHandlerDto) {
    const HOTMC_SECRET_KEY = this.configService.get('HOTMC_SECRET_KEY');

    const shasum = crypto.createHash('sha1');
    shasum.update(nick + time + HOTMC_SECRET_KEY);
    const sha1 = shasum.digest('hex');

    if (sign !== sha1) {
      throw new UnauthorizedException();
    }

    await this.increaseBalance(nick);

    return 'ok';
  }

  async mineservHandler({
    project,
    signature,
    timestamp,
    username,
  }: MineservVoteHandlerDto) {
    const secret = this.configService.get('MINESERV_SECRET_KEY');
    const toHash = `${project}.${secret}.${timestamp}.${username}`;
    const selfSign = crypto.createHash('sha256').update(toHash).digest('hex');

    if (selfSign !== signature) {
      throw new UnauthorizedException();
    }

    await this.increaseBalance(username);

    return 'done';
  }

  async mcMonitorHandler({ id, name, sign, sandbox }: McMonitorVoteHandlerDto) {
    const secret = this.configService.get('MCMONITOR_SECRET_KEY');

    if (sandbox !== '1') {
      const calculatedSign = crypto
        .createHash('sha1')
        .update(name + secret + id)
        .digest('hex');

      if (calculatedSign !== sign) {
        throw new UnauthorizedException();
      }

      if (name) {
        await this.increaseBalance(name);
      }
    }

    return { status: 1, message: 'OK', queryIndex: 0 };
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
        nickname: nickname.toLowerCase(),
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
        nickname: nickname.toLowerCase(),
        balance: 1,
      });
    }
  }
}
