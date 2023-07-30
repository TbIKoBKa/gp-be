import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PermissionsService } from './permissions.service';
// import { IPermissionEntity } from './interfaces';

@ApiTags('privileges')
@Controller('/privileges')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // @Get('/')
  // public search(): Promise<IPermissionEntity[]> {
  //   return this.permissionsService.search();
  // }
}
