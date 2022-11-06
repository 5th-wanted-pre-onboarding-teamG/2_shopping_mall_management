import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { Repository, DataSource, Not, IsNull } from 'typeorm';
import { Coupons } from '../entities/Coupons';
import { CouponType } from 'src/entities/enums/couponType';
import { OwnedCoupons } from '../entities/OwnedCoupons';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { isBoolean, isEnum } from 'class-validator';
import { CreateOwnedCouponDto } from './dto/create-owned-coupon.dto';
import * as moment from 'moment-timezone';
import { GetUserOwnedCouponsRes } from './dto/get-user-owned-coupons-res.dto';
import { UseOwnedCouponDto } from './dto/use-owned-coupon.dto';
import { RestoreOwnedCouponDto } from './dto/restore-owned-coupon.dto';

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
  private readonly COUPON_EXTEND_DEFAULT_DAY = 14; // 쿠폰 2주 연장
  private readonly DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

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
    if (couponType) {
      if (!isEnum(couponType, CouponType)) {
        throw new BadRequestException('쿠폰종류가 올바르지 않습니다.');
      }
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

  async createOwnedCoupon(user: Users, newCoupon: CreateOwnedCouponDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 등록할 쿠폰이 존재하는지 확인
      const coupon = await this.couponsRepository
        .createQueryBuilder('coupons')
        .where('couponId = :couponId', { couponId: newCoupon.couponId })
        .getOne();

      if (!coupon) {
        throw new NotFoundException('해당 쿠폰은 존재하지 않습니다.');
      }

      // 2. 쿠폰발행날짜(issuedDate): 쿠폰 등록 요청 시기로 default값 으로 세팅
      const now = moment();
      const issuedDate = now.format(this.DATE_FORMAT);

      // 3. 쿠폰만료날짜(expirationDate): null -> "쿠폰발행날짜 + 쿠폰기간" 으로 변경
      const expirationDate = now.add(coupon.validPeriod, 'day').format(this.DATE_FORMAT);

      // 4. 쿠폰(Coupon)을 ownedCoupon에 등록
      await queryRunner.manager.getRepository(OwnedCoupons).save({
        issuedDate: issuedDate,
        expirationDate: expirationDate,
        UserId: user.userId,
        CouponId: newCoupon.couponId,
      });

      // 데이터베이스에 저장
      queryRunner.commitTransaction();

      // 5. 새로운 쿠폰정보를 추가한 후 현재유저 보유쿠폰 리스트를 리스폰스합니다.
      const couponList = await this.userOwnCouponsRepository
        .createQueryBuilder('ownedCoupons')
        .where('UserId = :userId', { userId: user.userId })
        .andWhere('usedDate IS NULL') // 아직 사용 안한 쿠폰
        .andWhere('( expirationDate IS NULL OR expirationDate > NOW() )') // 유효기간이 없거나, 유효기간이 만료되지 않거나
        .getMany();

      return couponList;
    } catch (error) {
      // 에러가 발생하면 롤백
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  async getUserOwnedCoupons(user: Users, couponTypes?: string): Promise<GetUserOwnedCouponsRes[]> {
    const sql = this.userOwnCouponsRepository
      .createQueryBuilder('ownedCoupons')
      .innerJoin('ownedCoupons.Coupon', 'coupons')
      .select([
        'ownedCoupons.ownedCouponId AS ownedCouponId',
        'ownedCoupons.issuedDate AS issuedDate',
        'ownedCoupons.isExtendDate  AS isExtendDate',
        'ownedCoupons.UserId AS userId',
        'coupons.couponId AS couponId',
        'coupons.name AS name',
        'coupons.couponType AS couponType',
        'coupons.discount AS discount',
        'coupons.validPeriod AS validPeriod',
        'ownedCoupons.usedDate AS usedDate',
        'ownedCoupons.expirationDate AS expirationDate',
        'ownedCoupons.OrderId AS orderId',
      ])
      .where('UserId = :userId', { userId: user.userId })
      .andWhere('usedDate IS NULL') // 아직 사용 안한 쿠폰
      .andWhere('( expirationDate IS NULL OR expirationDate > NOW() )'); // 유효기간이 없거나, 유효기간이 만료되지 않거나

    if (couponTypes) {
      const _couponTypes = couponTypes.split(',');
      const couponTypeList = _couponTypes.map((ct) => {
        const couponType = ct.trim();
        this.checkCouponType(couponType);
        return couponType;
      });

      sql.andWhere('coupons.couponType IN (:couponTypes)', { couponTypes: couponTypeList });
    }
    const couponList = await sql.getRawMany();
    return couponList;
  }

  async extendExpirationDate(user: Users, ownedCouponId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 1. 연장이 가능한 쿠폰인지 확인
      const coupon = await this.userOwnCouponsRepository
        .createQueryBuilder('ownedCoupons')
        .where('UserId = :userId', { userId: user.userId })
        .andWhere('ownedCouponId = :ownedCouponId', { ownedCouponId: ownedCouponId })
        .andWhere('isExtendDate = 0') // 아직 연장 안됐는지 확인
        .andWhere('usedDate IS NULL') // 아직 사용 안한 상태인지 확인
        .andWhere('expirationDate > NOW()') // 유효기간이 아직 남았는지 확인
        .getOne();

      if (!coupon) {
        throw new NotFoundException('사용가능한 쿠폰이 없습니다.');
      }

      // 2. expirationDate = 연장요청시작일 + COUPON_EXTEND_DEFAULT_DAY 로 변경
      // 3. isExtendDate = true 로 변경
      await queryRunner.manager.update(
        OwnedCoupons,
        { ownedCouponId: ownedCouponId, UserId: user.userId, CouponId: coupon.CouponId },
        {
          expirationDate: moment().add(this.COUPON_EXTEND_DEFAULT_DAY, 'days').format(this.DATE_FORMAT),
          isExtendDate: true,
        },
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  async useOwnedCoupon(user: Users, useOwnedCouponDto: UseOwnedCouponDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 1. 사용이 가능한 쿠폰인지 확인
      const ownedCouponId = useOwnedCouponDto.ownedCouponId;
      const coupon = await this.userOwnCouponsRepository
        .createQueryBuilder('ownedCoupons')
        .where('UserId = :userId', { userId: user.userId })
        .andWhere('ownedCouponId = :ownedCouponId', { ownedCouponId: ownedCouponId })
        .andWhere('usedDate IS NULL') // 아직 사용 안한 상태인지 확인
        .andWhere('( expirationDate IS NULL OR expirationDate > NOW() )') // 유효기간이 앖거나, 아직 남았는지 확인
        .andWhere('OrderId IS NULL') // 아직 주문이 안된상태
        .getOne();

      if (!coupon) {
        throw new NotFoundException('사용가능한 쿠폰이 없습니다.');
      }

      // 2. usedDate , orderedId 값 변경
      await queryRunner.manager.update(
        OwnedCoupons,
        { ownedCouponId: ownedCouponId, UserId: user.userId, CouponId: coupon.CouponId },
        {
          usedDate: moment().format(this.DATE_FORMAT),
          OrderId: useOwnedCouponDto.orderId,
        },
      );
      await queryRunner.commitTransaction();

      // 3. discount (할인가/ 할인 %) 리턴
      const discount = await this.userOwnCouponsRepository
        .createQueryBuilder('ownedCoupons')
        .innerJoin('ownedCoupons.Coupon', 'coupons')
        .select('discount')
        .where('ownedCouponId = :ownedCouponId', { ownedCouponId: ownedCouponId })
        .getRawOne();

      return discount;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  async restoreOwnedCouponByCancelOrder(
    user: Users,
    restoreOwnedCouponDto: RestoreOwnedCouponDto,
  ): Promise<GetUserOwnedCouponsRes[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 1. 사용이 가능한 쿠폰인지 확인
      const ownedCouponId = restoreOwnedCouponDto.ownedCouponId;
      const orderId = restoreOwnedCouponDto.orderId;

      const coupon = await this.userOwnCouponsRepository
        .createQueryBuilder('ownedCoupons')
        .where('UserId = :userId', { userId: user.userId })
        .andWhere('ownedCouponId = :ownedCouponId', { ownedCouponId: ownedCouponId })
        .andWhere('( expirationDate IS NULL OR expirationDate > NOW() )') // 유효기간이 없거나, 아직 남았는지 확인
        .andWhere('OrderId = :orderId', { orderId: orderId }) // 취소주문번호
        .getOne();

      if (!coupon) {
        throw new NotFoundException('사용가능한 쿠폰이 없습니다.');
      }

      // 2. usedDate , orderedId 값 변경
      await queryRunner.manager.update(
        OwnedCoupons,
        { ownedCouponId: ownedCouponId, UserId: user.userId, CouponId: coupon.CouponId },
        {
          usedDate: null,
          OrderId: null,
        },
      );
      await queryRunner.commitTransaction();

      // 3. 사용가능한 쿠폰 조회
      const couponList = await this.userOwnCouponsRepository
        .createQueryBuilder('ownedCoupons')
        .innerJoin('ownedCoupons.Coupon', 'coupons')
        .select([
          'ownedCoupons.ownedCouponId AS ownedCouponId',
          'ownedCoupons.issuedDate AS issuedDate',
          'ownedCoupons.isExtendDate  AS isExtendDate',
          'ownedCoupons.UserId AS userId',
          'coupons.couponId AS couponId',
          'coupons.name AS name',
          'coupons.couponType AS couponType',
          'coupons.discount AS discount',
          'coupons.validPeriod AS validPeriod',
          'ownedCoupons.usedDate AS usedDate',
          'ownedCoupons.expirationDate AS expirationDate',
          'ownedCoupons.OrderId AS orderId',
        ])
        .where('UserId = :userId', { userId: user.userId })
        .andWhere('usedDate IS NULL') // 아직 사용 안한 쿠폰
        .andWhere('( expirationDate IS NULL OR expirationDate > NOW() )') // 유효기간이 없거나, 유효기간이 만료되지 않거나
        .getRawMany();

      return couponList;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
