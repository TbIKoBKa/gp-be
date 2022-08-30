import {
  Controller,
  Get,
  Query,
  UseInterceptors,
} from "@nestjs/common";

import { AuthMeService } from "./auth.service";
import { AuthMeEntity } from "./auth.entity";
import { AuthMeSearchDto } from "./dto";
import { PaginationInterceptor } from "../../utils";

@Controller("/authme")
export class AuthMeController {
  constructor(private readonly authMeService: AuthMeService) {}

  @Get("/")
  @UseInterceptors(PaginationInterceptor)
  public search(@Query() dto: AuthMeSearchDto): Promise<[Array<AuthMeEntity>, number]> {
    return this.authMeService.search(dto);
  }
}
