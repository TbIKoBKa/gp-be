import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ContactEntity } from './contacts.entity';
import { IContacts } from './interfaces';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ContactEntity)
    private readonly contactsEntityRepository: Repository<ContactEntity>
  ) {}

  public async search(): Promise<IContacts> {
    const queryBuilder =
      this.contactsEntityRepository.createQueryBuilder('contacts');

    queryBuilder.select();

    const contacts = await queryBuilder.getMany();

    return {
      discord: contacts[0],
      vk: contacts[1],
      tg: contacts[2],
    };
  }
}
