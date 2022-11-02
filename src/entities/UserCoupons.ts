import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from './Users';
import { Coupons } from './Coupons';
import { Orders } from './Orders';

@Entity({ schema: 'product_shopping', name: 'userCoupons' })
export class UserCoupons {
  @PrimaryGeneratedColumn()
  userCouponId: number;

  @Column()
  IssuedDate: Date;

  @Column()
  expirationDate: Date;

  @Column('int', { primary: true, name: 'UserId' })
  UserId: number;

  @Column('int', { primary: true, name: 'CouponId' })
  CouponId: number;

  @Column('int', { primary: true, name: 'OrderId' })
  OrderId: number;

  @ManyToOne(() => Users, (users) => users.UserCoupons, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'UserId', referencedColumnName: 'userId' }])
  User: Users;

  @ManyToOne(() => Coupons, (coupons) => coupons.UserCoupons, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'CouponId', referencedColumnName: 'couponId' }])
  Coupon: Coupons;

  @ManyToOne(() => Orders, (orders) => orders.UserCoupons, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'OrderId', referencedColumnName: 'orderId' }])
  Order: Orders;
}
