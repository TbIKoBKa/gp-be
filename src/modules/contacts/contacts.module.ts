import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { ContactEntity } from './contacts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactEntity]),
    ConfigModule,
    HttpModule,
  ],
  providers: [Logger, ContactsService],
  controllers: [ContactsController],
  exports: [ContactsService],
})
export class ContactsModule {}
