import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PermissionsService } from './permissions.service';
import { IPermissionEntity } from './interfaces';
import { PermissionBuyDto } from './dto';

@ApiTags('privileges')
@Controller('/privileges')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('/')
  public search(): Promise<IPermissionEntity[]> {
    return this.permissionsService.search();
  }

  @Post('/buy/:id')
  public buy(@Param('id') id: number, @Body() body: PermissionBuyDto) {
    return this.permissionsService.buy(id, body);
  }
}
