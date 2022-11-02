import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DateColumns } from './embeddeds/dateColumns';
import { CouponType } from './enums/couponType';
import { OwnedCoupons } from './OwnedCoupons';

@Entity({ schema: 'product_shopping', name: 'coupons' })
export class Coupons {
  @PrimaryGeneratedColumn({ type: 'int', name: 'couponId' })
  couponId: number;

  @Column({ comment: '쿠폰 이름' })
  name: string;

  /**
   * 쿠폰 타입
   */
  @Column({ type: 'enum', name: 'couponType', enum: CouponType, comment: '쿠폰타입' })
  couponType: CouponType;

  /**
   * 쿠폰할인 가격
   * 퍼센트할인(%): 최소값 1% ~ 최댓값 100%
   * 정액제(₩): 최소값 1000원
   */
  @Column({ comment: '할인 가격(배송비, 퍼센트할인: % / 정액제: ₩)' })
  discountedPrice: number;

  /**
   * 유효기간
   */
  @Column({ comment: '쿠폰 유효기간: 하루(일) 단위' })
  validPeriod: number;

  /**
   * 데이터 생성(createAt)/수정(updateAt)/삭제(deleteAt) 일자입니다.
   * 모든 엔티티에 공통적으로 적용되는 요소입니다.
   */
  @Column(() => DateColumns, { prefix: false })
  dateColumns: DateColumns;

  @OneToMany(() => OwnedCoupons, (ownedCoupons) => ownedCoupons.Coupon)
  OwnedCoupons: OwnedCoupons[];
}
