import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from './Users';
import { Coupons } from './Coupons';
import { Orders } from './Orders';

@Entity({ schema: 'product_shopping', name: 'ownedCoupons' })
export class OwnedCoupons {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ownedCouponId' })
  ownedCouponId: number;

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

  @Column('int', { primary: true, name: 'UserId' })
  UserId: number;

  @Column('int', { primary: true, name: 'CouponId' })
  CouponId: number;

  @Column('int', { nullable: true, name: 'OrderId' })
  OrderId: number;

  @ManyToOne(() => Users, (users) => users.OwnedCoupons, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'UserId', referencedColumnName: 'userId' }])
  User: Users;

  @ManyToOne(() => Coupons, (coupons) => coupons.OwnedCoupons, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'CouponId', referencedColumnName: 'couponId' }])
  Coupon: Coupons;

  @ManyToOne(() => Orders, (orders) => orders.OwnedCoupons, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'OrderId', referencedColumnName: 'orderId' }])
  Order: Orders;
}
