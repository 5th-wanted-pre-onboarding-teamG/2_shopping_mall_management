import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Payments } from '../entities/Payments';
import { Orders } from '../entities/Orders';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ResultUserPayments } from './dto/result-user-payments.dto';
import { SearchPayments } from './dto/search-payments';
import { PaymentState } from '../entities/enums/paymentState';
import { OrderState } from '../entities/enums/orderState';
import { calculatePaymentPrice, calculateSalePrice, correctionDollar } from './payments.calculate';
import { ResultPaymentsDto } from './dto/result-payments.dto';
import { wrapTransaction } from '../common/transaction';
import { OwnedCoupons } from '../entities/OwnedCoupons';
import { OrderNotFoundException } from '../exception/orders.exception';
import { PaymentsRepository } from './payments.repository';
import { ResultExistsOrderDto } from './dto/result-existsOrder.dto';
import { ResultExistsOwnedCouponDto } from './dto/result-existsOwnedCoupon.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private dataSource: DataSource,
    private readonly paymentsRepository: PaymentsRepository,
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(OwnedCoupons)
    private readonly ownedCouponsRepository: Repository<OwnedCoupons>,
  ) {}

  /**
   * 결제 내역 등록
   * @param createPaymentDto 결제 등록에 필요한 정보
   * @param user 유저 정보
   */
  async createPayment(createPaymentDto: CreatePaymentDto, user: Users) {
    await wrapTransaction(this.dataSource, async (entityManager: EntityManager) => {
      const orderId = createPaymentDto.orderId;
      // 결제할 주문 확인
      const existsOrder: ResultExistsOrderDto = await this.paymentsRepository.getOrderById(entityManager, orderId);

      if (!existsOrder) {
        throw new OrderNotFoundException();
      }

      // 사용할 쿠폰 확인
      const ownedCouponId = createPaymentDto.ownedCouponId;
      const ownedCoupons: ResultExistsOwnedCouponDto = await this.paymentsRepository.getOwnedCouponById(
        entityManager,
        ownedCouponId,
      );

      // 결제 정보에 저장할 금액 게산
      const { quantity, productPrice, deliveryPrice, countryCode } = existsOrder;
      const couponType = ownedCoupons?.couponType;
      const discount = ownedCoupons?.discount;
      const totalProductPrice = correctionDollar(productPrice * quantity, countryCode);
      const correctionDeliveryPrice = correctionDollar(deliveryPrice, countryCode);
      const paymentSalePrice = calculateSalePrice(totalProductPrice, correctionDeliveryPrice, couponType, discount);
      const paymentPrice = calculatePaymentPrice(totalProductPrice, correctionDeliveryPrice, paymentSalePrice);

      // 결제 정보 등록
      await entityManager.getRepository(Payments).insert({
        paymentState: PaymentState.COMPLETE,
        orderPrice: totalProductPrice + correctionDeliveryPrice,
        discountedPrice: paymentSalePrice,
        paymentPrice,
        Order: existsOrder,
        User: user,
      });

      // 주문의 상태를 결제 완료로 변경
      await entityManager
        .getRepository(Orders)
        .createQueryBuilder()
        .update(Orders)
        .set({ orderState: OrderState.PAYMENT_COMPLETE })
        .where('orderId = :orderId', { orderId })
        .execute();

      // 쿠폰을 사용 상태로 변경
      await entityManager
        .getRepository(OwnedCoupons)
        .createQueryBuilder()
        .update(OwnedCoupons)
        .set({ OrderId: orderId, usedDate: new Date() })
        .where('ownedCouponId = :ownedCouponId', { ownedCouponId })
        .execute();
    });
  }

  /**
   * 유저의 개인 결제 내역 조회
   * @param user 유저 정보
   */
  async getPaymentsByUser(user: Users): Promise<ResultUserPayments> {
    return this.paymentsRepository.getPaymentsByUser(user);
  }

  /**
   * 결제 내역 검색 조회
   * @param searchPayment 검색어, 페이지 등 검색 조건
   */
  async getPaymentsBySearch(searchPayment: SearchPayments): Promise<ResultPaymentsDto> {
    return this.paymentsRepository.getPaymentsBySearch(searchPayment);
  }
}
