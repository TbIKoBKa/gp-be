import { CacheModule, Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    ConfigModule,
    CacheModule.register(),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
