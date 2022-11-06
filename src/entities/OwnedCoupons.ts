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
  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'NOW()',
    comment: '사용자가 쿠폰 발행한 날짜',
  })
  issuedDate: Date;

  /**
   * 쿠폰 사용 날짜
   * 기본값: null
   * 사용시: null -> 쿠폰사용 요청 시각
   */
  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => null,
    comment: '쿠폰 사용날짜 (기본: null / 쿠폰사용시: 사용날짜)',
  })
  usedDate: Date;

  /**
   * 쿠폰 만료 날짜
   */
  @Column({
    type: 'timestamp',
    nullable: true,
    default: () => null,
    comment:
      '쿠폰 만료날짜 (기본, 쿠폰생성시: null / 쿠폰발행시: 쿠폰발행날짜 + 유효기간 / 쿠폰연장시: 쿠폰연장날짜 + 14일)',
  })
  expirationDate: Date;

  /**
   * 만료기간 연장
   */
  @Column({ default: false, nullable: false, comment: '쿠폰 만료기간 연장여부 (기본: false / 연장: true)' })
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
