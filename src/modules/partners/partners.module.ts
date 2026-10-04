import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';
import { PartnerCampaignEntity } from './entities/partner-campaign.entity';
import { RegistrationSourceEntity } from './entities/registration-source.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PartnerCampaignEntity]),
    TypeOrmModule.forFeature([RegistrationSourceEntity], 'minecraft'),
    CacheModule.register({ ttl: 60000 }),
  ],
  providers: [PartnersService],
  controllers: [PartnersController],
})
export class PartnersModule {}
