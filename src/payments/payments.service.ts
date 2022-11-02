import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Payments } from '../entities/Payments';
import { Orders } from '../entities/Orders';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Products } from '../entities/Products';
import { ResultUserPayments } from './dto/result-user-payments.dto';
import { SearchPayments } from './dto/search-payments';
import { DeliveryCosts } from '../entities/DeliveryCosts';
import { UserCoupons } from '../entities/UserCoupons';
import { Coupons } from '../entities/Coupons';
import { PaymentState } from '../entities/enums/paymentState';
import { OrderState } from '../entities/enums/orderState';
import { calculatePaymentPrice, calculateSalePrice } from './payments.calculate';
import { ResultPaymentsDto } from './dto/result-payments.dto';
import { wrapTransaction } from '../common/transaction';
import { Countries } from '../entities/Countries';

@Injectable()
export class PaymentsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Payments)
    private readonly paymentsRepository: Repository<Payments>,
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(UserCoupons)
    private readonly userCouponsRepository: Repository<UserCoupons>,
  ) {}

  /**
   * 결제 내역 등록
   * @param createPaymentDto 결제 등록에 필요한 정보
   * @param user 유저 정보
   */
  async createPayment(createPaymentDto: CreatePaymentDto, user: Users) {
    await wrapTransaction(this.dataSource, async (entityManager: EntityManager) => {
      const orderId = createPaymentDto.orderId;
      const existsOrder: { quantity: number; productPrice: number; deliveryPrice: number; countryCode: string } =
        await entityManager
          .getRepository(Orders)
          .createQueryBuilder('orders')
          .innerJoinAndSelect(Products, 'products')
          .innerJoinAndSelect(DeliveryCosts, 'deliveryCosts')
          .innerJoinAndSelect(Countries, 'countries', 'deliveryCosts.countryId = countries.countryId')
          .select([
            'orders.quantity',
            'products.price as productPrice',
            'deliveryCosts.price as deliveryPrice',
            'countries.countryCode',
          ])
          .where('orders.orderId = :orderId', { orderId })
          .getRawOne();

      if (!existsOrder) {
        throw new NotFoundException('주문 정보를 찾을 수 없습니다.');
      }

      const userCoupons = await entityManager
        .getRepository(UserCoupons)
        .createQueryBuilder('usersCoupons')
        .innerJoinAndSelect(Coupons, 'coupons')
        .select(['usersCoupons.usersCouponId', 'coupons.couponType', 'coupons.sale'])
        .where('usersCoupons.orderId = :orderId', { orderId })
        .getOne();

      const { quantity, productPrice, deliveryPrice, countryCode } = existsOrder;
      const { couponType, sale } = userCoupons.coupon;
      const totalProductPrice = productPrice * quantity;
      let salePrice = calculateSalePrice(totalProductPrice, deliveryPrice, couponType, sale, countryCode);
      let paymentPrice = calculatePaymentPrice(totalProductPrice, deliveryPrice, salePrice, countryCode);

      await entityManager.getRepository(Payments).insert({
        paymentState: PaymentState.COMPLETE,
        salePrice,
        paymentPrice,
        order: existsOrder,
        // user,    TODO - 엔티티 변경후 추가
      });

      await entityManager.getRepository(Orders).update(orderId, {
        orderState: OrderState.PAYMENT_COMPLETE,
      });

      await entityManager.getRepository(UserCoupons).update(userCoupons.userCouponId, {
        order: existsOrder,
      });
    });
  }

  /**
   * 유저의 개인 결제 내역 조회
   * @param user 유저 정보
   */
  async getPaymentsByUser(user: Users): Promise<ResultUserPayments> {
    const payments = await this.paymentsRepository
      .createQueryBuilder('payments')
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
   * @param searchPayment 검색어, 페이지 등 검색 조건
   */
  async getPaymentsBySearch(searchPayment: SearchPayments): Promise<ResultPaymentsDto> {
    const { search = '', page = 1, pageSize = 10, startDate, endDate } = searchPayment;

    const queryBuilder = this.paymentsRepository
      .createQueryBuilder('payments')
      .innerJoinAndSelect(Users, 'users', 'payments.userId = users.orderId')
      .select([
        'payments.paymentId',
        'payments.createAt as paymentCreateAt',
        'payments.paymentPrice',
        'payments.paymentState',
        'users.name as userName',
      ])
      .where('users.name = :username', { username: `%${search}%` });

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
