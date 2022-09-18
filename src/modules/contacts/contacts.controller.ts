import {
  Controller,
  Get,
} from "@nestjs/common";

import { ContactsService } from "./contacts.service";
import { IContacts } from "./interfaces";

@Controller("/contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get("/")
  public search(): Promise<IContacts> {
    return this.contactsService.search();
  }
}
