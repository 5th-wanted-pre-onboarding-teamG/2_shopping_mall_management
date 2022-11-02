import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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
  salePrice: number;

  @Column()
  validPeriod: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OwnedCoupons, (ownedCoupons) => ownedCoupons.Coupon)
  OwnedCoupons: OwnedCoupons[];
}
