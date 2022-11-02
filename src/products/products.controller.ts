import { Controller, UseGuards, Post, Body, Get, Param, Delete, ParseIntPipe, Put } from '@nestjs/common';
import { ProductsService } from './products.service';
import { OperateGuard } from 'src/auth/auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { Users } from 'src/entities/Users';
import { User } from 'src/auth/auth.decorator';
import { Products } from 'src/entities/Products';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsServics: ProductsService) {}

  /**
   * @url POST 'api/products'
   * @Body createProductsDto: 게시물 생성시 필요한 정보 입니다.{제목, 가격, 제고 }
   * @User user:현재 로그인 된 유저를 나타냅니다.
   * @description 유저가 상품을 생성합니다.
   * @returns 상품 생성
   */
  @UseGuards(OperateGuard)
  @Post()
  async createProduct(@Body() createProductsDto: CreateProductDto, @User() user: Users) {
    return await this.productsServics.createProducts(createProductsDto, user);
  }
  /**
   * @url GET 'api/products'
   * @User user:현재 로그인 된 유저를 나타냅니다.
   * @description 로그인 유저가 생성한 전체 상품을 조회 합니다.
   * @returns 상품 조회
   */
  @UseGuards(OperateGuard)
  @Get()
  async getAllProducts(@User() user: Users): Promise<Products[]> {
    return await this.productsServics.getAllProducts(user);
  }
  /**
   * @url GET 'api/products/:productId'
   * @returns 특정 상품 아이디의 상품 조회
   */
  @Get(':productId')
  async getProduct(@Param('productId') productId: number): Promise<Products> {
    return await this.productsServics.getProduct(productId);
  }
  /**
   * @url DELETE 'api/products/:productId'
   * @returns 특정 상품 아이디의 상품 삭제
   */
  @UseGuards(OperateGuard)
  @Delete(':productId')
  async deleteProduct(@Param('productId', ParseIntPipe) productId: number, @User() user: Users) {
    await this.productsServics.deleteProduct(productId, user);
  }
  /**
   * @url PUT 'api/products/:productId'
   * @returns 특정 상품 아이디의 상품 수정
   */
  @UseGuards(OperateGuard)
  @Put(':productId')
  async updateProduct(@Param('productId') productId: number, @Body() product: Products) {
    return await this.productsServics.updateProduct(productId, product);
  }
}
