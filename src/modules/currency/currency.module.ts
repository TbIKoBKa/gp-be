import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CurrencyService } from './currency.service';

@Module({
  imports: [CacheModule.register({ ttl: 3600000 })], // 1 hour
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
