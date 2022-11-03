import { BadRequestException, Injectable, ParseBoolPipe, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRank } from 'src/entities/enums/userRank';
import { Users } from 'src/entities/Users';
import { Repository, DataSource, Not, IsNull } from 'typeorm';
import { Coupons } from '../entities/Coupons';
import { CouponType } from 'src/entities/enums/couponType';
import { OwnedCoupons } from '../entities/OwnedCoupons';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { isBoolean, IsBoolean, isEnum, IsEnum, isString } from 'class-validator';

@Injectable()
export class CouponsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Coupons)
    private readonly couponsRepository: Repository<Coupons>,
    @InjectRepository(OwnedCoupons)
    private readonly userOwnCouponsRepository: Repository<OwnedCoupons>,
  ) {}

  private readonly DEFAULT_DELIVERY_COUPON_PRICE = 100; // 배송쿠폰 기본값 (100 %)
  private readonly DEFAULT_FLAT_RATE_COUPON_PRICE = 1000; // 정액제 기본값 (1000 원)
  private readonly COUPON_TYPE_DEFAULT_SEARCH_FILTER = [CouponType.PERCENT, CouponType.DELIVERY, CouponType.FLAT_RATE]; // 쿠폰타입검색 기본값

  async createCoupon(user: Users, createCouponDto: CreateCouponDto) {
    const _couponType = createCouponDto.couponType;
    const _discount = createCouponDto.discount;

    // 쿠폰타입에 따라 discount 조정
    const discount = this.defineDiscountByCouponType(_couponType, _discount);
    createCouponDto.discount = discount;

    // 쿠폰등록
    return await this.couponsRepository.save(createCouponDto);
  }

  private defineDiscountByCouponType(couponType: string, discount: number) {
    switch (couponType) {
      case CouponType.PERCENT: {
        if (discount > 0 && discount <= 100) {
          return discount;
        }
        throw new BadRequestException('퍼센트(%) 단위 할인 가격은 1 이상 100 이하의 값만 허용합니다.');
      }
      case CouponType.DELIVERY: {
        if (!discount) {
          return this.DEFAULT_DELIVERY_COUPON_PRICE;
        }

        if (discount > 0 && discount < 100) {
          return discount;
        }
        throw new BadRequestException('퍼센트(%) 단위 할인 가격은 1 이상 100 이하의 값만 허용합니다.');
      }
      case CouponType.FLAT_RATE: {
        if (!discount) {
          return this.DEFAULT_FLAT_RATE_COUPON_PRICE;
        }

        if (discount < this.DEFAULT_FLAT_RATE_COUPON_PRICE) {
          throw new BadRequestException('정액(원: ₩) 단위 할인가격은 최소 1000원 이상 입니다.');
        }
        return discount;
      }
    }
  }

  private checkCouponType(couponType: string) {
    if (couponType && !isEnum(couponType, CouponType)) {
      throw new BadRequestException('쿠폰종류가 올바르지 않습니다.');
    }
  }

  async getAllCoupons(user: Users, couponType: string) {
    this.checkCouponType(couponType);

    let _couponTypes;
    if (!couponType) {
      // couponType 파라미터가 존재하지 않을때 - 기본필터로 설정
      _couponTypes = this.COUPON_TYPE_DEFAULT_SEARCH_FILTER;
    } else {
      _couponTypes = [couponType];
    }

    const allCoupons = await this.couponsRepository
      .createQueryBuilder('coupons')
      .where('couponType IN (:couponTypes)', { couponTypes: _couponTypes })
      .getRawMany();

    return allCoupons;
  }

  async getOwnedCoupons(user: Users, _userId: number, _couponType?: any, isUsed?: any) {
    if (isUsed && !isBoolean(isUsed)) {
      throw new BadRequestException('잘못된 검색 조건입니다.');
    }

    if (_couponType) {
      this.checkCouponType(_couponType);
    }

    let _usedDate = undefined;
    if (isUsed) {
      // isUsed: true - 사용한 쿠폰들만 조회
      // usedDate 가 not null 인 보유쿠폰을 조회
      _usedDate = { usedDate: Not(IsNull()) };
    } else if (isUsed === false) {
      // isUsed: false - 아직 사용하지 않은 쿠폰들만 조회
      // usedDate 가 null 인 보유쿠폰을 조회
      _usedDate = { usedDate: IsNull() };
    }

    return await this.userOwnCouponsRepository
      .createQueryBuilder('ownedCoupons')
      .leftJoin('ownedCoupons.Coupon', 'coupons')
      .leftJoin('ownedCoupons.User', 'users')
      .where('users.userId = :userId', { userId: _userId })
      .andWhere({
        ...(_couponType && { couponType: _couponType }),
        ...(_usedDate && { usedDate: _usedDate }),
      })
      .getMany();
  }
}
