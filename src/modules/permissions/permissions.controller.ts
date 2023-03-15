import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PermissionsService } from './permissions.service';
import { IPermissionEntity } from './interfaces';
import { PermissionBuyDto } from './dto';
import { CurrencyType } from '../../common/types';

@ApiTags('privileges')
@Controller('/privileges')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('/')
  public search(
    @Query('currency') currency: CurrencyType
  ): Promise<IPermissionEntity[]> {
    return this.permissionsService.search(currency);
  }

  @Post('/buy/:id')
  public buy(@Param('id') id: number, @Body() body: PermissionBuyDto) {
    return this.permissionsService.buy(id, body);
  }
}
