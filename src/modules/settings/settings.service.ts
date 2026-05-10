import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SettingEntity } from './entities/setting.entity';

export enum SettingKey {
  GOCOIN_TO_RUB_RATE = 'gocoin_to_rub_rate',
  LUCK_SPIN_PRICE = 'luck_spin_price',
  LUCK_PRIZE_WEIGHTS = 'luck_prize_weights',
}

const DEFAULT_PRIZE_WEIGHTS = JSON.stringify({
  nothing: 7189,
  gc1: 1500,
  gc2: 1000,
  gc5: 300,
  gc100: 10,
  gc500: 1,
});

const DEFAULT_SETTINGS: Record<SettingKey, string> = {
  [SettingKey.GOCOIN_TO_RUB_RATE]: '1',
  [SettingKey.LUCK_SPIN_PRICE]: '1',
  [SettingKey.LUCK_PRIZE_WEIGHTS]: DEFAULT_PRIZE_WEIGHTS,
};

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly settingRepository: Repository<SettingEntity>,
  ) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  private async seedDefaults() {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      const existing = await this.settingRepository.findOne({ where: { key } });
      if (!existing) {
        await this.settingRepository.save({ key, value });
      }
    }
  }

  async get(key: SettingKey): Promise<string> {
    const setting = await this.settingRepository.findOne({ where: { key } });
    return setting?.value ?? DEFAULT_SETTINGS[key];
  }

  async getNumber(key: SettingKey): Promise<number> {
    const value = await this.get(key);
    return parseFloat(value);
  }

  async getJson<T>(key: SettingKey): Promise<T> {
    const value = await this.get(key);
    return JSON.parse(value) as T;
  }

  async setJson(key: SettingKey, value: unknown): Promise<void> {
    await this.set(key, JSON.stringify(value));
  }

  async set(key: SettingKey, value: string): Promise<void> {
    await this.settingRepository.save({ key, value });
  }

  async getAll(): Promise<Record<string, string>> {
    const settings = await this.settingRepository.find();
    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  }

  async updateMany(updates: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(updates)) {
      await this.settingRepository.save({ key, value });
    }
  }
}
