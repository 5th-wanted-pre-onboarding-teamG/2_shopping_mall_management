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

  @Column('int', { primary: true, name: 'OrderId' })
  OrderId: number;

  @ManyToOne(() => Users, (users) => users.userCoupons)
  user: Users;

  @ManyToOne(() => Coupons, (coupons) => coupons.userCoupons)
  coupon: Coupons;

  @ManyToOne(() => Orders, (orders) => orders.UserCoupons, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'OrderId', referencedColumnName: 'orderId' }])
  Order: Orders;
}
