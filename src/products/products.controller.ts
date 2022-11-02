import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthenticatedGuard } from 'src/auth/auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { Users } from 'src/entities/Users';
import { User } from 'src/auth/auth.decorator';
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
  @UseGuards(AuthenticatedGuard)
  @Post()
  async createProduct(@Body() createProductsDto: CreateProductDto, @User() user: Users) {
    return await this.productsServics.createProducts(createProductsDto, user);
  }
}
