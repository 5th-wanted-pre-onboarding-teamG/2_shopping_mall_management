import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/auth.decorator';
import { Users } from 'src/entities/Users';
import { AuthenticatedGuard, OperateGuard } from '../auth/auth.guard';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CreateOwnedCouponDto } from './dto/create-owned-coupon.dto';
import { GetUserOwnedCouponsRes } from './dto/get-user-owned-coupons-res.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  /**
   * @url [POST] /api/coupons/
   * @description: 운영자가 새로운 쿠폰을 생성합니다.
   * @Request:
   * @Response:
   * @successCode: 201
   * @errorCode: 400, 401, 500
   */
  @UseGuards(OperateGuard)
  @Post('')
  async createCoupons(@User() user: Users, @Body() createCouponDto: CreateCouponDto) {
    return await this.couponsService.createCoupon(user, createCouponDto);
  }

  /**
   * @url [GET] /api/coupons
   * @query: couponType 쿠폰타입
   * description: 운영자는 생성한 모든 쿠폰들을 조회할 수 있습니다.
   * @Request: (Query) couponType
   * @Response: Coupons[]
   * @successCode: 200
   * @errorCode: 400, 401, 500
   */
  @UseGuards(OperateGuard)
  @Get()
  async getAllCoupons(@User() user: Users, @Query('couponType') couponType?: string) {
    return this.couponsService.getAllCoupons(user, couponType);
  }

  /**
   * @url [GET] /api/coupons/users/:userId/owned-coupons
   * @description 운영자는 유저아이디에 해당하는 회원이 보유한 모든 쿠폰들을 조회할 수 있습니다.
   * @Request
   * * @param required: userId
   * * @query selection: couponType, isUsed
   * @Response OwnedCoupons[]
   * @success 200
   * @errorCode 400, 401, 404
   */
  @UseGuards(OperateGuard)
  @Get('/users/:userId/owned-coupons')
  async getOwnedCoupons(
    @Param('userId', ParseIntPipe) userId: number,
    @User() user: Users,
    @Query('couponType') couponType?: any,
    @Query('isUsed') isUsed?: any,
  ) {
    return this.couponsService.getOwnedCoupons(user, userId, couponType, isUsed);
  }

  /**
   * @url [POST] /api/coupons/owned-coupons
   * @description 사용자 쿠폰 등록 : 등록하면 사용자의 보유쿠폰 목록에 추가됩니다.
   * @Request
   *  @body couponId
   * @Response OwnedCoupons[]: 유저가 갖고있는 사용가능한 보유쿠폰들
   *           사용가능한 쿠폰들이란, '유효기간이 없거나 만료되지 않고', '사용하지 않은 쿠폰' 입니다.
   * @success 201
   * @errorCode 400 401 404 500
   */
  @UseGuards(AuthenticatedGuard)
  @Post('owned-coupons')
  async createdOwnedCoupon(@User() user: Users, @Body() newCoupon: CreateOwnedCouponDto) {
    return await this.couponsService.createOwnedCoupon(user, newCoupon);
  }

  /**
   * @url [GET] /api/coupons/owned-coupons
   * @description 사용자 보유쿠폰 조회
   *              쿠폰타입에 해당하는 쿠폰들 검색
   *              유효기간이 만료되지 않고, 사용 가능한 쿠폰들만 존재합니다.
   * @Request
   * @Response OwnedCoupons[]
   * @success 200
   * @errorCode 400
   */
  @UseGuards(AuthenticatedGuard)
  @Get('owned-coupons')
  async getUserOwnedCoupons(
    @User() user: Users,
    @Query('couponTypes') couponTypes?: string,
  ): Promise<GetUserOwnedCouponsRes[]> {
    return await this.couponsService.getUserOwnedCoupons(user, couponTypes);
  }

  /**
   * @url [PATCH] /api/coupons/owned-coupons/:ownedCouponId/extend
   * @description 사용자가 보유한 쿠폰을 딱 한번만 기간을 2주일 연장할 수 있습니다.
   *              만료기간(expiration) = "연장요청시작시간 + 14일" 로 변경됩니다.
   *              연장여부(isExtendDate) = true 로 변경합니다.
   * @param ownedCouponId
   * @success 200
   * @errorCode 400, 404
   */
  @UseGuards(AuthenticatedGuard)
  @Patch('owned-coupons/:ownedCouponId/extend')
  async extendExpirationDate(@User() user: Users, @Param('ownedCouponId', ParseIntPipe) ownedCouponId: number) {
    return await this.couponsService.extendExpirationDate(user, ownedCouponId);
  }

  /**
   * @url [PATCH] /api/coupons/owned-coupons/:ownedCouponId
   * @description 사용자가 보유한 쿠폰 한개를 사용
   *              사용이 완료되면, usedDate = YYYY-MM-DD HH:mm:ss 형태의 타임스탬프로 변경됩니다.
   * @param ownedCouponId
   */
  @UseGuards(AuthenticatedGuard)
  @Patch('owned-coupons/:ownedCouponId')
  async useOwnedCoupon(@User() user: Users, @Param('ownedCouponId', ParseIntPipe) ownedCouponId: number) {
    return await this.couponsService.useOwnedCoupon(user, ownedCouponId);
  }
}
