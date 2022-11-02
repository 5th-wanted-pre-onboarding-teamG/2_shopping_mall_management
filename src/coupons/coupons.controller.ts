import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/auth.decorator';
import { Users } from 'src/entities/Users';
import { AuthenticatedGuard } from '../auth/auth.guard';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  /**
   * @url [POST] /api/coupons/
   * @description: 운영자가 새로운 쿠폰을 생성합니다.
   * @successCode: 201
   * @errorCode: 400, 500
   */
  @UseGuards(AuthenticatedGuard)
  @Post('')
  async createCoupons(@User() user: Users, @Body() createCouponDto: CreateCouponDto) {
    return await this.couponsService.createCoupon(user, createCouponDto);
  }

  /**
   * @url [GET] /api/coupons
   * @query: couponType 쿠폰타입
   * description: 운영자는 생성한 모든 쿠폰들을 조회할 수 있습니다.
   * @successCode: 200
   */
  @UseGuards(AuthenticatedGuard)
  @Get()
  async getAllCoupons(@User() user: Users, @Query('couponType') couponType?: string) {
    return this.couponsService.getAllCoupons(user, couponType);
  }
}
