import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/auth.decorator';
import { Users } from 'src/entities/Users';
import { AuthenticatedGuard } from '../auth/auth.guard';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  /**
   * @api POST /api/coupons/
   * @description: 운영자가 새로운 쿠폰을 등록합니다.
   * @successCode: 201
   * @errorCode: 500
   */
  @UseGuards(AuthenticatedGuard)
  @Post('')
  async createCoupons(@User() user: Users, @Body() createCouponDto: CreateCouponDto) {
    return await this.couponsService.createCoupon(user, createCouponDto);
  }
}
