import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import { AuthMeService } from "./auth.service";
import { AuthMeController } from "./auth.controller";
import { AuthMeEntity } from "./auth.entity";

@Module({
  imports:     [ TypeOrmModule.forFeature([ AuthMeEntity ]), ConfigModule ],
  providers:   [ Logger, AuthMeService ],
  controllers: [ AuthMeController ],
  exports:     [ AuthMeService ],
})
export class AuthMeModule {}
