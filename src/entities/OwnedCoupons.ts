import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from './Users';
import { Coupons } from './Coupons';
import { Orders } from './Orders';

@Entity({ schema: 'product_shopping', name: 'ownedCoupons' })
export class OwnedCoupons {
  @PrimaryGeneratedColumn()
  userCouponId: number;

  /**
   * 쿠폰 발행 날짜
   */
  @Column({ type: 'timestamp', nullable: false, default: () => "DATE_FORMAT(CURRENT_TIMESTAMP,'%Y-%m-%d')" })
  issuedDate: Date;

  /**
   * 쿠폰 사용 날짜
   */
  @Column({ type: 'timestamp', default: () => "DATE_FORMAT(CURRENT_TIMESTAMP,'%Y-%m-%d')" })
  usedDate: Date;

  /**
   * 쿠폰 만료 날짜
   */
  @Column({ nullable: false })
  expirationDate: Date;

  /**
   * 만료기간 연장
   */
  @Column({ default: false, nullable: false })
  isExtendDate: boolean;

  /**
   * 쿠폰 사용자(유저)
   * 쿠폰:유저 = N:1
   */
  @ManyToOne(() => Users, (users) => users.ownedCoupons)
  user: Users;

  /**
   * 갖고 있는 쿠폰
   * 보유쿠폰:쿠폰 = 1:N
   */
  @ManyToOne(() => Coupons, (coupons) => coupons.ownedCoupons)
  coupon: Coupons;

  /**
   * 보유쿠폰:주문 = N:1
   */
  @ManyToOne(() => Orders, (orders) => orders.ownedCoupons)
  order: Orders;
}
