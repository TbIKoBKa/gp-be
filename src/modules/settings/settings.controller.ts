import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

import { SettingsService, SettingKey } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('gocoin-rate')
  @SkipThrottle()
  async getGocoinRate() {
    const rate = await this.settingsService.getNumber(SettingKey.GOCOIN_TO_RUB_RATE);
    return { rate };
  }

  @Get('luck-config')
  @SkipThrottle()
  async getLuckConfig() {
    const spinPrice = await this.settingsService.getNumber(SettingKey.LUCK_SPIN_PRICE);
    return { spinPrice };
  }
}
