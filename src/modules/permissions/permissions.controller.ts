import {
  Controller,
  Get,
} from "@nestjs/common";

import { PermissionsService } from "./permissions.service";
import { IPermissionEntity } from "./interfaces";

@Controller("/permissions")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get("/")
  public search(): Promise<IPermissionEntity[]> {
    return this.permissionsService.search();
  }
}
