import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { ConfigModule } from "@nestjs/config";
import { RedisHealthModule } from "@liaoliaots/nestjs-redis/health";

import { HealthController } from "./health.controller";

@Module({
  imports: [TerminusModule, ConfigModule, RedisHealthModule],
  controllers: [HealthController],
})
export class HealthModule {}
