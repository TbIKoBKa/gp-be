import { ConfigService } from '@nestjs/config';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, FindOptionsWhere, Repository } from 'typeorm';
import { v4 } from 'uuid';
import crypto from 'crypto';

import { CallbackOrderDto } from './dto';
import { OrderEntity } from './orders.entity';
import { PermissionInheritanceEntity } from '../permissions/permissionInheritance.entity';
import { PermissionEntity } from '../permissions/permissions.entity';
import { ICompleteOrderDto } from './interfaces/completeOrder';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersEntityRepository: Repository<OrderEntity>,
    @InjectRepository(PermissionInheritanceEntity)
    private readonly permissionInheritanceEntityRepository: Repository<PermissionInheritanceEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionEntityRepository: Repository<PermissionEntity>,
    private readonly configService: ConfigService
  ) {}

  public async search(): Promise<[Array<OrderEntity>, number]> {
    return this.ordersEntityRepository.findAndCount();
  }

  public async callback(data: CallbackOrderDto) {
    const {
      InvId,
      OutSum,
      SignatureValue,
      custom,
      ik_co_id,
      ik_desc,
      ik_x_nickname,
      ik_pm_no,
      ik_inv_st,
    } = data;

    // const LIQPAY_PRIVATE_KEY = this.configService.get('LIQPAY_PRIVATE_KEY');
    const PP_TOKEN = this.configService.get('PP_TOKEN');
    const INTERKASSA_CHECKOUT_ID = this.configService.get(
      'INTERKASSA_CHECKOUT_ID'
    );

    try {
      // const targetSignature = getSignature({
      //   data,
      //   privateKey: LIQPAY_PRIVATE_KEY,
      // });

      // if (signature !== targetSignature) {
      //   throw new NotFoundException();
      // }

      // const { order_id, status } = getDataObjectFromDataString(data);

      // await this.ordersEntityRepository.update(
      //   { id: Number(order_id) },
      //   { status }
      // );

      console.log('received data', data);

      if (InvId && OutSum && PP_TOKEN && custom) {
        const hash = crypto
          .createHash('md5')
          .update(`${OutSum}:${InvId}:${PP_TOKEN}`)
          .digest('hex')
          .toUpperCase();

        if (hash === SignatureValue) {
          const { nickname, permissionName } = JSON.parse(custom);

          await this.completeOrder({
            order_id: Number(InvId),
            nickname,
            permissionName,
          });

          return { id: InvId, status: 'success' };
        }
      } else if (ik_co_id && ik_desc && ik_x_nickname && ik_pm_no) {
        if (ik_co_id === INTERKASSA_CHECKOUT_ID) {
          await this.completeOrder({
            order_id: Number(ik_pm_no),
            nickname: ik_x_nickname,
            permissionName: ik_desc,
            status: ik_inv_st,
          });

          return { id: ik_pm_no, status: ik_inv_st };
        }
      }

      throw new NotFoundException();
    } catch (error) {
      console.error(error);
      throw new NotFoundException();
    }
  }

  private async completeOrder({
    nickname,
    order_id,
    permissionName,
    status = 'success',
  }: ICompleteOrderDto) {
    const uid =
      (
        await this.permissionEntityRepository.findOne({
          where: {
            value: nickname,
          },
        })
      )?.name || v4();

    const promises = [
      this.ordersEntityRepository.update({ id: order_id }, { status }),
    ];

    if (status === 'success') {
      promises.push(
        this.permissionInheritanceEntityRepository.update(
          {
            child: uid,
          },
          {
            child: uid,
            parent: permissionName,
            type: 1,
          }
        ),
        this.permissionEntityRepository.update(
          {
            name: uid,
          },
          {
            name: uid,
            type: 1,
            permission: 'name',
            value: nickname,
          }
        )
      );
    }

    await Promise.all(promises);
  }

  public findOne(
    where: FindOptionsWhere<OrderEntity>
  ): Promise<OrderEntity | null> {
    return this.ordersEntityRepository.findOne({ where });
  }

  public delete(where: FindOptionsWhere<OrderEntity>): Promise<DeleteResult> {
    return this.ordersEntityRepository.delete(where);
  }
}
