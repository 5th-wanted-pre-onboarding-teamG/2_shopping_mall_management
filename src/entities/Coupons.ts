import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DateColumns } from './embeddeds/dateColumns';
import { CouponType } from './enums/couponType';
import { UserCoupons } from './UserCoupons';

@Entity({ schema: 'product_shopping', name: 'coupons' })
export class Coupons {
  @PrimaryGeneratedColumn()
  couponId: number;

  @Column()
  name: string;

  @Column({ type: 'enum', name: 'couponType', enum: CouponType })
  couponType: CouponType;

  @Column()
  sale: number;

  @Column(() => DateColumns, { prefix: false })
  dateColumns: DateColumns;

  @OneToMany(() => UserCoupons, (userCoupons) => userCoupons.Coupon)
  UserCoupons: UserCoupons[];
}
