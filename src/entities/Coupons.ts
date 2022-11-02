import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CouponType } from './enums/couponType';
import { OwnedCoupons } from './OwnedCoupons';

@Entity({ schema: 'product_shopping', name: 'coupons' })
export class Coupons {
  @PrimaryGeneratedColumn({ type: 'int', name: 'couponId' })
  couponId: number;

  @Column()
  name: string;

  /**
   * 쿠폰 타입
   */
  @Column({ type: 'enum', name: 'couponType', enum: CouponType })
  couponType: CouponType;

  /**
   * 쿠폰할인 가격
   * 퍼센트할인(%): 최소값 1% ~ 최댓값 100%
   * 정액제(₩): 최소값 1000원
   */
  @Column()
  salePrice: number;

  /**
   * 유효기간
   */
  @Column()
  validPeriod: number;

  /**
   * 데이터 생성(createAt)/수정(updateAt)/삭제(deleteAt) 일자입니다.
   * 모든 엔티티에 공통적으로 적용되는 요소입니다.
   */
  @Column(() => DateColumns, { prefix: false })
  dateColumns: DateColumns;

  /**
   * 사용자:쿠폰 = 1:N
   * 사용자가 보유한 쿠폰들을 의미합니다.
   */
  @OneToMany(() => OwnedCoupons, (ownedCoupons) => ownedCoupons.coupon)
  ownedCoupons: OwnedCoupons[];
}
