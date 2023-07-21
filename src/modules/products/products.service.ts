import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productEntityRepository: Repository<ProductEntity>
  ) {}

  // create(createProductDto: CreateProductDto) {
  //   return 'This action adds a new product';
  // }

  findAll() {
    return this.productEntityRepository.find();
  }

  findOne(id: number) {
    return this.productEntityRepository.findOneBy({ id });
  }

  // update(id: number, updateProductDto: UpdateProductDto) {
  //   return `This action updates a #${id} product`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} product`;
  // }
}
