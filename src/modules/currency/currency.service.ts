import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export type Currency = 'RUB' | 'UAH' | 'USD';

const CACHE_KEY = 'currency_rates';
const CACHE_TTL = 3600000; // 1 hour in ms

interface ExchangeRates {
  [key: string]: number;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getRates(): Promise<Record<Currency, number>> {
    const rates = await this.fetchRates();
    return {
      RUB: 1,
      UAH: rates['UAH'] || 0.45,
      USD: rates['USD'] || 0.011,
    };
  }

  async getRate(from: Currency, to: Currency): Promise<number> {
    if (from === to) return 1;

    const rates = await this.fetchRates();

    if (from === 'RUB') {
      return rates[to] || 1;
    }

    if (to === 'RUB') {
      return 1 / (rates[from] || 1);
    }

    // Cross rate: from -> RUB -> to
    const fromToRub = 1 / (rates[from] || 1);
    const rubToTo = rates[to] || 1;
    return fromToRub * rubToTo;
  }

  async convert(amount: number, from: Currency, to: Currency): Promise<number> {
    const rate = await this.getRate(from, to);
    return Math.round(amount * rate * 100) / 100;
  }

  private async fetchRates(): Promise<ExchangeRates> {
    // Try to get from cache first
    const cached = await this.cacheManager.get<ExchangeRates>(CACHE_KEY);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/RUB');
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = (await response.json()) as { rates: ExchangeRates };
      const rates = data.rates;

      // Store in cache
      await this.cacheManager.set(CACHE_KEY, rates, CACHE_TTL);

      this.logger.log('Currency rates updated');
      return rates;
    } catch (error) {
      this.logger.error('Failed to fetch currency rates', error);

      // Fallback rates if API fails
      return {
        UAH: 0.45,
        USD: 0.011,
      };
    }
  }
}
