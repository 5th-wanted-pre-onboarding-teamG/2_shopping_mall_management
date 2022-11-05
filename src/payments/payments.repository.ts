import { Injectable } from '@nestjs/common';
import { Payments } from '../entities/Payments';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Orders } from '../entities/Orders';
import { Products } from '../entities/Products';
import { DeliveryCosts } from '../entities/DeliveryCosts';
import { Countries } from '../entities/Countries';
import { OrderState } from '../entities/enums/orderState';
import { OwnedCoupons } from '../entities/OwnedCoupons';
import { Coupons } from '../entities/Coupons';
import { Users } from '../entities/Users';
import { ResultUserPayments } from './dto/result-user-payments.dto';
import { SearchPayments } from './dto/search-payments';
import { ResultPaymentsDto } from './dto/result-payments.dto';
import { ResultExistsOrderDto } from './dto/result-existsOrder.dto';
import { ResultExistsOwnedCouponDto } from './dto/result-existsOwnedCoupon.dto';

@Injectable()
export class PaymentsRepository extends Repository<Payments> {
  constructor(private readonly dataSource: DataSource) {
    const baseRepository = dataSource.getRepository<Payments>(Payments);
    super(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
  }

  /**
   * 결제 진행을 위한 주문 조회
   * @param entityManager 엔티티 매니저
   * @param orderId 주문 Id
   */
  async getOrderById(entityManager: EntityManager, orderId: number): Promise<ResultExistsOrderDto> {
    return entityManager
      .getRepository(Orders)
      .createQueryBuilder('orders')
      .innerJoinAndSelect(Products, 'products')
      .innerJoinAndSelect(DeliveryCosts, 'deliveryCosts')
      .innerJoinAndSelect(Countries, 'countries', 'deliveryCosts.countryId = countries.countryId')
      .select([
        'orders.quantity as quantity',
        'products.price as productPrice',
        'deliveryCosts.price as deliveryPrice',
        'countries.countryCode as countryCode',
      ])
      .where('orders.orderId = :orderId', { orderId })
      .andWhere('orders.orderState = :orderState', { orderState: OrderState.PAYMENT_WAITING })
      .getRawOne();
  }

  /**
   * 결제 계산에 적용하기 위한 회원의 보유 쿠폰 조회
   * @param entityManager 엔티티 매니저
   * @param ownedCouponId 결제에 사용할 회원의 보유 쿠폰 Id
   */
  async getOwnedCouponById(entityManager: EntityManager, ownedCouponId: number): Promise<ResultExistsOwnedCouponDto> {
    return await entityManager
      .getRepository(OwnedCoupons)
      .createQueryBuilder('ownedCoupons')
      .innerJoinAndSelect(Coupons, 'coupons')
      .select([
        'ownedCoupons.ownedCouponId as ownedCouponId',
        'coupons.couponType as couponType',
        'coupons.discount as discount',
      ])
      .where('ownedCoupons.ownedCouponId = :ownedCouponId', { ownedCouponId })
      .getRawOne();
  }

  /**
   * 사용자의 결제 내역 조회
   * @param user 사용자 정보
   */
  async getPaymentsByUser(user: Users): Promise<ResultUserPayments> {
    const payments = await this.createQueryBuilder('payments')
      .innerJoinAndSelect(Orders, 'orders', 'payments.orderId = orders.orderId')
      .innerJoinAndSelect(Products, 'products', 'orders.productId = products.productId')
      .select([
        'payments.createAt as paymentCreateAt',
        'payments.salePrice',
        'payments.paymentPrice',
        'payments.paymentState',
        'products.name as productName',
        'products.price as productPrice',
        'orders.quantity',
      ])
      .where({ user })
      .getRawMany();

    return { payments };
  }

  /**
   * 결제 내역 검색 조회
   * @param searchPayment 검색 정보
   */
  async getPaymentsBySearch(searchPayment: SearchPayments): Promise<ResultPaymentsDto> {
    const { keyword = '', page = 1, pageSize = 10, startDate, endDate } = searchPayment;

    const queryBuilder = this.createQueryBuilder('payments')
      .innerJoinAndSelect(Users, 'users', 'payments.userId = users.orderId')
      .select([
        'payments.paymentId',
        'payments.createAt as paymentCreateAt',
        'payments.paymentPrice',
        'payments.paymentState',
        'users.name as userName',
      ])
      .where('users.name = :username', { username: `%${keyword}%` });

    if (startDate) {
      queryBuilder.andWhere("DATE_FORMAT(payments.createAt, '%Y-%m-%d') >= DATE_FORMAT(:startDate, '%Y-%m-%d')", {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder.andWhere("DATE_FORMAT(payments.createAt, '%Y-%m-%d') <= DATE_FORMAT(:endDate, '%Y-%m-%d')", {
        endDate,
      });
    }

    const payments = await queryBuilder
      .take(pageSize)
      .skip(pageSize * (page - 1))
      .orderBy('payments.paymentId', 'DESC')
      .getRawMany();
    return { payments };
  }
}
