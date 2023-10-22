import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

import { MineservVoteHandlerDto } from './dto/mineserv-vote-handler.dto';
import { HotmcVoteHandlerDto } from './dto/hotmc-vote-handler.dto copy';
import { McMonitorVoteHandlerDto } from './dto/mcmonitor-vote-handler.dto';
import { RconService } from '../rcon/rcon.service';
import { InjectRepository } from '@nestjs/typeorm';
import { VoteEntity } from './entities/vote.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { GoCoinsService } from '../go-coins/go-coins.service';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(VoteEntity)
    private readonly voteEntityRepository: Repository<VoteEntity>,
    private readonly goCoinsService: GoCoinsService,
    private readonly configService: ConfigService,
    private readonly rcon: RconService
  ) {}

  async getVotes(where: FindOptionsWhere<VoteEntity>) {
    return this.voteEntityRepository.findAndCount({
      where,
    });
  }

  async getVoteByNickname(nickname: string) {
    return this.voteEntityRepository.findAndCount({
      where: {
        nickname: nickname.toLowerCase(),
      },
    });
  }

  async hotMcHandler({ nick, sign, time }: HotmcVoteHandlerDto) {
    const HOTMC_SECRET_KEY = this.configService.get('HOTMC_SECRET_KEY');

    const shasum = crypto.createHash('sha1');
    shasum.update(nick + time + HOTMC_SECRET_KEY);
    const sha1 = shasum.digest('hex');

    if (sign !== sha1) {
      throw new UnauthorizedException();
    }

    await this.handleVote(nick);

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

    await this.handleVote(username);

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
        await this.handleVote(name);
      }
    }

    return { status: 1, message: 'OK', queryIndex: 0 };
  }

  async handleVote(nickname: string) {
    await this.voteEntityRepository.save({
      nickname: nickname.toLowerCase(),
      createdAt: new Date().toISOString(),
    });

    await this.goCoinsService.updateBalance(nickname, 1);
  }
}
