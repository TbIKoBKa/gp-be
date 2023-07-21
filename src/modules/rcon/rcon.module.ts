import { Module } from '@nestjs/common';
import { RconService } from './rcon.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [RconService],
  exports: [RconService],
  imports: [ConfigModule],
})
export class RconModule {
  constructor(private readonly rconService: RconService) {}

  async onModuleInit() {
    await this.rconService.connect();
  }
}
