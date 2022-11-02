import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
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
    private readonly productsRepository: Repository<Products>,
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
    const saveProdut = await this.productsRepository.save(product);
    return saveProdut;
  }
  async getAllProducts() {
    return await this.productsRepository.find();
  }
  async getProduct(productId: number): Promise<Products> {
    return await this.productsRepository.findOne({
      where: { productId },
    });
  }
  async deleteProduct(productId: number) {
    const result = await this.productsRepository
      .createQueryBuilder('products')
      .leftJoin('products.Author', 'users')
      .where('products.productId =:productId', { productId })
      .getOne();

    if (!result) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }
    return this.productsRepository.softDelete(productId);
  }
  async updateProduct(productId: number, product: Products) {
    const result = await this.productsRepository
      .createQueryBuilder('products')
      .leftJoin('products.Author', 'users')
      .update(Products)
      .set({
        name: product.name,
        price: product.price,
        stock: product.stock,
      })
      .where('products.deleteAt IS NULL')
      .andWhere('products.productId =:productId', { productId })
      .execute();

    if (!result) {
      throw new NotFoundException('상품을 수정 할 수 없습니다.');
    }
  }
}
