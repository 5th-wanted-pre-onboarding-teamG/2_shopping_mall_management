import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToOne(() => Users, (users) => users.userCoupons)
  user: Users;

  @ManyToOne(() => Coupons, (coupons) => coupons.userCoupons)
  coupon: Coupons;

  @ManyToOne(() => Orders, (orders) => orders.userCoupons)
  order: Orders;
}
