import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DateColumns } from './embeddeds/dateColumns';
import { CouponType } from './enums/couponType';
import { OwnedCoupons } from './OwnedCoupons';

@Entity({ schema: 'product_shopping', name: 'coupons' })
export class Coupons {
  @PrimaryGeneratedColumn({ type: 'int', name: 'couponId' })
  couponId: number;

  @Column()
  name: string;

  @Column({ type: 'enum', name: 'couponType', enum: CouponType })
  couponType: CouponType;

  @Column()
  discount: number;

  @Column()
  validPeriod: number;

  @Column(() => DateColumns, { prefix: false })
  dateColumns: DateColumns;

  @OneToMany(() => OwnedCoupons, (ownedCoupons) => ownedCoupons.Coupon)
  OwnedCoupons: OwnedCoupons[];
}
