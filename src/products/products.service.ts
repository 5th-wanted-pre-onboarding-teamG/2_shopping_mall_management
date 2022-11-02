import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from 'src/entities/Products';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Users } from 'src/entities/Users';
import { UserRank } from 'src/entities/enums/userRank';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private readonly porductsRepository: Repository<Products>,
  ) {}
  async createProducts(createProductsDto: CreateProductDto, user: Users) {
    const product = new Products();
    // 유저의 rank가 NORMAL일 경우 접근을 할 수 없습니다.
    if (user.rank === UserRank.NORMAL) {
      throw new ForbiddenException('상품 생성 권한이 없습니다.');
    }
    product.name = createProductsDto.name;
    product.price = createProductsDto.price;
    product.stock = createProductsDto.stock;
    product.Author = user;
    //상품  저장
    const saveProdut = await this.porductsRepository.save(product);
    return saveProdut;
  }
  async getAllProducts(user: Users): Promise<Products[]> {
    //로그인 한 유저의 등록 상품만 보여 줍니다.
    const result = await this.porductsRepository
      .createQueryBuilder('products')
      .leftJoin('products.Author', 'users')
      .where('products.deleteAt IS NULL')
      .andWhere('products.Author =:userId', { userId: user.userId })
      .getMany();

    return result;
  }
}
