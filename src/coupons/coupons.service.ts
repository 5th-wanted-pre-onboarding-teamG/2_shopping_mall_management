import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRank } from 'src/entities/enums/userRank';
import { Users } from 'src/entities/Users';
import { Repository, DataSource } from 'typeorm';
import { Coupons } from '../entities/Coupons';
import { CouponType } from 'src/entities/enums/couponType';
import { OwnedCoupons } from '../entities/OwnedCoupons';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Coupons)
    private readonly couponsRepository: Repository<Coupons>,
    @InjectRepository(OwnedCoupons)
    private readonly userOwnCouponsRepository: Repository<OwnedCoupons>,
  ) {}

  DEFAULT_DELIVERY_COUPON_PRICE = 100; // 배송쿠폰 기본값 (100 %)
  DEFAULT_FLAT_RATE_COUPON_PRICE = 1000; // 정액제 기본값 (1000 원)

  async createCoupon(user: Users, createCouponDto: CreateCouponDto) {
    // 운영자인지 체크
    if (user.rank !== UserRank.MANAGER) {
      throw new UnauthorizedException('쿠폰등록 접근권한이 없습니다.');
    }

    const _couponType = createCouponDto.couponType;
    const _salePrice = createCouponDto.salePrice;

    // 쿠폰타입에 따라 salePrice 조정
    const salePrice = this.defineCouponSalePriceByCouponType(_couponType, _salePrice);
    createCouponDto.salePrice = salePrice;

    // 쿠폰등록
    return await this.couponsRepository.save(createCouponDto);
  }

  defineCouponSalePriceByCouponType(couponType: string, salePrice: number) {
    switch (couponType) {
      case CouponType.PERCENT: {
        if (salePrice > 0 && salePrice <= 100) {
          return salePrice;
        }
        throw new BadRequestException('퍼센트(%) 단위 할인 가격은 1 이상 100 이하의 값만 허용합니다.');
      }
      case CouponType.DELIVERY: {
        if (!salePrice) {
          return this.DEFAULT_DELIVERY_COUPON_PRICE;
        }

        if (salePrice > 0 && salePrice < 100) {
          return salePrice;
        }
        throw new BadRequestException('퍼센트(%) 단위 할인 가격은 1 이상 100 이하의 값만 허용합니다.');
      }
      case CouponType.FLAT_RATE: {
        if (!salePrice) {
          return this.DEFAULT_FLAT_RATE_COUPON_PRICE;
        }

        if (salePrice < this.DEFAULT_FLAT_RATE_COUPON_PRICE) {
          throw new BadRequestException('정액(원: ₩) 단위 할인가격은 최소 1000원 이상 입니다.');
        }
        return salePrice;
      }
    }
  }
}
